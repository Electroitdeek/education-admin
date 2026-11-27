'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  Copy,
  Printer,
  Download,
  Eye,
  ChevronDown,
  ArrowUpDown,
  Edit2,
  Trash2,
  Clock,
  ChevronRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/front-office/gate-pass`;

export interface GatePassRecord {
  _id?: string;
  type: string;
  studentName?: string;
  staffName?: string;
  startDate: string;
  endDate: string;
  inTime?: string;
  outTime?: string;
  note?: string;
  passNo?: string;
  status?: string;
  createdAt?: string;
}

const ALL_COLUMNS = [
  { key: 'studentName', label: 'STUDENT NAME' },
  { key: 'staffName', label: 'STAFF NAME' },
  { key: 'startDate', label: 'START DATE' },
  { key: 'endDate', label: 'END DATE' },
  { key: 'inTime', label: 'IN TIME' },
  { key: 'outTime', label: 'OUT TIME' },
  { key: 'note', label: 'NOTE' },
];

export default function GatePassView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State matching screenshot
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    type: string;
    studentName: string;
    staffName: string;
    startDate: string;
    endDate: string;
    inTime: string;
    outTime: string;
    note: string;
  }>({
    type: 'Student',
    studentName: '',
    staffName: '',
    startDate: '17-10-2026',
    endDate: '17-10-2026',
    inTime: '',
    outTime: '',
    note: '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<GatePassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'studentName' | 'staffName' | 'startDate' | 'endDate'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'studentName',
    'staffName',
    'startDate',
    'endDate',
    'inTime',
    'outTime',
    'note',
  ]);
  const [showColMenu, setShowColMenu] = useState<boolean>(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Initialize date in DD-MM-YYYY format
  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    setForm((f) => ({
      ...f,
      startDate: f.startDate || formatted,
      endDate: f.endDate || formatted,
    }));
  }, []);

  // Fetch gate passes
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setRecords([]);
      }
    } catch {
      // API error or offline
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Close column menu on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === 'Student' && !form.studentName.trim()) {
      setFormError('Please enter Student Name');
      return;
    }
    if (form.type === 'Staff' && !form.staffName.trim()) {
      setFormError('Please enter Staff Name');
      return;
    }
    if (!form.startDate.trim()) {
      setFormError('Please enter Start Date');
      return;
    }
    if (!form.endDate.trim()) {
      setFormError('Please enter End Date');
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PATCH' : 'POST';

      const payload = {
        type: form.type,
        studentName: form.type === 'Student' ? form.studentName.trim() : undefined,
        staffName: form.type === 'Staff' ? form.staffName.trim() : undefined,
        startDate: form.startDate.trim(),
        endDate: form.endDate.trim(),
        inTime: form.inTime.trim(),
        outTime: form.outTime.trim(),
        note: form.note.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res) {
        throw new Error('Backend API server on port 3045 is not reachable.');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save Gate Pass');
      }

      setSuccessMsg(editingId ? 'Gate Pass updated successfully!' : 'Gate Pass added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Reset
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formatted = `${day}-${month}-${year}`;

      setForm({
        type: 'Student',
        studentName: '',
        staffName: '',
        startDate: formatted,
        endDate: formatted,
        inTime: '',
        outTime: '',
        note: '',
      });
      setEditingId(null);
      fetchRecords();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  // Edit record
  const handleEdit = (r: GatePassRecord) => {
    setEditingId(r._id || null);
    setForm({
      type: r.type || 'Student',
      studentName: r.studentName || '',
      staffName: r.staffName || '',
      startDate: r.startDate || '17-10-2026',
      endDate: r.endDate || '17-10-2026',
      inTime: r.inTime || '',
      outTime: r.outTime || '',
      note: r.note || '',
    });
    setFormError('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancel = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;

    setEditingId(null);
    setForm({
      type: 'Student',
      studentName: '',
      staffName: '',
      startDate: formatted,
      endDate: formatted,
      inTime: '',
      outTime: '',
      note: '',
    });
    setFormError('');
  };

  // Delete record
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Gate Pass?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' }).catch(() => null);
      if (res && res.ok) {
        fetchRecords();
        if (editingId === id) handleCancel();
      }
    } catch {
      alert('Failed to delete Gate Pass');
    }
  };

  // Sort
  const handleSort = (field: 'studentName' | 'staffName' | 'startDate' | 'endDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredRecords = records
    .filter((r) => {
      const q = tableSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        r.studentName?.toLowerCase().includes(q) ||
        r.staffName?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q) ||
        r.startDate?.toLowerCase().includes(q) ||
        r.endDate?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Column visibility
  const toggleCol = (key: string) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Export Tools
  const copyToClipboard = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof GatePassRecord] as string) || '';
      });
      return [i + 1, ...vals].join('\t');
    });
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n'));
    alert('Copied to clipboard!');
  };

  const exportCSV = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof GatePassRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'gate-pass-list.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-[#80229a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            📇
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Gate Pass
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Gate Pass</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ─── 2-Column Main Workspace ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ─── Left Column: Add / Edit Gate Pass (~40%) ─────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-slate-700 stroke-current"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <h2 className="font-bold text-slate-800 text-sm">
                {editingId ? 'Edit Gate Pass' : 'Add Gate Pass'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {formError && (
            <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Type * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Type<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-purple-300 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-purple-50/20 text-slate-700 outline-none transition appearance-none cursor-pointer"
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Student Name * or Staff Name * */}
            {form.type === 'Student' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={form.studentName}
                  onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={form.staffName}
                  onChange={(e) => setForm((f) => ({ ...f, staffName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>
            )}

            {/* Start Date * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 outline-none transition"
              />
            </div>

            {/* End Date * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 outline-none transition"
              />
            </div>

            {/* In Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                In Time
              </label>
              <div className="flex items-stretch rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#80229a]">
                <div className="bg-[#80229a] text-white px-3 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="In time"
                  value={form.inTime}
                  onChange={(e) => setForm((f) => ({ ...f, inTime: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs bg-[#eef2f8] text-slate-700 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Out Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Out Time
              </label>
              <div className="flex items-stretch rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#80229a]">
                <div className="bg-[#80229a] text-white px-3 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Out time"
                  value={form.outTime}
                  onChange={(e) => setForm((f) => ({ ...f, outTime: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs bg-[#eef2f8] text-slate-700 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Note
              </label>
              <textarea
                rows={4}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none resize-y transition"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Right Column: Gate Pass List (~60%) ──────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">Gate Pass List</h2>
            </div>
          </div>

          {/* Table Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
            {/* Left Action Buttons: Copy, CSV, Print, Column Visibility */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={copyToClipboard}
                title="Copy to clipboard"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={exportCSV}
                title="Export to CSV"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>

              {/* Column Visibility dropdown */}
              <div className="relative" ref={colMenuRef}>
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#80229a] hover:bg-[#68167f] rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Column visibility
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showColMenu && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Toggle Columns
                    </p>
                    {ALL_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-purple-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleCols.includes(col.key)}
                          onChange={() => toggleCol(col.key)}
                          className="rounded text-[#80229a] h-3.5 w-3.5"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] bg-white w-32 md:w-44"
                placeholder=""
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
                <tr>
                  <th className="px-3 py-3 w-10 text-[11px] font-bold text-slate-700">
                    <div className="flex items-center gap-1">
                      #
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>

                  {visibleCols.includes('studentName') && (
                    <th
                      onClick={() => handleSort('studentName')}
                      className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        STUDENT NAME
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('staffName') && (
                    <th
                      onClick={() => handleSort('staffName')}
                      className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        STAFF NAME
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('startDate') && (
                    <th
                      onClick={() => handleSort('startDate')}
                      className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        START DATE
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('endDate') && (
                    <th
                      onClick={() => handleSort('endDate')}
                      className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        END DATE
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('inTime') && (
                    <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      IN TIME
                    </th>
                  )}

                  {visibleCols.includes('outTime') && (
                    <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      OUT TIME
                    </th>
                  )}

                  {visibleCols.includes('note') && (
                    <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      NOTE
                    </th>
                  )}

                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right pr-4">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.length + 2}
                      className="py-12 text-center text-slate-400 text-xs font-medium"
                    >
                      {loading ? 'Loading...' : 'No data available in table'}
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r, idx) => (
                    <tr key={r._id || idx} className="hover:bg-purple-50/30 transition">
                      <td className="px-3 py-3 text-slate-500 font-mono text-xs">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {visibleCols.includes('studentName') && (
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {r.studentName || '—'}
                        </td>
                      )}

                      {visibleCols.includes('staffName') && (
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {r.staffName || '—'}
                        </td>
                      )}

                      {visibleCols.includes('startDate') && (
                        <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                          {r.startDate}
                        </td>
                      )}

                      {visibleCols.includes('endDate') && (
                        <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                          {r.endDate}
                        </td>
                      )}

                      {visibleCols.includes('inTime') && (
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          {r.inTime || '—'}
                        </td>
                      )}

                      {visibleCols.includes('outTime') && (
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          {r.outTime || '—'}
                        </td>
                      )}

                      {visibleCols.includes('note') && (
                        <td className="px-3 py-3 text-slate-500 max-w-xs truncate">
                          {r.note || '—'}
                        </td>
                      )}

                      <td className="px-3 py-3 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r._id!)}
                            className="p-1 text-red-400 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                    pg === page
                      ? 'bg-[#80229a] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

