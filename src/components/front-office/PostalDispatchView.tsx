'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  Search,
  Copy,
  Printer,
  Download,
  Eye,
  ChevronDown,
  Trash2,
  Edit2,
  Upload,
  ChevronRight,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/front-office/postal-dispatch`;

export interface PostalDispatchRecord {
  _id?: string;
  toTitle: string;
  fromTitle: string;
  referenceNo: string;
  address?: string;
  note?: string;
  date?: string;
  toName?: string;
  toAddress?: string;
  attachment?: string;
  createdAt?: string;
}

const ALL_COLUMNS = [
  { key: 'toTitle', label: 'TO TITLE' },
  { key: 'referenceNo', label: 'REFERENCE NO' },
  { key: 'fromTitle', label: 'FROM TITLE' },
  { key: 'date', label: 'DATE' },
  { key: 'address', label: 'ADDRESS' },
  { key: 'note', label: 'NOTE' },
];

export default function PostalDispatchView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State
  const [form, setForm] = useState<Partial<PostalDispatchRecord>>({
    toTitle: '',
    fromTitle: '',
    referenceNo: '',
    address: '',
    note: '',
    date: '',
    attachment: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table State
  const [records, setRecords] = useState<PostalDispatchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<'toTitle' | 'referenceNo' | 'fromTitle' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'toTitle',
    'referenceNo',
    'fromTitle',
    'date',
  ]);
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Initialize date on client
  useEffect(() => {
    const curDate = new Date().toISOString().slice(0, 10);
    setForm((f) => ({ ...f, date: f.date || curDate }));
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

  // Fetch dispatches
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
  }, [fetchRecords]);

  // Handle Form Submit (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toTitle?.trim()) {
      setFormError('Please enter To Title');
      return;
    }
    if (!form.fromTitle?.trim()) {
      setFormError('Please enter From Title');
      return;
    }
    if (!form.referenceNo?.trim()) {
      setFormError('Please enter Reference No');
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null);

      if (!res) {
        throw new Error('Backend API server on port 3045 is not reachable.');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save postal dispatch');
      }

      setSuccessMsg(editingId ? 'Dispatch updated successfully!' : 'Dispatch added successfully!');
      // Reset form
      setForm({
        toTitle: '',
        fromTitle: '',
        referenceNo: '',
        address: '',
        note: '',
        date: new Date().toISOString().slice(0, 10),
        attachment: '',
      });
      setEditingId(null);
      fetchRecords();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  // Edit record
  const handleEdit = (r: PostalDispatchRecord) => {
    setEditingId(r._id || null);
    setForm({
      toTitle: r.toTitle || '',
      fromTitle: r.fromTitle || '',
      referenceNo: r.referenceNo || '',
      address: r.address || '',
      note: r.note || '',
      date: r.date ? String(r.date).slice(0, 10) : '',
      attachment: r.attachment || '',
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      toTitle: '',
      fromTitle: '',
      referenceNo: '',
      address: '',
      note: '',
      date: new Date().toISOString().slice(0, 10),
      attachment: '',
    });
    setFormError('');
  };

  // Delete record
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this postal dispatch?')) return;
    try {
      await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch {
      alert('Failed to delete');
    }
  };

  // Sorting
  const handleSort = (field: 'toTitle' | 'referenceNo' | 'fromTitle' | 'date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search
  const filteredRecords = records
    .filter((r) => {
      if (!tableSearch) return true;
      const q = tableSearch.toLowerCase();
      const t = (r.toTitle || '').toLowerCase();
      const f = (r.fromTitle || '').toLowerCase();
      const ref = (r.referenceNo || '').toLowerCase();
      const addr = (r.address || '').toLowerCase();
      return t.includes(q) || f.includes(q) || ref.includes(q) || addr.includes(q);
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toLowerCase();
      const vb = (b[sortField] || '').toLowerCase();
      return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Copy to clipboard
  const copyToClipboard = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)].join('\t');
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof PostalDispatchRecord] as string) || '';
      });
      return [i + 1, ...vals].join('\t');
    });
    navigator.clipboard.writeText([headers, ...rows].join('\n'));
    alert('Copied to clipboard!');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof PostalDispatchRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'postal-dispatch-list.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  const inp =
    'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 transition bg-white';
  const lbl = 'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Postal Dispatch</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Postal Dispatch</span>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================== */}
        {/* LEFT COLUMN: Add & Edit Form (4 of 12)                    */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <span className="text-slate-700 text-sm">📝</span>
            <h2 className="font-bold text-slate-800 text-sm">Add & Edit</h2>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="p-5 space-y-3.5">
            {formError && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                ⚠️ {formError}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100">
                ✅ {successMsg}
              </div>
            )}

            {/* To Title * */}
            <div>
              <label className={lbl}>
                To Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder=""
                value={form.toTitle || ''}
                onChange={(e) => setForm((f) => ({ ...f, toTitle: e.target.value }))}
                className={inp}
              />
            </div>

            {/* From Title * */}
            <div>
              <label className={lbl}>
                From Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder=""
                value={form.fromTitle || ''}
                onChange={(e) => setForm((f) => ({ ...f, fromTitle: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Reference No * */}
            <div>
              <label className={lbl}>
                Reference No <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder=""
                value={form.referenceNo || ''}
                onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Address */}
            <div>
              <label className={lbl}>Address</label>
              <textarea
                rows={2}
                placeholder=""
                value={form.address || ''}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Note */}
            <div>
              <label className={lbl}>Note</label>
              <textarea
                rows={2}
                placeholder=""
                value={form.note || ''}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Date */}
            <div>
              <label className={lbl}>Date</label>
              <input
                type="date"
                value={form.date ? String(form.date).slice(0, 10) : ''}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Attachment */}
            <div>
              <label className={lbl}>Attachment</label>
              <div className="border border-dashed border-slate-200 rounded-lg p-2.5 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                <Upload className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((f) => ({ ...f, attachment: file.name }));
                  }}
                  className="text-[11px] text-slate-500 w-full"
                />
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow transition active:scale-95"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: Postal Dispatch List (8 of 12)              */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">Postal Dispatch List</h2>
            </div>
          </div>

          {/* Table Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
            {/* Left Action Buttons: Copy, CSV, Print, Column Visibility */}
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

              {/* Column Visibility dropdown */}
              <div className="relative" ref={colMenuRef}>
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Eye className="h-3.5 w-3.5 text-[#80229a]" />
                  Column visibility
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showColMenu ? 'rotate-180' : ''}`}
                  />
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

            {/* Right: Search */}
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

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-[#80229a]/20 border-t-[#80229a]" />
              <p className="mt-3 text-xs text-slate-400">Loading postal dispatch records...</p>
            </div>
          ) : pagedRecords.length === 0 ? (
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
                          TO TITLE
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          REFERENCE NO
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1">
                          FROM TITLE
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
                        <div className="flex items-center gap-1">
                          ACTION
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
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

                      {visibleCols.includes('toTitle') && (
                        <th
                          onClick={() => handleSort('toTitle')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            TO TITLE
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </th>
                      )}

                      {visibleCols.includes('referenceNo') && (
                        <th
                          onClick={() => handleSort('referenceNo')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            REFERENCE NO
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </th>
                      )}

                      {visibleCols.includes('fromTitle') && (
                        <th
                          onClick={() => handleSort('fromTitle')}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1">
                            FROM TITLE
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          </div>
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

                      {visibleCols.includes('address') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          ADDRESS
                        </th>
                      )}

                      {visibleCols.includes('note') && (
                        <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          NOTE
                        </th>
                      )}

                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {pagedRecords.map((r, i) => (
                      <tr key={r._id} className="hover:bg-purple-50/30 transition">
                        <td className="px-3 py-3 text-xs text-slate-600 font-medium">
                          {(page - 1) * pageSize + i + 1}
                        </td>

                        {visibleCols.includes('toTitle') && (
                          <td className="px-3 py-3 text-xs text-slate-800 font-semibold">
                            {r.toTitle || r.toName || '—'}
                          </td>
                        )}

                        {visibleCols.includes('referenceNo') && (
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono">
                            {r.referenceNo || '—'}
                          </td>
                        )}

                        {visibleCols.includes('fromTitle') && (
                          <td className="px-3 py-3 text-xs text-slate-700">
                            {r.fromTitle || '—'}
                          </td>
                        )}

                        {visibleCols.includes('date') && (
                          <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {r.date ? String(r.date).slice(0, 10) : '—'}
                          </td>
                        )}

                        {visibleCols.includes('address') && (
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {r.address || r.toAddress || '—'}
                          </td>
                        )}

                        {visibleCols.includes('note') && (
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {r.note || '—'}
                          </td>
                        )}

                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(r)}
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

              {/* Table Bottom Pagination */}
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
                    className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
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
                    className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

