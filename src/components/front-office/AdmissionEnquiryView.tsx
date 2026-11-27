'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FileText,
  Copy,
  Printer,
  Download,
  Upload,
  Eye,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/front-office/admission-enquiry`;

export interface AdmissionEnquiry {
  _id?: string;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  phone: string;
  email?: string;
  course?: string;
  address?: string;
  source?: string;
  status?: string;
  followUpDate?: string;
  enquiryDate?: string;
  remarks?: string;
  createdAt?: string;
}

const SOURCES = ['walk-in', 'phone', 'online', 'reference', 'other'];
const STATUSES = ['pending', 'follow-up', 'admitted', 'rejected', 'cancelled'];

const ALL_COLUMNS = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'course', label: 'Course' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
  { key: 'followUpDate', label: 'Follow Up Date' },
  { key: 'enquiryDate', label: 'Enquiry Date' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'email', label: 'Email' },
  { key: 'remarks', label: 'Remarks' },
];

const statusBadge = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'follow-up': 'bg-blue-100 text-blue-700 border-blue-200',
    admitted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200';
};

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function AdmissionEnquiryView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // ---------- Filter state ----------
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFollowUp, setFilterFollowUp] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // ---------- Data state ----------
  const [records, setRecords] = useState<AdmissionEnquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  // Initialize date range on client side
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setFilterDateFrom(start.toISOString().slice(0, 10));
    setFilterDateTo(end.toISOString().slice(0, 10));
  }, []);

  // ---------- Column visibility ----------
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // ---------- Modal state ----------
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<AdmissionEnquiry | null>(null);
  const [form, setForm] = useState<Partial<AdmissionEnquiry>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // ---------- Fetch ----------
  const fetchRecords = useCallback(async (params?: {
    source?: string;
    status?: string;
    followUpDate?: string;
    enquiryDateFrom?: string;
    enquiryDateTo?: string;
  }) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (params?.source) qs.set('source', params.source);
      if (params?.status) qs.set('status', params.status);
      if (params?.followUpDate) qs.set('followUpDate', params.followUpDate);
      if (params?.enquiryDateFrom) qs.set('enquiryDateFrom', params.enquiryDateFrom);
      if (params?.enquiryDateTo) qs.set('enquiryDateTo', params.enquiryDateTo);
      const queryString = qs.toString();
      const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;
      const res = await fetch(url).catch((err) => {
        console.warn('API connection failed:', err);
        return null;
      });
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.warn('AdmissionEnquiryView fetchRecords error:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (filterDateFrom && filterDateTo) {
          await fetchRecords({ enquiryDateFrom: filterDateFrom, enquiryDateTo: filterDateTo });
        } else {
          await fetchRecords();
        }
      } catch (err) {
        console.warn('AdmissionEnquiryView load error:', err);
      }
    };
    load();
  }, [fetchRecords, filterDateFrom, filterDateTo]);

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

  // ---------- Search filter ----------
  const filteredRows = records.filter((r) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.course?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.fatherName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // ---------- Search handler ----------
  const handleSearch = () => {
    setPage(1);
    fetchRecords({
      source: filterSource,
      status: filterStatus,
      followUpDate: filterFollowUp,
      enquiryDateFrom: filterDateFrom,
      enquiryDateTo: filterDateTo,
    });
  };

  // ---------- CRUD ----------
  const openCreate = () => {
    setEditRecord(null);
    setForm({
      source: 'walk-in',
      status: 'pending',
      enquiryDate: new Date().toISOString().slice(0, 10),
    });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (r: AdmissionEnquiry) => {
    setEditRecord(r);
    setForm({ ...r });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const url = editRecord ? `${ENDPOINT}/${editRecord._id}` : ENDPOINT;
      const method = editRecord ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null);
      if (!res) {
        throw new Error('Backend API server on port 3045 is not reachable. Please ensure the backend is started.');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Failed to save');
      }
      setShowModal(false);
      fetchRecords({
        source: filterSource,
        status: filterStatus,
        followUpDate: filterFollowUp,
        enquiryDateFrom: filterDateFrom,
        enquiryDateTo: filterDateTo,
      });
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry record?')) return;
    await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' }).catch(() => null);
    fetchRecords({
      source: filterSource,
      status: filterStatus,
      followUpDate: filterFollowUp,
      enquiryDateFrom: filterDateFrom,
      enquiryDateTo: filterDateTo,
    });
  };

  // ---------- Export helpers ----------
  const exportCSV = () => {
    const headers = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label);
    const rows = filteredRows.map((r) =>
      ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        const v = r[c.key as keyof AdmissionEnquiry];
        if (c.key === 'followUpDate' || c.key === 'enquiryDate') return fmtDate(v as string);
        return v ?? '';
      })
    );
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'admission-enquiry.csv';
    a.click();
  };

  const copyToClipboard = () => {
    const headers = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label).join('\t');
    const rows = filteredRows.map((r) =>
      ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        const v = r[c.key as keyof AdmissionEnquiry];
        if (c.key === 'followUpDate' || c.key === 'enquiryDate') return fmtDate(v as string);
        return v ?? '';
      }).join('\t')
    );
    navigator.clipboard.writeText([headers, ...rows].join('\n'));
    alert('Copied to clipboard!');
  };

  const handlePrint = () => window.print();

  const inp = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 transition bg-white';
  const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Admission Enquiry</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Admission Enquiry</span>
        </div>
      </div>

      {/* ─── Select Criteria Card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-slate-600" />
          <h2 className="font-bold text-slate-700 text-sm">Select Criteria</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Source */}
          <div>
            <label className={lbl}>Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className={inp}
            >
              <option value="">Select</option>
              {SOURCES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={lbl}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={inp}
            >
              <option value="">Select</option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Next Follow Up Date */}
          <div>
            <label className={lbl}>Next Follow Up Date</label>
            <input
              type="date"
              value={filterFollowUp}
              onChange={(e) => setFilterFollowUp(e.target.value)}
              className={inp}
            />
          </div>

          {/* Enquiry Date Range */}
          <div>
            <label className={lbl}>Enquiry Date</label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={`${inp} text-[11px]`}
              />
              <span className="text-slate-400 text-xs font-medium shrink-0">—</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={`${inp} text-[11px]`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow transition active:scale-95"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>
      </div>

      {/* ─── Enquiry List Card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* List Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base text-slate-700">📑</span>
            <h2 className="font-bold text-slate-800 text-sm">Enquiry List</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow transition active:scale-95">
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* DataTable Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
          {/* Left Buttons: Copy, CSV, Print, Column Visibility */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={copyToClipboard}
              title="Copy to clipboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <button
              onClick={exportCSV}
              title="Export to CSV"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              CSV
            </button>
            <button
              onClick={handlePrint}
              title="Print"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            {/* Column visibility menu */}
            <div className="relative" ref={colMenuRef}>
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <Eye className="h-3.5 w-3.5 text-[#80229a]" />
                Column visibility
                <ChevronDown className={`h-3 w-3 transition-transform ${showColMenu ? 'rotate-180' : ''}`} />
              </button>
              {showColMenu && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2 min-w-[190px]">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 cursor-pointer text-xs text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols.includes(col.key)}
                        onChange={(e) => {
                          setVisibleCols(
                            e.target.checked
                              ? [...visibleCols, col.key]
                              : visibleCols.filter((k) => k !== col.key)
                          );
                        }}
                        className="accent-[#80229a]"
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
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[#80229a]"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-slate-500 font-medium">Search:</span>
              <input
                type="text"
                placeholder=""
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                className="w-36 text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-[#80229a]/20 border-t-[#80229a]" />
            <p className="mt-3 text-xs text-slate-400">Loading enquiries...</p>
          </div>
        ) : pagedRows.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No enquiry records found</p>
            <p className="text-slate-300 text-xs mt-1">
              Adjust filters or click <span className="font-semibold text-[#80229a]">+ Add</span> to create one
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#80229a]/5 border-b border-purple-100">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#80229a] w-10">#</th>
                  {ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#80229a] whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#80229a]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedRows.map((r, i) => (
                  <tr key={r._id} className="hover:bg-purple-50/30 transition">
                    <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    {ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {col.key === 'status' ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${statusBadge(
                              r.status
                            )}`}
                          >
                            {r.status}
                          </span>
                        ) : col.key === 'source' ? (
                          <span className="capitalize">{r.source || '—'}</span>
                        ) : col.key === 'followUpDate' ? (
                          fmtDate(r.followUpDate)
                        ) : col.key === 'enquiryDate' ? (
                          fmtDate(r.enquiryDate)
                        ) : (
                          (r[col.key as keyof AdmissionEnquiry] as string) || '—'
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id!)}
                          className="p-1 text-red-400 hover:bg-red-50 rounded transition"
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
        )}

        {/* Pagination Footer */}
        {!loading && filteredRows.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(page * pageSize, filteredRows.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredRows.length}</span> records
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                FIRST
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded transition ${
                      pg === page
                        ? 'bg-[#80229a] text-white border-[#80229a] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-purple-50'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded bg-white text-slate-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                LAST
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#80229a]/5 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#80229a] flex items-center justify-center text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    {editRecord ? 'Edit Admission Enquiry' : 'New Admission Enquiry'}
                  </h2>
                  <p className="text-[11px] text-slate-400">Front Office → Admission Enquiry</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-start gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Student Info */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#80229a] mb-2.5 border-b border-purple-100 pb-1">
                  Student Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Student Name <span className="text-red-500">*</span></label>
                    <input
                      required
                      className={inp}
                      placeholder="Full name"
                      value={form.studentName || ''}
                      onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Phone <span className="text-red-500">*</span></label>
                    <input
                      required
                      className={inp}
                      placeholder="Mobile number"
                      value={form.phone || ''}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Father Name</label>
                    <input
                      className={inp}
                      placeholder="Father's name"
                      value={form.fatherName || ''}
                      onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Mother Name</label>
                    <input
                      className={inp}
                      placeholder="Mother's name"
                      value={form.motherName || ''}
                      onChange={(e) => setForm((f) => ({ ...f, motherName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input
                      type="email"
                      className={inp}
                      placeholder="email@example.com"
                      value={form.email || ''}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Course</label>
                    <input
                      className={inp}
                      placeholder="Course name"
                      value={form.course || ''}
                      onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>Address</label>
                  <textarea
                    rows={2}
                    className={inp}
                    placeholder="Full address"
                    value={form.address || ''}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Enquiry Details */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#80229a] mb-2.5 border-b border-purple-100 pb-1">
                  Enquiry Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Source</label>
                    <select
                      className={inp}
                      value={form.source || 'walk-in'}
                      onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    >
                      {SOURCES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Status</label>
                    <select
                      className={inp}
                      value={form.status || 'pending'}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Enquiry Date</label>
                    <input
                      type="date"
                      className={inp}
                      value={form.enquiryDate ? String(form.enquiryDate).slice(0, 10) : ''}
                      onChange={(e) => setForm((f) => ({ ...f, enquiryDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Next Follow Up Date</label>
                    <input
                      type="date"
                      className={inp}
                      value={form.followUpDate ? String(form.followUpDate).slice(0, 10) : ''}
                      onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>Remarks</label>
                  <textarea
                    rows={2}
                    className={inp}
                    placeholder="Any additional remarks..."
                    value={form.remarks || ''}
                    onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#80229a] hover:bg-[#68167f] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition shadow"
                >
                  {saving ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>{editRecord ? 'Update Enquiry' : 'Save Enquiry'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
