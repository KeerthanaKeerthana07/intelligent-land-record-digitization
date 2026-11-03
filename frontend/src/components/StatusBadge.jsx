import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = "md" }) {
  const norm = (status || "").toLowerCase();
  
  if (norm === "verified") {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-300 ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"}`}>
        <CheckCircle2 className={size === "sm" ? "w-3 h-3 text-teal-600" : "w-3.5 h-3.5 text-teal-600"} />
        Verified
      </span>
    );
  }

  if (norm === "rejected") {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-300 ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"}`}>
        <XCircle className={size === "sm" ? "w-3 h-3 text-rose-600" : "w-3.5 h-3.5 text-rose-600"} />
        Rejected
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"}`}>
      <Clock className={size === "sm" ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />
      Pending
    </span>
  );
}
