import React from 'react';
import { LayoutDashboard, Wallet, LogOut, LucideIcon, PieChart } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: 'upload') => void;
  userName: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userName, onLogout }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: 'upload', icon: LucideIcon, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 text-base group relative overflow-hidden ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold scale-[1.02]' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-semibold'
      }`}
    >
      <div className={`absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ${currentView === view ? 'block' : 'hidden'}`} />
      <Icon className={`w-5 h-5 ${currentView === view ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="hidden md:flex flex-col w-80 bg-white/80 backdrop-blur-md border-r border-slate-200 h-screen sticky top-0 font-sans z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 rounded-full"></div>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-200 relative z-10">
              <PieChart className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-tight">
              Expense<br/><span className="text-indigo-600">Sorter</span>
            </span>
          </div>
        </div>

        <nav className="space-y-4">
           <NavItem view="upload" icon={LayoutDashboard} label="Dashboard" />
        </nav>
      </div>

      <div className="mt-auto px-6 pt-4">
        <div className="bg-slate-50/80 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 group-hover:text-indigo-400 transition-colors">Signed in as</p>
              <p className="font-bold text-slate-900 text-base truncate">{userName}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-90"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="pb-6 text-center">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-indigo-500 transition-colors cursor-default">
           Made by Praful D
         </p>
      </div>
    </div>
  );
};

export default Sidebar;