import React, { useState } from 'react';
import { ScanLine, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 md:p-16 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="mb-8 flex justify-center">
            <div className="bg-indigo-600 p-6 rounded-full shadow-lg">
                <ScanLine className="w-16 h-16 text-white" />
            </div>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Money Sorter</h1>
        <p className="text-xl text-gray-600 mb-10">
          The easy way to organize your bank papers and receipts.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8 text-left">
            <label htmlFor="name" className="block text-lg font-bold text-gray-800 mb-3 ml-1">
              Please enter your first name:
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-6 py-5 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all text-2xl font-medium placeholder-gray-400"
              placeholder="Type your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-5 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            Start Sorting
            <ArrowRight className="w-8 h-8" />
          </button>
        </form>
        
        <p className="mt-8 text-sm text-gray-400">
          Your data stays on this device. Safe and secure.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;