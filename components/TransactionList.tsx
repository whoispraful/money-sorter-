import React from 'react';
import { Transaction } from '../types';
import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, Download, FileText, Globe } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onExport: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onExport }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="text-base text-slate-500 mt-1">Found {transactions.length} items across all documents.</p>
        </div>
        <button
          onClick={onExport}
          className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm shadow-lg shadow-blue-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="min-w-full divide-y divide-slate-100 relative">
          <thead className="bg-white sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-extrabold text-slate-400 uppercase tracking-wider">Original</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-50/30">USD Equiv.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-semibold font-mono">
                  {t.date}
                </td>
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-900 text-base">{t.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                      {t.notes && (
                        <div className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          {t.notes}
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1 text-xs text-slate-400" title={t.sourceFile}>
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{t.sourceFile}</span>
                       </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {t.category || 'General'}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end gap-2 text-lg font-bold ${t.amount < 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                    {Math.abs(t.amount).toLocaleString('en-US', { style: 'currency', currency: t.currency || 'USD' })}
                  </div>
                  {t.currency && t.currency !== 'USD' && (
                      <div className="text-xs font-bold text-slate-400 mt-1 flex justify-end items-center gap-1">
                          <Globe className="w-3 h-3" /> {t.currency}
                      </div>
                  )}
                </td>
                 <td className="px-6 py-5 whitespace-nowrap text-right bg-indigo-50/10 group-hover:bg-indigo-50/30 transition-colors">
                  <div className={`flex items-center justify-end gap-1 font-bold text-sm ${t.amountInUSD < 0 ? 'text-slate-500' : 'text-emerald-500'}`}>
                    {t.amountInUSD < 0 ? (
                       <ArrowDownCircle className="w-4 h-4" />
                    ) : (
                       <ArrowUpCircle className="w-4 h-4" />
                    )}
                    ${Math.abs(t.amountInUSD).toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;