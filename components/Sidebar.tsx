import React from 'react';
import { LayoutDashboard, Wallet, LogOut, LucideIcon } from 'lucide-react';

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
      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 text-base ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold scale-[1.02]' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-semibold'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="hidden md:flex flex-col w-80 bg-white/80 backdrop-blur-md border-r border-slate-200 h-screen sticky top-0 font-sans z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-tight">Money<br/>Sorter</span>
          </div>
        </div>

        <nav className="space-y-4">
           <NavItem view="upload" icon={LayoutDashboard} label="Dashboard" />
        </nav>
      </div>

      <div className="mt-auto p-6 m-4 bg-slate-50 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Signed in as</p>
            <p className="font-bold text-slate-900 text-base truncate">{userName}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;