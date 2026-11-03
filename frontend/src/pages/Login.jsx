import React, { useState } from 'react';
import { 
  Layers, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { auth } from '../services/auth';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      auth.setSession(data.access_token, data.user);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-navy-900 text-teal-400 flex items-center justify-center shadow-md border border-navy-800">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          BHU-VAIDYA Portal
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Intelligent Land Record Digitization and Validation System
        </p>
        <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-navy-800 shadow-2xs">
          National Land Records Modernization Programme (NLRMP)
        </div>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Government Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@landrecords.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Portal Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Database...</span>
              ) : (
                <>
                  <span>Sign In to Land Registry</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Quick-Fill Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Accounts (Evaluation Click-to-Fill)
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@landrecords.gov.in', 'admin123')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin User</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">admin@landrecords.gov.in</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">pass: admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('officer@landrecords.gov.in', 'officer123')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold text-xs mb-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Officer User</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">officer@landrecords.gov.in</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">pass: officer123</p>
              </button>
            </div>
          </div>

        </div>

        {/* Security & DevOps Footer Note */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Secured with JWT Bearer • SHA-256 Hashed • Audit Logged
        </p>
      </div>

    </div>
  );
}
