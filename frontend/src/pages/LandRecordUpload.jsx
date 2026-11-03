import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  RefreshCw, 
  ArrowRight, 
  X, 
  Eye, 
  Check,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import ValidationReportModal from '../components/ValidationReportModal';

export default function LandRecordUpload({ onNavigate, onRecordCreated }) {
  // Form State
  const [formData, setFormData] = useState({
    owner_name: '',
    survey_number: '',
    ulpin: '',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru North',
    village: 'Yelahanka',
    land_area: '',
    land_unit: 'Acres',
    land_type: 'Agricultural',
    document_number: '',
    notes: ''
  });

  // File & OCR State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [uploadedDocId, setUploadedDocId] = useState(null);

  // Submission & Validation Modal State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validationModalData, setValidationModalData] = useState(null);

  const fileInputRef = useRef(null);

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate size (max 15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg("Document exceeds maximum allowed size of 15MB.");
      return;
    }

    // Validate extension
    const validExts = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      setErrorMsg(`Unsupported file type '${ext}'. Please upload PDF, PNG, or JPG.`);
      return;
    }

    setFile(selectedFile);

    // Image preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }

    // Automatically trigger OCR processing
    triggerOcrWorkflow(selectedFile);
  };

  const triggerOcrWorkflow = async (targetFile) => {
    try {
      setIsScanningOcr(true);
      setUploadProgress(30);

      // Upload and run OCR through backend
      const res = await api.uploadDocument(targetFile);
      setUploadProgress(100);
      setUploadedDocId(res.document_id);
      setOcrResult(res);

      // If entities were extracted, autofill the form for user review!
      if (res.extracted_entities) {
        const ent = res.extracted_entities;
        setFormData(prev => ({
          ...prev,
          owner_name: ent.owner_name || prev.owner_name,
          survey_number: ent.survey_number || prev.survey_number,
          ulpin: ent.ulpin || (ent.survey_number ? `KA-BLR-2024-${Math.floor(100000 + Math.random() * 900000)}` : prev.ulpin),
          district: ent.district || prev.district,
          taluk: ent.taluk || prev.taluk,
          village: ent.village || prev.village,
          land_area: ent.land_area ? String(ent.land_area) : prev.land_area,
          land_unit: ent.land_unit || prev.land_unit,
          land_type: ent.land_type || prev.land_type,
          document_number: ent.document_number || prev.document_number
        }));
        setSuccessMsg("Document analyzed! Extracted fields have been populated below. Please review and edit before saving.");
      }
    } catch (err) {
      setErrorMsg("OCR Extraction Notice: " + err.message);
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Frontend validation
    if (!formData.owner_name.trim()) {
      setErrorMsg("Owner Name is mandatory.");
      return;
    }
    if (!formData.survey_number.trim()) {
      setErrorMsg("Survey Number is mandatory.");
      return;
    }
    if (!formData.ulpin.trim()) {
      setErrorMsg("Property ID / ULPIN is mandatory.");
      return;
    }
    if (formData.land_area === '' || isNaN(Number(formData.land_area))) {
      setErrorMsg("A valid numerical Land Area is mandatory.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        owner_name: formData.owner_name.trim(),
        survey_number: formData.survey_number.trim(),
        ulpin: formData.ulpin.trim(),
        district: formData.district.trim(),
        taluk: formData.taluk.trim(),
        village: formData.village.trim(),
        land_area: parseFloat(formData.land_area),
        land_unit: formData.land_unit,
        land_type: formData.land_type,
        document_number: formData.document_number.trim() || `DOC-2024-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: formData.notes,
        document_id: uploadedDocId
      };

      const createdRecord = await api.createRecord(payload);
      setSuccessMsg(`Land Record #${createdRecord.id} successfully created and evaluated!`);
      
      // Open validation report modal to show instant intelligent validation findings
      setValidationModalData({
        record: createdRecord,
        report: createdRecord.validation_result
      });

      if (onRecordCreated) {
        onRecordCreated(createdRecord);
      }
    } catch (err) {
      setErrorMsg("Failed to create record: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofillSample = () => {
    setFormData({
      owner_name: 'Chandrashekar Patil',
      survey_number: '178/2B',
      ulpin: `KA-BLR-2024-${Math.floor(100000 + Math.random() * 900000)}`,
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru North',
      village: 'Yelahanka',
      land_area: '3.50',
      land_unit: 'Acres',
      land_type: 'Agricultural',
      document_number: `DOC-2024-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: 'Standard sale deed with clear patta boundary coordinates.'
    });
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
            Land Record Digitization &amp; Intelligent Upload
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload deeds, RTCs, or Pattas. Optical Character Recognition (OCR) extracts cadastral data for instant validation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutofillSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Autofill Sample Data</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Drag & Drop Upload + OCR Extraction Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">1. Document Upload &amp; OCR</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">PDF, PNG, JPG</span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${file 
                  ? 'border-teal-500 bg-teal-50/30' 
                  : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.webp"
                className="hidden"
              />

              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {file ? file.name : "Drag & drop land document here"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    or click to browse files from device (Max 15MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Upload & OCR Progress indicator */}
            {isScanningOcr && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-teal-600 animate-spin" />
                    <span>Processing with Tesseract OCR Engine...</span>
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-teal-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Image Preview if available */}
            {filePreview && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 block">Scanned Preview:</span>
                <div className="max-h-52 overflow-hidden rounded-xl border border-slate-200 flex items-center justify-center bg-slate-100">
                  <img src={filePreview} alt="Document Preview" className="max-h-52 object-contain" />
                </div>
              </div>
            )}

            {/* OCR Extracted Text Preview Box */}
            {ocrResult && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                    OCR Scanned Text
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {ocrResult.confidence_score}% Confidence
                  </span>
                </div>
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
                  {ocrResult.raw_text}
                </pre>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Cadastral Land Record Metadata Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-900">
                2. Land Record &amp; Cadastral Metadata
              </h3>
              <span className="text-xs text-slate-400">All fields validated before persistence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Owner Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Owner Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="owner_name"
                  required
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar Gowda"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Survey Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Survey Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="survey_number"
                  required
                  value={formData.survey_number}
                  onChange={handleChange}
                  placeholder="e.g. 142/3A"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* ULPIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  ULPIN / Property ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="ulpin"
                  required
                  value={formData.ulpin}
                  onChange={handleChange}
                  placeholder="e.g. KA-BLR-2024-981021"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Bengaluru Urban">Bengaluru Urban</option>
                  <option value="Bengaluru Rural">Bengaluru Rural</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Tumakuru">Tumakuru</option>
                  <option value="Belagavi">Belagavi</option>
                  <option value="Mandya">Mandya</option>
                </select>
              </div>

              {/* Taluk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Taluk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="taluk"
                  required
                  value={formData.taluk}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru North"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Village <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="village"
                  required
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Yelahanka"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Land Area and Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Land Extent / Area <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    name="land_area"
                    required
                    value={formData.land_area}
                    onChange={handleChange}
                    placeholder="e.g. 3.75"
                    className="w-2/3 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select
                    name="land_unit"
                    value={formData.land_unit}
                    onChange={handleChange}
                    className="w-1/3 px-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Guntas">Guntas</option>
                    <option value="Sq ft">Sq ft</option>
                  </select>
                </div>
              </div>

              {/* Land Classification Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Land Classification
                </label>
                <select
                  name="land_type"
                  value={formData.land_type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Agricultural">Agricultural</option>
                  <option value="Residential Conversion">Residential Conversion</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial Zone">Industrial Zone</option>
                  <option value="Government Reserve">Government Reserve</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Document Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="document_number"
                  required
                  value={formData.document_number}
                  onChange={handleChange}
                  placeholder="e.g. DOC-2024-REG-7819"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Additional Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registry Field Remarks / Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Duly attested by Sub-Registrar. Mutation pending survey verification."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('records')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <span>Executing Intelligent Validation Engine...</span>
                ) : (
                  <>
                    <span>Submit &amp; Validate Land Record</span>
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Validation Result Modal on submit */}
      {validationModalData && (
        <ValidationReportModal
          record={validationModalData.record}
          report={validationModalData.report}
          onClose={() => {
            setValidationModalData(null);
            onNavigate('records');
          }}
        />
      )}

    </div>
  );
}
