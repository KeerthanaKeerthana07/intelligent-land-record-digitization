import React, { useState } from 'react';
import { X, FileText, Download, Eye, Cpu, Check, Copy } from 'lucide-react';

export default function DocumentViewerModal({ document, onClose }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const handleCopyText = () => {
    if (document.ocr_raw_text) {
      navigator.clipboard.writeText(document.ocr_raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isImage = /\.(png|jpe?g|webp|bmp|tiff)$/i.test(document.file_name || document.original_file_name || '');
  const isPdf = /\.pdf$/i.test(document.file_name || document.original_file_name || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {document.original_file_name || document.file_name || "Land Record Document"}
              </h3>
              <p className="text-xs text-slate-300">
                {(document.file_size / 1024).toFixed(1)} KB • Digitized Document
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

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Document Preview
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'ocr'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              OCR Text &amp; Entities
            </button>
          </div>

          {activeTab === 'ocr' && document.ocr_raw_text && (
            <button
              onClick={handleCopyText}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1 px-2.5 rounded bg-white border border-slate-200 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'preview' ? (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-xl border border-slate-200 text-center">
              {isImage && document.file_path ? (
                <img 
                  src={document.file_path} 
                  alt="Scanned land record" 
                  className="max-h-96 rounded-lg shadow-sm border border-slate-300 object-contain"
                />
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-teal-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{document.original_file_name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isPdf ? "PDF Document stored securely in persistent storage." : "Scanned land record archive."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={document.file_path || `/api/documents/${document.id}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download / Open Original Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Extracted Entities Table if present */}
              {document.ocr_extracted_data && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Extracted Cadastral Fields
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner Name</span>
                      <span className="font-semibold text-slate-800">{document.ocr_extracted_data.owner_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Survey No</span>
                      <span className="font-semibold text-slate-800">{document.ocr_extracted_data.survey_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">ULPIN</span>
                      <span className="font-semibold text-slate-800">{document.ocr_extracted_data.ulpin || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Area</span>
                      <span className="font-semibold text-slate-800">
                        {document.ocr_extracted_data.land_area ? `${document.ocr_extracted_data.land_area} ${document.ocr_extracted_data.land_unit || 'Acres'}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">District</span>
                      <span className="font-semibold text-slate-800">{document.ocr_extracted_data.district || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Document No</span>
                      <span className="font-semibold text-slate-800">{document.ocr_extracted_data.document_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw OCR Text Block */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tesseract OCR Raw Text Stream
                </h4>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
                  {document.ocr_raw_text || "No OCR raw text extracted from this document."}
                </pre>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-2xs"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
