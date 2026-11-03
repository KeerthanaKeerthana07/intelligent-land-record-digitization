import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Maximize2, 
  UploadCloud, 
  RefreshCw, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';

export default function Dashboard({ onNavigate, onSelectRecord }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Connecting to PostgreSQL database &amp; loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-rose-800">
        <div className="flex items-center gap-2 font-bold text-base">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Database Connection Notice</span>
        </div>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Sync
        </button>
      </div>
    );
  }

  const breakdownData = stats?.validation_breakdown || [
    { name: 'Verified', value: stats?.verified_records || 0, color: '#0D9488' },
    { name: 'Pending', value: stats?.pending_records || 0, color: '#F59E0B' },
    { name: 'Rejected', value: stats?.rejected_records || 0, color: '#EF4444' }
  ];

  const monthlyData = stats?.monthly_uploads || [];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
            Cadastral Administration Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time digitised land parcel monitoring, OCR ingestion, and automated verification statistics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync DB</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Land Document</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Land Records" 
          value={stats?.total_records || 0} 
          icon={FileText} 
          color="navy"
          subtitle="Indexed in Database"
        />
        <StatCard 
          title="Verified Titles" 
          value={stats?.verified_records || 0} 
          icon={CheckCircle2} 
          color="teal"
          subtitle="Passed All Validation Rules"
        />
        <StatCard 
          title="Pending Review" 
          value={stats?.pending_records || 0} 
          icon={Clock} 
          color="amber"
          subtitle="Awaiting Officer Inspection"
        />
        <StatCard 
          title="Rejected Records" 
          value={stats?.rejected_records || 0} 
          icon={XCircle} 
          color="rose"
          subtitle="Discrepancies / Duplicates"
        />
        <StatCard 
          title="Total Registered Area" 
          value={stats?.total_land_area || 0} 
          unit="Acres" 
          icon={Maximize2} 
          color="blue"
          subtitle="Survey Extent Area"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Validation Status Breakdown (Donut) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Validation Status Breakdown</h3>
              <p className="text-[11px] text-slate-500">Distribution of cadastral verification results</p>
            </div>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} Records`, name]}
                  contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Upload Activity (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Monthly Document Ingestion Volume</h3>
              <p className="text-[11px] text-slate-500">Cadastral deeds and RTCs uploaded per month</p>
            </div>
            <div className="p-1.5 rounded-lg bg-navy-50 text-navy-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val) => [`${val} Documents`, 'Uploaded']}
                  contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#13315C" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Section: Recent Documents & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Documents Table (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recently Ingested Land Records</h3>
              <p className="text-[11px] text-slate-500">Directly fetched from PostgreSQL database</p>
            </div>
            <button
              onClick={() => onNavigate('records')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Document / Owner</th>
                  <th className="py-3 px-4">Survey No</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(stats?.recent_documents || []).map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{doc.owner_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{doc.file_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {doc.survey_number}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {doc.record_id && (
                        <button
                          onClick={() => onSelectRecord(doc.record_id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-700 font-medium transition-colors text-[11px]"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Audit Feed (1 column) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-navy-900">System Activity Audit</h3>
              <p className="text-[11px] text-slate-500">Live cadastral operations feed</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></div>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {(stats?.recent_activity || []).map((act, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs pb-3 border-b border-slate-100 last:border-none last:pb-0">
                <div className="w-2 h-2 rounded-full bg-navy-600 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800">{act.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-tight">{act.details}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{act.user_email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
