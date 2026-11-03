import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  ExternalLink,
  Clock,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DocumentViewerModal from '../components/DocumentViewerModal';
import ValidationReportModal from '../components/ValidationReportModal';
import { api } from '../services/api';

export default function RecordDetails({ recordId, onBack }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revalidating, setRevalidating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modals
  const [activeDocViewer, setActiveDocViewer] = useState(null);
  const [showValModal, setShowValModal] = useState(false);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRecordById(recordId);
      setRecord(data);
    } catch (err) {
      setError(err.message || "Failed to load land record details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) fetchRecord();
  }, [recordId]);

  const handleRevalidate = async () => {
    try {
      setRevalidating(true);
      const report = await api.revalidateRecord(recordId);
      setRecord(prev => ({ ...prev, status: report.status, validation_result: report }));
    } catch (err) {
      alert("Re-validation failed: " + err.message);
    } finally {
      setRevalidating(false);
    }
  };

  const handleCopyUlpin = () => {
    if (record?.ulpin) {
      navigator.clipboard.writeText(record.ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Retrieving land record and cadastral dossier #{recordId}...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <p className="text-sm font-bold text-rose-800">{error || "Record not found"}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Records
        </button>
      </div>
    );
  }

  const firstDoc = record.documents?.[0] || null;
  const valResult = record.validation_result;

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Back to Registry"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-navy-900">
                Land Parcel Dossier #{record.id}
              </h2>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ULPIN: {record.ulpin}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} />
            <span>{revalidating ? 'Evaluating...' : 'Re-Validate'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cadastral & Owner Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Owner Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
              <span>Primary Titleholder Information</span>
              <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded">Verified Record</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Owner Legal Name</span>
                <span className="text-sm font-bold text-slate-900">{record.owner_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Property ID / ULPIN</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800">{record.ulpin}</span>
                  <button onClick={handleCopyUlpin} className="text-slate-400 hover:text-slate-600" title="Copy ULPIN">
                    {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Registration Deed Number</span>
                <span className="font-mono font-semibold text-slate-800">{record.document_number}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Date of Digitization</span>
                <span className="text-slate-700 font-medium">
                  {record.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cadastral Survey & Extent Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider border-b pb-2">
              Cadastral Survey &amp; Land Extent
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Survey Number</span>
                <span className="text-base font-bold font-mono text-navy-900">{record.survey_number}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Registered Extent</span>
                <span className="text-base font-bold text-teal-700">{record.land_area} <span className="text-xs font-normal text-slate-500">{record.land_unit}</span></span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Classification</span>
                <span className="font-semibold text-slate-800">{record.land_type || 'Agricultural'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Status</span>
                <div className="mt-0.5"><StatusBadge status={record.status} size="sm" /></div>
              </div>
            </div>

            {record.notes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium mb-1">Revenue Registry Remarks</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {record.notes}
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Administrative Location Hierarchy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Administrative Cadastral Hierarchy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">District</span>
                <span className="text-xs font-bold text-slate-800">{record.district}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Taluk / Tehsil</span>
                <span className="text-xs font-bold text-slate-800">{record.taluk}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Village / Hobli</span>
                <span className="text-xs font-bold text-slate-800">{record.village}</span>
              </div>
            </div>
          </div>

          {/* Card 4: OCR Scanned Text Stream */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>Tesseract OCR Extracted Text</span>
              </h3>
              {firstDoc && (
                <button
                  onClick={() => setActiveDocViewer(firstDoc)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Document</span>
                </button>
              )}
            </div>

            {firstDoc?.ocr_raw_text ? (
              <pre className="p-4 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                {firstDoc.ocr_raw_text}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl border text-center">
                No OCR scan document attached directly to this sample record.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Validation Summary & Audit Trail (1 col) */}
        <div className="space-y-6">
          
          {/* Validation Report Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Validation Summary</span>
              </h3>
              <StatusBadge status={record.status} size="sm" />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Errors Flagged</span>
                <span className={`font-bold ${valResult?.error_count > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {valResult?.error_count || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Warnings</span>
                <span className={`font-bold ${valResult?.warning_count > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {valResult?.warning_count || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Last Evaluated</span>
                <span className="text-slate-600 font-medium">
                  {valResult?.validated_at ? new Date(valResult.validated_at).toLocaleDateString() : 'Initial Ingestion'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowValModal(true)}
              className="w-full py-2 px-3 bg-navy-50 hover:bg-navy-100 text-navy-800 rounded-lg text-xs font-semibold border border-navy-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>View Detailed Validation Report</span>
            </button>
          </div>

          {/* Attached Document Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider border-b pb-2">
              Attached Physical Deed
            </h3>

            {firstDoc ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">{firstDoc.original_file_name}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Size: {(firstDoc.file_size / 1024).toFixed(1)} KB • Type: {firstDoc.file_type}
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setActiveDocViewer(firstDoc)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium"
                  >
                    View
                  </button>
                  <a
                    href={firstDoc.file_path || `/api/documents/${firstDoc.id}`}
                    download
                    className="p-1.5 bg-navy-900 text-white rounded hover:bg-navy-800 flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No original scanned file attached directly.</p>
            )}
          </div>

          {/* Cadastral Audit Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider border-b pb-2">
              Cadastral Audit History
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Record Digitized</p>
                  <p className="text-[11px] text-slate-400">{new Date(record.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-navy-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Rule Validation Executed</p>
                  <p className="text-[11px] text-slate-400">Result: {record.status}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Validation Modal */}
      {showValModal && (
        <ValidationReportModal
          record={record}
          report={valResult}
          onClose={() => setShowValModal(false)}
          onRefresh={fetchRecord}
        />
      )}

      {/* Document Viewer Modal */}
      {activeDocViewer && (
        <DocumentViewerModal
          document={activeDocViewer}
          onClose={() => setActiveDocViewer(null)}
        />
      )}

    </div>
  );
}
