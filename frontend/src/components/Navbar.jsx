import React from 'react';
import { 
  Building2, 
  UserCircle2, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  Menu,
  ChevronDown,
  Layers
} from 'lucide-react';
import { auth } from '../services/auth';

export default function Navbar({ onToggleSidebar, activePage, onNavigate }) {
  const user = auth.getUser() || {
    full_name: "Officer Priya Deshmukh",
    email: "officer@landrecords.gov.in",
    role: "officer",
    department: "Taluk Revenue Office - Bengaluru North"
  };

  const handleLogout = () => {
    auth.clearSession();
    window.location.reload();
  };

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm font-bold group-hover:bg-teal-500 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                    BHU-VAIDYA
                  </h1>
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded">
                    Gov Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  Intelligent Land Record Digitization &amp; Validation System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Health pill & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* DevOps Live Ping Pill */}
            <div 
              onClick={() => onNavigate('monitoring')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-800 border border-navy-700 text-xs text-slate-300 hover:text-white hover:border-teal-500/50 cursor-pointer transition-all"
              title="Click to view System Monitoring"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="font-medium text-[11px]">System Online</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-navy-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-white leading-none">
                  {user.full_name}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    user.role === 'admin' 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                      : 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center text-teal-300">
                <UserCircle2 className="w-5 h-5" />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-navy-800 transition-colors"
                title="Sign out of portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
