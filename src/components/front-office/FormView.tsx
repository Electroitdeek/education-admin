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
  ArrowUpDown,
  ChevronRight,
  Users,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/front-office/front-office-form`;

export interface FormRecord {
  _id?: string;
  formId?: string;
  name: string;
  gender?: string;
  maritalGender?: string;
  phone: string;
  dob: string;
  fatherName?: string;
  image?: string;
  status?: string;
  createdAt?: string;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const ALL_COLUMNS = [
  { key: 'formId', label: 'FORM ID' },
  { key: 'name', label: 'NAME' },
  { key: 'fatherName', label: 'FATHER NAME' },
  { key: 'phone', label: 'NUMBER' },
  { key: 'gender', label: 'GENDER' },
  { key: 'dob', label: 'DOB' },
];

export default function FormView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // View mode: 'list' | 'add_edit'
  const [viewMode, setViewMode] = useState<'list' | 'add_edit'>('list');
  const [editingRecord, setEditingRecord] = useState<FormRecord | null>(null);

  // Form State matching screenshot
  const [form, setForm] = useState<{
    name: string;
    maritalGender: string;
    phone: string;
    dob: string;
    fatherName: string;
    image: string;
  }>({
    name: '',
    maritalGender: '',
    phone: '',
    dob: '17-10-2026',
    fatherName: '',
    image: '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'formId' | 'name' | 'fatherName' | 'phone' | 'gender' | 'dob'>('formId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'formId',
    'name',
    'fatherName',
    'phone',
    'gender',
    'dob',
  ]);
  const [showColMenu, setShowColMenu] = useState<boolean>(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Initialize date on client
  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    setForm((f) => ({ ...f, dob: f.dob || formatted }));
  }, []);

  // Fetch records
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

  // Close column menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Open Create Screen
  const openCreate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formatted = `${day}-${month}-${year}`;

    setEditingRecord(null);
    setForm({
      name: '',
      maritalGender: '',
      phone: '',
      dob: formatted,
      fatherName: '',
      image: '',
    });
    setFormError('');
    setSuccessMsg('');
    setViewMode('add_edit');
  };

  // Open Edit Screen
  const openEdit = (r: FormRecord) => {
    setEditingRecord(r);
    setForm({
      name: r.name || '',
      maritalGender: r.maritalGender || r.gender || '',
      phone: r.phone || '',
      dob: r.dob || '17-10-2026',
      fatherName: r.fatherName || '',
      image: r.image || '',
    });
    setFormError('');
    setSuccessMsg('');
    setViewMode('add_edit');
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Please enter Name');
      return;
    }
    if (!form.phone.trim()) {
      setFormError('Please enter Phone Number');
      return;
    }
    if (!form.dob.trim()) {
      setFormError('Please enter Date of Birth');
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const url = editingRecord ? `${ENDPOINT}/${editingRecord._id}` : ENDPOINT;
      const method = editingRecord ? 'PATCH' : 'POST';

      const payload = {
        name: form.name.trim(),
        maritalGender: form.maritalGender || 'Male',
        gender: form.maritalGender || 'Male',
        phone: form.phone.trim(),
        dob: form.dob.trim(),
        fatherName: form.fatherName.trim(),
        image: form.image,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res) {
        throw new Error('Backend API server on port 5000 is not reachable.');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save form');
      }

      setSuccessMsg(editingRecord ? 'Form updated successfully!' : 'Form added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setViewMode('list');
      fetchRecords();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form record?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' }).catch(() => null);
      if (res && res.ok) {
        fetchRecords();
      }
    } catch {
      alert('Failed to delete form');
    }
  };

  // Sort
  const handleSort = (field: 'formId' | 'name' | 'fatherName' | 'phone' | 'gender' | 'dob') => {
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
        r.formId?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.fatherName?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.gender?.toLowerCase().includes(q) ||
        r.dob?.toLowerCase().includes(q)
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
        return (r[c.key as keyof FormRecord] as string) || '';
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
        return (r[c.key as keyof FormRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'form-list.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {viewMode === 'add_edit' ? (
            <Users className="h-5 w-5 text-slate-700" />
          ) : (
            <div className="h-6 w-6 rounded bg-[#80229a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              📥
            </div>
          )}
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Form
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
          <button
            onClick={() => setViewMode('list')}
            className="font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            Form
          </button>
          {viewMode === 'add_edit' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {editingRecord ? 'Edit Form' : 'Add Form'}
              </span>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* VIEW MODE 1: ADD / EDIT SCREEN (SCREENSHOT 2)              */}
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
              <h2 className="font-bold text-slate-800 text-sm md:text-base">
                {editingRecord ? 'Edit Form' : 'Add Form'}
              </h2>
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
            {/* Row 1: Name *, Marital Gender, Phone * */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Marital Gender
                </label>
                <div className="relative">
                  <select
                    value={form.maritalGender}
                    onChange={(e) => setForm((f) => ({ ...f, maritalGender: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>

            {/* Row 2: Date of Birth *, Father Name, Image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Date of Birth<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Father Name
                </label>
                <input
                  type="text"
                  placeholder="Enter father_name"
                  value={form.fatherName}
                  onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Image
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
                          setForm((f) => ({ ...f, image: file.name }));
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate">
                    {form.image || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
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
        /* VIEW MODE 2: FORM LIST TABLE (SCREENSHOT 1)               */
        /* ═══════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header & + Add Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">Form</h2>
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

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
                <tr>
                  {visibleCols.includes('formId') && (
                    <th
                      onClick={() => handleSort('formId')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        FORM ID
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('name') && (
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        NAME
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('fatherName') && (
                    <th
                      onClick={() => handleSort('fatherName')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        FATHER NAME
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('phone') && (
                    <th
                      onClick={() => handleSort('phone')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        NUMBER
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('gender') && (
                    <th
                      onClick={() => handleSort('gender')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        GENDER
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  {visibleCols.includes('dob') && (
                    <th
                      onClick={() => handleSort('dob')}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        DOB
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}

                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      ACTION
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.length + 1}
                      className="py-12 text-center text-slate-400 text-xs font-medium"
                    >
                      {loading ? 'Loading...' : 'No data available in table'}
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-purple-50/30 transition">
                      {visibleCols.includes('formId') && (
                        <td className="px-4 py-3 font-semibold text-[#80229a]">
                          {r.formId || '—'}
                        </td>
                      )}

                      {visibleCols.includes('name') && (
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {r.name}
                        </td>
                      )}

                      {visibleCols.includes('fatherName') && (
                        <td className="px-4 py-3 text-slate-600">
                          {r.fatherName || '—'}
                        </td>
                      )}

                      {visibleCols.includes('phone') && (
                        <td className="px-4 py-3 text-slate-700 font-mono">
                          {r.phone}
                        </td>
                      )}

                      {visibleCols.includes('gender') && (
                        <td className="px-4 py-3 text-slate-600">
                          {r.maritalGender || r.gender || '—'}
                        </td>
                      )}

                      {visibleCols.includes('dob') && (
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {r.dob}
                        </td>
                      )}

                      <td className="px-4 py-3 text-right pr-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
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
      )}
    </div>
  );
}

