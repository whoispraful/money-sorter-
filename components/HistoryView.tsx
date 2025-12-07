import React from 'react';
import { HistoricalBatch } from '../types';
import { Calendar, FileText, ArrowUpRight, ArrowDownLeft, Trash2, ArrowLeft } from 'lucide-react';

interface HistoryViewProps {
  history: HistoricalBatch[];
  onClearHistory: () => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onBack }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center animate-in fade-in duration-500">
        <div className="w-full flex justify-start mb-4 md:hidden">
            <button onClick={onBack} className="flex items-center text-gray-500 font-medium">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
            </button>
        </div>
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <HistoryIcon className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No History Yet</h3>
        <p className="text-gray-500 max-w-sm text-lg mb-8">
          Your saved reports will appear here.
        </p>
        <button 
            onClick={onBack}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
        >
            Start New Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      
      <div className="md:hidden">
          <button onClick={onBack} className="flex items-center text-gray-600 font-bold mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">History Archive</h2>
           <p className="text-gray-500 text-lg mt-1">{history.length} Saved Reports</p>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center justify-center px-6 py-3 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl transition-all font-bold border border-red-200 hover:border-red-600 shadow-sm"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.map((batch) => (
          <div key={batch.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex items-start gap-5">
                <div className="bg-indigo-100 p-4 rounded-xl hidden sm:block">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">
                    {new Date(batch.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                     <span className="inline-flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                       <FileText className="w-4 h-4 mr-2" />
                       {batch.summary.processedFiles} Documents
                     </span>
                     <span className="inline-flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                       {batch.transactionCount} Transactions
                     </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0">
                 <div className="text-center lg:text-right">
                    <div className="text-sm font-semibold text-gray-500 flex items-center justify-center lg:justify-end gap-1 mb-1">
                       Income <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg">
                       +${batch.summary.totalCreditsUSD.toFixed(2)}
                    </div>
                 </div>
                 <div className="text-center lg:text-right border-l border-r lg:border-r-0 border-gray-100 px-2">
                    <div className="text-sm font-semibold text-gray-500 flex items-center justify-center lg:justify-end gap-1 mb-1">
                       Expense <ArrowUpRight className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg">
                       ${Math.abs(batch.summary.totalDebitsUSD).toFixed(2)}
                    </div>
                 </div>
                 <div className="text-center lg:text-right lg:pl-6 lg:border-l border-gray-100">
                    <div className="text-sm font-semibold text-gray-500 mb-1">Net (USD)</div>
                    <div className={`font-bold text-xl ${batch.summary.netFlowUSD >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                       {batch.summary.netFlowUSD >= 0 ? '+' : ''}${Math.abs(batch.summary.netFlowUSD).toFixed(2)}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
);

export default HistoryView;