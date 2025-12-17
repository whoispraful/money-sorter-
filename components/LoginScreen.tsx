import React, { useState } from 'react';
import { ScanLine, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      await onLogin(name.trim());
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 md:p-16 text-center animate-in fade-in zoom-in duration-700 relative z-10">
        
        <div className="mb-8 flex justify-center relative">
             <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-6 rounded-3xl shadow-lg relative z-10 rotate-3 hover:rotate-6 transition-transform duration-500">
                <ScanLine className="w-16 h-16 text-white" />
            </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Expense Sorter</h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
        Turn chaos into clarity. <br/>
        <span className="text-indigo-600 flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-5 h-5" /> AI-Powered Finance
        </span>
        </p>

        <form onSubmit={handleSubmit} className="w-full relative space-y-4">
          <div className="text-left group">
            <label htmlFor="name" className="block text-sm font-bold text-slate-500 mb-2 ml-4 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">
              First Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-xl font-bold placeholder-slate-300 text-slate-900 shadow-inner"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full py-5 rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group mt-4"
          >
            {isLoading ? (
               <><Loader2 className="w-6 h-6 animate-spin" /> Connecting...</>
            ) : (
               <><span className="relative z-10">Start Sorting</span><ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" /></>
            )}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center animate-in fade-in delay-700 z-10">
         <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
           Made with <span className="text-red-400 text-lg animate-pulse">♥</span> by <span className="text-slate-700 font-bold bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/50">Praful D</span>
         </p>
      </div>

    </div>
  );
};

export default LoginScreen;