import React, { useState, useEffect } from 'react';
import { RefreshCw, Menu, Globe, Wallet } from 'lucide-react';
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

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });

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


  const handleLogin = (name: string) => {
    const newUser = { name, joinedAt: new Date().toISOString() };
    setUser(newUser);
    localStorage.setItem('ocr_user', JSON.stringify(newUser));
    showToast(`Welcome back, ${name}`, 'success');
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
        setFileQueue(prev => prev.map(f => f.id === tracker.id ? { ...f, status: 'ERROR', errorMessage: error.message } : f));
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
    link.setAttribute('download', `money_sorter_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <LoginScreen onLogin={handleLogin} />
      </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmationModal isOpen={modal.isOpen} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} isDestructive={modal.isDestructive} />
      
      <Sidebar currentView={currentView} onChangeView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} userName={user.name} onLogout={handleLogout} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full glass-panel border-b border-slate-200 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
         <span className="font-extrabold text-xl text-indigo-700 flex items-center gap-2">
            <Wallet className="w-6 h-6" /> Money Sorter
         </span>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-700"><Menu className="w-8 h-8" /></button>
      </div>
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-8 animate-in slide-in-from-top-10">
           <button onClick={() => { setCurrentView('upload'); setIsSidebarOpen(false); }} className="block w-full text-left py-6 text-2xl font-bold border-b border-slate-100">Dashboard</button>
           <button onClick={() => { setIsSidebarOpen(false); handleLogout(); }} className="block w-full text-left py-6 text-2xl font-bold text-red-600 mt-4">Sign Out</button>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 md:pt-10 pt-24 overflow-y-auto h-screen">
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Financial Overview</h1>
                <div className="flex items-center gap-2 mt-2 text-slate-500 text-lg">
                   <Globe className="w-4 h-4" />
                   <span>Multi-currency Analysis Active</span>
                </div>
              </div>
              {processedStatements.length > 0 && (
                 <button onClick={handleReset} className="flex items-center px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95" disabled={isProcessing}>
                    <RefreshCw className={`w-5 h-5 mr-3 ${isProcessing ? 'animate-spin' : ''}`} />
                    {isProcessing ? 'Working...' : 'New Scan'}
                 </button>
               )}
            </div>

            {processedStatements.length === 0 && !isProcessing && (
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 md:p-14 shadow-xl text-center text-white relative overflow-hidden mb-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Drop your statements here</h2>
                    <p className="text-indigo-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                      We automatically extract data from PDFs and images, convert foreign currencies to USD, and organize everything for you.
                    </p>
                  </div>
               </div>
            )}

            <FileUpload onFileUpload={handleBatchUpload} isProcessing={isProcessing} />

            <div className="flex flex-col xl:flex-row gap-8 items-start pb-20">
              {fileQueue.length > 0 && (
                <div className="w-full xl:w-1/3 xl:sticky xl:top-6 animate-in slide-in-from-left duration-500">
                  <FileStatusList files={fileQueue} />
                </div>
              )}
              {processedStatements.some(s => s.isValid) && (
                <div className="w-full xl:w-2/3 space-y-8 animate-in slide-in-from-right duration-500">
                   <StatsChart transactions={allTransactions} summary={currentBatchSummary} />
                   <TransactionList transactions={allTransactions} onExport={handleExportAllCSV} />
                </div>
              )}
            </div>
          </>
      </main>
    </div>
  );
};

export default App;