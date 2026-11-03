import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Plus, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ValidationReportModal from '../components/ValidationReportModal';
import { api } from '../services/api';

export default function LandRecords({ onNavigate, onSelectRecord }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Modals State
  const [selectedReportRecord, setSelectedReportRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecords({
        search,
        status: statusFilter,
        district: districtFilter,
        page,
        limit,
        sort_by: sortBy,
        order
      });
      setRecords(res.records || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load land records from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter, districtFilter, sortBy, order]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRecords();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async () => {
    if (!deletingRecord) return;
    try {
      setActionLoading(true);
      await api.deleteRecord(deletingRecord.id);
      setDeletingRecord(null);
      fetchRecords();
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      setActionLoading(true);
      await api.updateRecord(editingRecord.id, {
        owner_name: editingRecord.owner_name,
        survey_number: editingRecord.survey_number,
        ulpin: editingRecord.ulpin,
        district: editingRecord.district,
        taluk: editingRecord.taluk,
        village: editingRecord.village,
        land_area: parseFloat(editingRecord.land_area),
        land_unit: editingRecord.land_unit,
        document_number: editingRecord.document_number,
        notes: editingRecord.notes
      });
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
            Cadastral Land Records Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query, filter, inspect, and manage digitized land parcels and validation audit trails.
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Land Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input (6 cols) */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by owner name, survey no (142/3A), ULPIN, or village..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* District Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Bengaluru Rural">Bengaluru Rural</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Tumakuru">Tumakuru</option>
              <option value="Belagavi">Belagavi</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={`${sortBy}_${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('_');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="owner_name_asc">Owner Name (A-Z)</option>
              <option value="land_area_desc">Largest Area</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Querying database records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-700 bg-rose-50">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Land Records Found</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Survey No</th>
                  <th className="py-3 px-4">ULPIN / Property ID</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      #{rec.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{rec.owner_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.document_number}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {rec.survey_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {rec.ulpin}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{rec.village}</span>
                      <span className="text-[10px] text-slate-400 block">{rec.district}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {rec.land_area} <span className="text-[10px] text-slate-500">{rec.land_unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* View Details */}
                        <button
                          onClick={() => onSelectRecord(rec.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                          title="View Full Record Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* View Validation Report */}
                        <button
                          onClick={() => setSelectedReportRecord(rec)}
                          className="p-1.5 rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                          title="View Validation Checklist & Report"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => setEditingRecord({ ...rec })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Record Fields"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Record */}
                        <button
                          onClick={() => setDeletingRecord(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold">{records.length}</span> of <span className="font-semibold">{total}</span> total records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Validation Report Modal */}
      {selectedReportRecord && (
        <ValidationReportModal
          record={selectedReportRecord}
          report={selectedReportRecord.validation_result}
          onClose={() => setSelectedReportRecord(null)}
          onRefresh={fetchRecords}
        />
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Land Record #{editingRecord.id}</h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={editingRecord.owner_name}
                  onChange={(e) => setEditingRecord({ ...editingRecord, owner_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Survey Number</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.survey_number}
                    onChange={(e) => setEditingRecord({ ...editingRecord, survey_number: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ULPIN / Parcel ID</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.ulpin}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ulpin: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editingRecord.district}
                    onChange={(e) => setEditingRecord({ ...editingRecord, district: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taluk</label>
                  <input
                    type="text"
                    value={editingRecord.taluk}
                    onChange={(e) => setEditingRecord({ ...editingRecord, taluk: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={editingRecord.village}
                    onChange={(e) => setEditingRecord({ ...editingRecord, village: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Land Area</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingRecord.land_area}
                    onChange={(e) => setEditingRecord({ ...editingRecord, land_area: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Number</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.document_number}
                    onChange={(e) => setEditingRecord({ ...editingRecord, document_number: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-navy-900 text-white font-semibold hover:bg-navy-800 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving & Re-validating...' : 'Save & Re-validate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Land Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete Record #{deletingRecord.id} ({deletingRecord.owner_name})? This action will also delete associated OCR records.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
