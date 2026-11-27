'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Upload,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/front-office/complain`;

export interface ComplainRecord {
  _id?: string;
  complainType: string;
  isParent?: string;
  complainBy: string;
  complainFrom?: string;
  studentName?: string;
  course?: string;
  admissionNo?: string;
  mobileNumber?: string;
  email?: string;
  date?: string;
  description?: string;
  actionTaken?: string;
  previousNote?: string;
  assignedTo?: string;
  status?: string;
  attachment?: string;
  createdAt?: string;
}

const COMPLAIN_TYPES = [
  'Academic',
  'Fees & Accounts',
  'Hostel Facilities',
  'Transport / Bus',
  'Mess & Food Quality',
  'Staff Behavior',
  'Library & Books',
  'Discipline / Ragging',
  'Other',
];

const COMPLAIN_FROM_OPTIONS = [
  'Student',
  'Parent',
  'Staff',
  'Visitor',
  'Other',
];

const ASSIGNED_OPTIONS = [
  'Super Admin',
  'Admin',
  'Principal',
  'Academic Head',
  'Hostel Warden',
  'Transport In-Charge',
  'Accounts Department',
];

const ALL_COLUMNS = [
  { key: 'complainType', label: 'COMPLAIN TYPE' },
  { key: 'isParent', label: 'IS PARENT' },
  { key: 'complainBy', label: 'COMPLAIN BY' },
  { key: 'studentName', label: 'STUDENT NAME' },
  { key: 'course', label: 'COURSE' },
  { key: 'admissionNo', label: 'ADMISSION NO.' },
  { key: 'mobileNumber', label: 'MOBILE NUMBER' },
  { key: 'email', label: 'EMAIL' },
  { key: 'date', label: 'DATE' },
];

