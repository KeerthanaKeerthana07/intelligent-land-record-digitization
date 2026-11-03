import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { api } from '../services/api';

export default function ValidationReportModal({ report, record, onClose, onRefresh }) {
  const [revalidating, setRevalidating] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);

  if (!currentReport && !record) return null;

  const handleRevalidate = async () => {
    const id = record?.id || currentReport?.record_id;
    if (!id) return;
    try {
      setRevalidating(true);
      const res = await api.revalidateRecord(id);
      setCurrentReport(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Validation failed: " + err.message);
    } finally {
      setRevalidating(false);
    }
  };

  const status = currentReport?.status || record?.status || "Pending";
  const errors = currentReport?.errors || [];
  const warnings = currentReport?.warnings || [];
  const suggestions = currentReport?.suggestions || [];
  const rules = currentReport?.rules_evaluated || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Intelligent Validation Report
                </h3>
                <StatusBadge status={status} size="sm" />
              </div>
              <p className="text-xs text-slate-300">
                Record #{record?.id || currentReport?.record_id} • {record?.owner_name || "Cadastral Parcel"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Summary Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border text-center ${
              errors.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="block text-xl font-bold">{errors.length}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider">Errors Found</span>
            </div>

            <div className={`p-3 rounded-xl border text-center ${
              warnings.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="block text-xl font-bold">{warnings.length}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider">Warnings</span>
            </div>

            <div className="p-3 rounded-xl border bg-teal-50 border-teal-200 text-teal-900 text-center">
              <span className="block text-xl font-bold">{rules.filter(r => r.passed).length} / {rules.length || 7}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider">Rules Passed</span>
            </div>
          </div>

          {/* Errors Section */}
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Critical Validation Errors (Rejection Causes)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 pl-1">
                {errors.map((err, idx) => (
                  <li key={idx} className="leading-relaxed">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Review Warnings (Pending Resolution)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 pl-1">
                {warnings.map((warn, idx) => (
                  <li key={idx} className="leading-relaxed">{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Corrections */}
          {suggestions.length > 0 && (
            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Recommended Corrections</span>
              </div>
              <ul className="space-y-1.5 text-xs text-teal-800">
                {suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-teal-600">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rule Evaluation Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Automated Cadastral Rules Evaluated
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-3 flex items-start justify-between gap-3 bg-white hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{rule.rule}</span>
                      {rule.note && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                          {rule.note}
                        </span>
                      )}
                    </div>
                    {rule.details && (
                      <p className="text-[11px] text-slate-500">{rule.details}</p>
                    )}
                  </div>

                  <div>
                    {rule.passed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-600" /> Fail
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Prototype Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Validation is executed via heuristic cadastral rule algorithms. This demonstration prototype validates schema, duplication, and OCR alignment; it does not constitute official judicial certification of land title.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-navy-800 bg-white border border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} />
            <span>{revalidating ? 'Re-evaluating...' : 'Re-Run Validation'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-2xs"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
