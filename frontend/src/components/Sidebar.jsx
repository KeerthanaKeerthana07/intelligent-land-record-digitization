import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Layers,
  ChevronRight,
  Server,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { auth } from '../services/auth';

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const user = auth.getUser() || { role: 'officer', full_name: 'Officer Priya' };
  const isAdmin = user.role === 'admin';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      description: 'Overview, analytics & metrics'
    },
    {
      id: 'upload',
      label: 'Upload & Digitize',
      icon: UploadCloud,
      description: 'Document OCR & validation'
    },
    {
      id: 'records',
      label: 'Land Records',
      icon: FileText,
      description: 'Cadastral registry search'
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      description: 'Approvals & user management',
      badge: isAdmin ? 'Admin' : 'Restricted'
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Activity,
      description: 'DevOps & container health'
    }
  ];

  const handleRoleToggle = () => {
    // Demo helper to switch between Admin and Officer without retyping passwords
    const newRole = isAdmin ? 'officer' : 'admin';
    const updatedUser = {
      ...user,
      role: newRole,
      full_name: newRole === 'admin' ? 'Rajesh Sharma (Admin)' : 'Priya Deshmukh (Officer)',
      email: newRole === 'admin' ? 'admin@landrecords.gov.in' : 'officer@landrecords.gov.in'
    };
    auth.setSession(auth.getToken() || 'demo_token', updatedUser);
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Navigation Section */}
        <div className="p-4 space-y-6 overflow-y-auto">
          
          {/* Department Tag */}
          <div className="px-3 py-2.5 rounded-lg bg-navy-50 border border-navy-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-navy-600 uppercase tracking-wider">State Portal</p>
              <p className="text-xs font-semibold text-navy-900">Land Revenue Dept</p>
            </div>
            <div className="w-6 h-6 rounded bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-xs">
              KA
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Navigation
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 group text-left
                    ${isActive 
                      ? 'bg-navy-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-navy-900'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                      isActive 
                        ? 'bg-teal-500/20 text-teal-300' 
                        : item.badge === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Footer / Demo Role Switcher */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          
          {/* Active Role card with 1-click switcher */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Active Role</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {user.role}
              </span>
            </div>
            
            <button
              onClick={handleRoleToggle}
              className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs text-navy-700 bg-navy-50 hover:bg-navy-100 py-1.5 px-2 rounded font-medium border border-navy-200 transition-colors"
              title="Click to toggle between Admin and Officer test permissions"
            >
              <RefreshCw className="w-3 h-3 text-navy-600" />
              <span>Switch to {isAdmin ? 'Officer' : 'Admin'}</span>
            </button>
          </div>

          {/* DevOps Status Summary */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>DevOps Stack</span>
            <span className="text-teal-600 font-semibold">Docker • K8s • CI/CD</span>
          </div>

        </div>

      </aside>
    </>
  );
}