export default function ComplainView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // View mode: 'list' | 'add_edit'
  const [viewMode, setViewMode] = useState<'list' | 'add_edit'>('list');
  const [editingRecord, setEditingRecord] = useState<ComplainRecord | null>(null);
  const [complainTypes, setComplainTypes] = useState<string[]>(COMPLAIN_TYPES);

  // Form State matching Add & Edit screen
  const [form, setForm] = useState<Partial<ComplainRecord>>({
    complainType: '',
    complainBy: '',
    complainFrom: '',
    isParent: 'No',
    mobileNumber: '',
    email: '',
    date: '17-10-2026',
    assignedTo: '',
    attachment: '',
    previousNote: '',
    description: '',
    status: 'Pending',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Table State
  const [records, setRecords] = useState<ComplainRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<'complainType' | 'complainBy' | 'studentName' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'complainType',
    'isParent',
    'complainBy',
    'studentName',
    'course',
    'admissionNo',
    'mobileNumber',
    'email',
    'date',
  ]);
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Initialize date in DD-MM-YYYY format on client
  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    setForm((f) => ({ ...f, date: f.date || formatted }));
  }, []);

  // Close column menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch complaints
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
      // API offline
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
    // Load dynamic complain types from Front Office Setup
    fetch(`${API}/front-office/front-office-setup?type=complain_type`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((d: { name: string }) => d.name).filter(Boolean);
          if (names.length > 0) setComplainTypes(names);
        }
      })
      .catch(() => {});
  }, [fetchRecords]);

  // Open Add Screen
  const openCreate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;

    setEditingRecord(null);
    setForm({
      complainType: '',
      complainBy: '',
      complainFrom: '',
      isParent: 'No',
      mobileNumber: '',
      email: '',
      date: formatted,
      assignedTo: '',
      attachment: '',
      previousNote: '',
      description: '',
      status: 'Pending',
    });
    setFormError('');
    setSuccessMessage('');
    setViewMode('add_edit');
  };

  // Open Edit Screen
  const openEdit = (r: ComplainRecord) => {
    setEditingRecord(r);
    setForm({
      ...r,
      date: r.date || '17-10-2026',
    });
    setFormError('');
    setSuccessMessage('');
    setViewMode('add_edit');
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.complainType) {
      setFormError('Please select Complain Type');
      return;
    }
    if (!form.complainBy) {
      setFormError('Please enter Complain By');
      return;
    }
    if (!form.mobileNumber) {
      setFormError('Please enter Mobile Number');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const url = editingRecord ? `${ENDPOINT}/${editingRecord._id}` : ENDPOINT;
      const method = editingRecord ? 'PATCH' : 'POST';

      const payload = {
        ...form,
        isParent: form.complainFrom === 'Parent' ? 'Yes' : (form.isParent || 'No'),
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
        throw new Error(err.message || 'Failed to save complaint');
      }

      setSuccessMessage(editingRecord ? 'Complaint updated successfully!' : 'Complaint added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setViewMode('list');
      fetchRecords();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  // Delete Record
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint record?')) return;
    try {
      await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch {
      alert('Failed to delete');
    }
  };

  // Sorting
  const handleSort = (field: 'complainType' | 'complainBy' | 'studentName' | 'date') => {
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
        r.complainType?.toLowerCase().includes(q) ||
        r.complainBy?.toLowerCase().includes(q) ||
        r.studentName?.toLowerCase().includes(q) ||
        r.mobileNumber?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.assignedTo?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Toggle Column Visibility
  const toggleCol = (colKey: string) => {
    setVisibleCols((prev) =>
      prev.includes(colKey) ? prev.filter((k) => k !== colKey) : [...prev, colKey]
    );
  };

  // Export tools
  const copyToClipboard = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof ComplainRecord] as string) || '';
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
        return (r[c.key as keyof ComplainRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'complain-list.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Complain</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => setViewMode('list')}
            className="font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            Complain
          </button>
          {viewMode === 'add_edit' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Add & Edit</span>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* VIEW MODE 1: ADD & EDIT SCREEN (MATCHING SCREENSHOT)       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {viewMode === 'add_edit' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
          {/* Card Title */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
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
              <h2 className="font-bold text-slate-800 text-sm md:text-base">Add & Edit</h2>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="text-xs font-semibold text-[#80229a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to List
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Row 1: Complain Type *, Complain By *, Complain From* */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Complain Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.complainType || ''}
                    onChange={(e) => setForm((f) => ({ ...f, complainType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs border border-purple-300 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-purple-50/20 text-slate-700 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {complainTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Complain By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={form.complainBy || ''}
                  onChange={(e) => setForm((f) => ({ ...f, complainBy: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Complain From<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.complainFrom || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        complainFrom: e.target.value,
                        isParent: e.target.value === 'Parent' ? 'Yes' : 'No',
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {COMPLAIN_FROM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Mobile Number*, Email, Date * */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mobile Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile no."
                  value={form.mobileNumber || ''}
                  onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={form.email || ''}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.date || '17-10-2026'}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 outline-none transition"
                />
              </div>
            </div>

            {/* Row 3: Assigned (left), Attach Document (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Assigned</label>
                <div className="relative">
                  <select
                    value={form.assignedTo || ''}
                    onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {ASSIGNED_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Attach Document
                </label>
                <div className="flex items-center gap-3 p-1.5 border border-slate-200 rounded-xl bg-white">
                  <label className="px-3.5 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg cursor-pointer shadow-sm transition">
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm((f) => ({ ...f, attachment: file.name }));
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate">
                    {form.attachment || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 4: Previous Note (left), Description (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Previous Note
                </label>
                <textarea
                  rows={4}
                  value={form.previousNote || ''}
                  onChange={(e) => setForm((f) => ({ ...f, previousNote: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none resize-y transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none resize-y transition"
                />
              </div>
            </div>

            {/* Bottom Actions: Save button aligned right */}
            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════ */
        /* VIEW MODE 2: COMPLAIN LIST VIEW                           */
        /* ═══════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header & + Add Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">Complain List</h2>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
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
                Copy
              </button>
              <button
                onClick={exportCSV}
                title="Export to CSV"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                CSV
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
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
                          className="rounded text-[#80229a] focus:ring-[#80229a] h-3.5 w-3.5"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Page Size & Search Input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs focus:outline-none focus:border-[#80229a]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Search:</span>
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] bg-white w-36 md:w-48"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          {records.length === 0 && !loading ? (
            <div>
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
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          COMPLAIN TYPE
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        IS PARENT
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          COMPLAIN BY
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          STUDENT NAME
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          COURSE
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          ADMISSION NO.
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          MOBILE NUMBER
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          EMAIL
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          DATE
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 text-xs font-medium">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Empty footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs text-slate-500">Showing 0 to 0 of 0 entries</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 cursor-not-allowed">Previous</span>
                  <span className="text-slate-400 cursor-not-allowed">Next</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
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

                      {visibleCols.includes('complainType') && (
                        <th
                          onClick={() => handleSort('complainType')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            COMPLAIN TYPE
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </th>
                      )}

                      {visibleCols.includes('isParent') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          IS PARENT
                        </th>
                      )}

                      {visibleCols.includes('complainBy') && (
                        <th
                          onClick={() => handleSort('complainBy')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            COMPLAIN BY
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </th>
                      )}

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

                      {visibleCols.includes('course') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          COURSE
                        </th>
                      )}

                      {visibleCols.includes('admissionNo') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          ADMISSION NO.
                        </th>
                      )}

                      {visibleCols.includes('mobileNumber') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          MOBILE NUMBER
                        </th>
                      )}

                      {visibleCols.includes('email') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          EMAIL
                        </th>
                      )}

                      {visibleCols.includes('date') && (
                        <th
                          onClick={() => handleSort('date')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            DATE
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </th>
                      )}

                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecords.map((r, idx) => (
                      <tr key={r._id || idx} className="hover:bg-purple-50/30 transition">
                        <td className="px-3 py-3 text-slate-500 font-mono text-xs">
                          {(page - 1) * pageSize + idx + 1}
                        </td>

                        {visibleCols.includes('complainType') && (
                          <td className="px-3 py-3 font-semibold text-slate-800">
                            {r.complainType}
                          </td>
                        )}

                        {visibleCols.includes('isParent') && (
                          <td className="px-3 py-3 text-slate-600">
                            {r.isParent || 'No'}
                          </td>
                        )}

                        {visibleCols.includes('complainBy') && (
                          <td className="px-3 py-3 font-medium text-slate-700">
                            {r.complainBy}
                          </td>
                        )}

                        {visibleCols.includes('studentName') && (
                          <td className="px-3 py-3 text-slate-600">
                            {r.studentName || '—'}
                          </td>
                        )}

                        {visibleCols.includes('course') && (
                          <td className="px-3 py-3 text-slate-600">
                            {r.course || '—'}
                          </td>
                        )}

                        {visibleCols.includes('admissionNo') && (
                          <td className="px-3 py-3 font-mono text-slate-600">
                            {r.admissionNo || '—'}
                          </td>
                        )}

                        {visibleCols.includes('mobileNumber') && (
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono">
                            {r.mobileNumber || '—'}
                          </td>
                        )}

                        {visibleCols.includes('email') && (
                          <td className="px-3 py-3 text-xs text-slate-600 font-mono">
                            {r.email || '—'}
                          </td>
                        )}

                        {visibleCols.includes('date') && (
                          <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {r.date ? String(r.date).slice(0, 10) : '—'}
                          </td>
                        )}

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(r)}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * pageSize, filteredRecords.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-700">{filteredRecords.length}</span>{' '}
                  entries
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
          )}
        </div>
      )}
    </div>
  );
}
