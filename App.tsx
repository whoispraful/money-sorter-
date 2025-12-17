import React, { useState, useEffect } from 'react';
import { RefreshCw, Menu, Globe, Wallet, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TransactionList from './components/TransactionList';
import StatsChart from './components/StatsChart';
import FileStatusList from './components/FileStatusList';
import Toast, { ToastType } from './components/Toast';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ConfirmationModal from './components/ConfirmationModal';
import { parseStatement } from './services/geminiService';
import { StatementData, FileTracker, BatchSummary, UserProfile } from './types';
import { hasValidKey } from './config';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive: boolean;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'upload'>('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [fileQueue, setFileQueue] = useState<FileTracker[]>([]);
  const [processedStatements, setProcessedStatements] = useState<StatementData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });

  // Initial check for API Key
  useEffect(() => {
    // Check if key is available
    const hasStaticKey = hasValidKey();
    const win = window as any;
    const hasDynamicProvider = !!win.aistudio;

    if (!hasStaticKey && !hasDynamicProvider) {
        setIsApiKeyMissing(true);
    } else {
        setIsApiKeyMissing(false);
    }
  }, []);

  // Load Data
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ocr_user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedSession = localStorage.getItem('ocr_session_statements');
      if (storedSession) setProcessedStatements(JSON.parse(storedSession));
    } catch (error) {
      console.error("Storage Error", error);
    }
  }, []);

  // Save Session
  useEffect(() => {
    try {
      localStorage.setItem('ocr_session_statements', JSON.stringify(processedStatements));
    } catch (error) { console.error("Save Session Error", error); }
  }, [processedStatements]);

  const handleLogin = async (name: string) => {
    // Check if key is missing (unless we just added it, in which case a reload would have happened via config.ts)
    if (isApiKeyMissing && !hasValidKey()) {
        showToast("Please enter an API Key to continue.", "error");
        return;
    }
    
    // Dynamic check for AI Studio environment if needed
    const win = window as any;
    if (win.aistudio && !hasValidKey()) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
             try {
                await win.aistudio.openSelectKey();
             } catch (e) {
                console.error(e);
                showToast("Failed to connect API key", "error");
                return;
             }
        }
    }

    const newUser = { name, joinedAt: new Date().toISOString() };
    setUser(newUser);
    localStorage.setItem('ocr_user', JSON.stringify(newUser));
    showToast(`Welcome back, ${name}`, 'success');
  };

  const handleManualKeyConnect = async () => {
    const win = window as any;
    if (win.aistudio) {
      try {
        await win.aistudio.openSelectKey();
        showToast("API Key settings opened", "info");
      } catch (e) {
        showToast("Failed to open key settings", "error");
      }
    }
  };

  const handleLogout = () => {
    setModal({
      isOpen: true,
      title: 'Sign Out',
      message: 'Are you sure? This will clear your current workspace.',
      isDestructive: true,
      onConfirm: () => {
        setUser(null);
        localStorage.clear();
        setFileQueue([]);
        setProcessedStatements([]);
        // Optional: reload to clear memory of keys
        window.location.reload();
      }
    });
  };

  const allTransactions = processedStatements.filter(s => s.isValid).flatMap(s => s.transactions);
  
  const currentBatchSummary: BatchSummary = {
    totalFiles: fileQueue.length,
    processedFiles: processedStatements.filter(s => s.isValid).length,
    totalCreditsUSD: processedStatements.reduce((sum, s) => sum + s.summary.totalCredits, 0),
    totalDebitsUSD: processedStatements.reduce((sum, s) => sum + s.summary.totalDebits, 0),
    netFlowUSD: processedStatements.reduce((sum, s) => sum + s.summary.netFlow, 0),
  };

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  const handleReset = () => {
    const doReset = () => {
        setFileQueue([]);
        setProcessedStatements([]);
        localStorage.removeItem('ocr_session_statements');
        setIsProcessing(false);
        showToast("Ready for new files", "success");
    };

    setModal({
        isOpen: true,
        title: 'Start New Batch?',
        message: 'This will clear all current charts and data to start fresh.',
        isDestructive: true,
        onConfirm: () => {
            doReset();
        }
    });
  };

  const handleBatchUpload = async (files: FileList) => {
    const incomingFiles = Array.from(files);
    const newUniqueFiles: File[] = [];
    
    incomingFiles.forEach((file) => {
      const isDuplicate = fileQueue.some(existing => existing.file.name === file.name && existing.file.size === file.size);
      if (!isDuplicate) newUniqueFiles.push(file);
    });

    if (newUniqueFiles.length === 0) {
        if (incomingFiles.length > 0) showToast("Files already in queue", "info");
        return;
    }

    const newTrackers: FileTracker[] = newUniqueFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'PENDING'
    }));

    setFileQueue(prev => [...newTrackers, ...prev]); 
    setIsProcessing(true);

    for (const tracker of newTrackers) {
      setFileQueue(prev => prev.map(f => f.id === tracker.id ? { ...f, status: 'PROCESSING' } : f));

      try {
        const result = await parseStatement(tracker.file);
        
        const statementWithId: StatementData = {
          ...result,
          id: tracker.id,
          transactions: result.isValid ? result.transactions.map(t => ({ ...t, sourceFile: tracker.file.name })) : []
        };
        
        setProcessedStatements(prev => [...prev, statementWithId]);
        setFileQueue(prev => prev.map(f => f.id === tracker.id ? { 
            ...f, 
            status: result.isValid ? 'COMPLETE' : 'ERROR',
            errorMessage: result.isValid ? undefined : result.validationError
        } : f));

      } catch (error: any) {
        console.error("Processing Error:", error);
        let errorMsg = error.message;
        
        // Friendly Error Mapping
        if (errorMsg.includes("API Key")) errorMsg = "API Key Invalid";
        if (errorMsg.includes("403")) errorMsg = "Check API Key Permissions";

        setFileQueue(prev => prev.map(f => f.id === tracker.id ? { ...f, status: 'ERROR', errorMessage: errorMsg } : f));
        
        if (error.message.includes("API Key")) {
            showToast("Critical: API Key configuration error.", "error");
        }
      }
    }
    setIsProcessing(false);
  };

  const handleExportAllCSV = () => {
    if (allTransactions.length === 0) return;
    const headers = ['Date', 'Description', 'Original Amount', 'Currency', 'Amount (USD)', 'Category', 'Source'];
    const csvContent = [
      headers.join(','),
      ...allTransactions.map(t => {
        const safeDesc = `"${t.description.replace(/"/g, '""')}"`;
        const safeSource = `"${(t.sourceFile || '').replace(/"/g, '""')}"`;
        return `${t.date},${safeDesc},${t.amount},${t.currency},${t.amountInUSD},"${t.category}",${safeSource}`;
      })
    ].join('\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', `expense_sorter_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        {/* Only show overlay if missing AND not in the process of logging in/setting key */}
        {isApiKeyMissing && !hasValidKey() && (
            <div className="fixed top-0 left-0 w-full bg-orange-600 text-white text-center py-2 px-4 z-[60] text-sm font-bold shadow-md">
               ⚠️ Setup Required: Please enter your Google API Key below.
            </div>
        )}

        <LoginScreen 
          onLogin={handleLogin} 
          onConnectKey={handleManualKeyConnect} 
          hasApiKeyProvider={!!(window as any).aistudio}
          isApiKeyMissing={isApiKeyMissing}
        />
      </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-100/50 rounded-full blur-[100px]" />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmationModal isOpen={modal.isOpen} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} isDestructive={modal.isDestructive} />
      
      <Sidebar currentView={currentView} onChangeView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} userName={user.name} onLogout={handleLogout} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full glass-panel border-b border-slate-200 z-30 px-4 h-16 flex items-center justify-between shadow-sm bg-white/80">
         <span className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 rounded-lg text-white">
               <Wallet className="w-5 h-5" /> 
            </div>
            Expense Sorter
         </span>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"><Menu className="w-7 h-7" /></button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-8 animate-in slide-in-from-top-10 flex flex-col gap-4">
           <button onClick={() => { setCurrentView('upload'); setIsSidebarOpen(false); }} className="block w-full text-left py-4 px-6 text-xl font-bold bg-slate-50 rounded-2xl">Dashboard</button>
           <button onClick={() => { setIsSidebarOpen(false); handleLogout(); }} className="block w-full text-left py-4 px-6 text-xl font-bold text-red-600 bg-red-50 rounded-2xl mt-auto mb-8">Sign Out</button>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 md:pt-10 pt-24 overflow-y-auto h-screen relative z-10">
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in slide-in-from-top-5 duration-700">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    Overview 
                    <span className="text-base font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 align-middle mt-1 hidden sm:inline-flex">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Active
                    </span>
                </h1>
                <div className="flex items-center gap-2 mt-3 text-slate-500 font-medium text-lg">
                   <Globe className="w-4 h-4 text-indigo-500" />
                   <span>Global Currency Normalization</span>
                </div>
              </div>
              {processedStatements.length > 0 && (
                 <button onClick={handleReset} className="flex items-center px-6 py-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 group" disabled={isProcessing}>
                    <RefreshCw className={`w-5 h-5 mr-3 ${isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {isProcessing ? 'Working...' : 'New Analysis'}
                 </button>
               )}
            </div>

            {processedStatements.length === 0 && !isProcessing && (
               <div className="group relative rounded-[2.5rem] p-10 md:p-16 text-center text-white overflow-hidden mb-12 shadow-2xl transition-all hover:scale-[1.01] duration-500">
                  {/* Creative Background for Hero */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                      Financial Clarity in Seconds
                    </h2>
                    <p className="text-indigo-100 mb-10 text-lg md:text-xl leading-relaxed font-medium">
                      Drag & drop your bank statements, receipts, or invoices. We'll use AI to extract, categorize, and convert everything to USD instantly.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-bold opacity-80">
                        <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">PDF & Images</span>
                        <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Auto-Currency</span>
                        <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Spending Insights</span>
                    </div>
                  </div>
               </div>
            )}

            <FileUpload onFileUpload={handleBatchUpload} isProcessing={isProcessing} />

            <div className="flex flex-col xl:flex-row gap-8 items-start pb-20">
              {fileQueue.length > 0 && (
                <div className="w-full xl:w-1/3 xl:sticky xl:top-6 animate-in slide-in-from-left duration-700 delay-100">
                  <FileStatusList files={fileQueue} />
                </div>
              )}
              {processedStatements.some(s => s.isValid) && (
                <div className="w-full xl:w-2/3 space-y-8 animate