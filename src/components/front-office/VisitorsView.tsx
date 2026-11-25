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
  Clock,
  Trash2,
  Edit2,
  Upload,
  Camera,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronUp,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/front-office/visitors-book`;

export interface VisitorRecord {
  _id?: string;
  name: string;
  visitorName?: string;
  purpose: string;
  email?: string;
  phone?: string;
  numberOfPerson?: number;
  idCard?: string;
  date?: string;
  inTime?: string;
  outTime?: string;
  attachment?: string;
  note?: string;
  status?: string;
  createdAt?: string;
}

const PURPOSES = [
  'Website',
  'Admission Enquiry',
  'Students Enquiry',
  'Other',
  'Meeting',
  'Parent Visit',
  'Fee Enquiry',
  'Official Work',
];

const ALL_COLUMNS = [
  { key: 'purpose', label: 'PURPOSE' },
  { key: 'name', label: 'NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'phone', label: 'PHONE' },
  { key: 'numberOfPerson', label: 'NO. OF PERSON' },
  { key: 'idCard', label: 'ID CARD' },
  { key: 'date', label: 'DATE' },
  { key: 'inTime', label: 'IN TIME' },
  { key: 'outTime', label: 'OUT TIME' },
];

export default function VisitorsView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State
  const [form, setForm] = useState<Partial<VisitorRecord>>({
    purpose: '',
    name: '',
    email: '',
    phone: '',
    numberOfPerson: 1,
    idCard: '',
    date: '',
    inTime: '',
    outTime: '',
    attachment: '',
    note: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'upload' | 'capture'>('upload');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table State
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<'purpose' | 'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'purpose',
    'name',
    'email',
    'phone',
    'date',
    'inTime',
    'outTime',
  ]);
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Set default date and time on client load
  useEffect(() => {
    const now = new Date();
    const curDate = now.toISOString().slice(0, 10);
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setForm((f) => ({
      ...f,
      date: f.date || curDate,
      inTime: f.inTime || `${hours}:${mins}`,
    }));
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

  // Fetch Visitors from API
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
    if (!form.purpose) {
      setFormError('Please select a Purpose');
      return;
    }
    if (!form.name?.trim()) {
      setFormError('Please enter Visitor Name');
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PATCH' : 'POST';
      const payload = {
        ...form,
        visitorName: form.name,
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
        throw new Error(err.message || 'Failed to save visitor record');
      }

      setSuccessMsg(editingId ? 'Visitor updated successfully!' : 'Visitor added successfully!');
      // Reset form
      const now = new Date();
      setForm({
        purpose: '',
        name: '',
        email: '',
        phone: '',
        numberOfPerson: 1,
        idCard: '',
        date: now.toISOString().slice(0, 10),
        inTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        outTime: '',
        attachment: '',
        note: '',
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
  const handleEdit = (r: VisitorRecord) => {
    setEditingId(r._id || null);
    setForm({
      name: r.name || r.visitorName || '',
      purpose: r.purpose || '',
      email: r.email || '',
      phone: r.phone || '',
      numberOfPerson: r.numberOfPerson || 1,
      idCard: r.idCard || '',
      date: r.date ? String(r.date).slice(0, 10) : '',
      inTime: r.inTime || '',
      outTime: r.outTime || '',
      attachment: r.attachment || '',
      note: r.note || '',
    });
    setFormError('');
    // Scroll to form on small screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    const now = new Date();
    setForm({
      purpose: '',
      name: '',
      email: '',
      phone: '',
      numberOfPerson: 1,
      idCard: '',
      date: now.toISOString().slice(0, 10),
      inTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      outTime: '',
      attachment: '',
      note: '',
    });
    setFormError('');
  };

  // Delete single record
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visitor record?')) return;
    try {
      await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      fetchRecords();
    } catch {
      alert('Failed to delete');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one record to delete');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected record(s)?`)) {
      return;
    }

    try {
      const res = await fetch(`${ENDPOINT}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      }).catch(() => null);
      if (res && res.ok) {
        setSelectedIds([]);
        fetchRecords();
      }
    } catch {
      alert('Bulk delete failed');
    }
  };

  // Select all toggle
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRecords.map((r) => r._id!).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Sorting
  const handleSort = (field: 'purpose' | 'name' | 'date') => {
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
      const n = (r.name || r.visitorName || '').toLowerCase();
      const p = (r.purpose || '').toLowerCase();
      const e = (r.email || '').toLowerCase();
      const ph = (r.phone || '').toLowerCase();
      return n.includes(q) || p.includes(q) || e.includes(q) || ph.includes(q);
    })
    .sort((a, b) => {
      let va = '';
      let vb = '';
      if (sortField === 'purpose') {
        va = a.purpose || '';
        vb = b.purpose || '';
      } else if (sortField === 'name') {
        va = a.name || a.visitorName || '';
        vb = b.name || b.visitorName || '';
      } else {
        va = a.date || a.createdAt || '';
        vb = b.date || b.createdAt || '';
      }
      return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Copy to clipboard
  const copyToClipboard = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)].join('\t');
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        if (c.key === 'name') return r.name || r.visitorName || '';
        return (r[c.key as keyof VisitorRecord] as string) || '';
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
        if (c.key === 'name') return r.name || r.visitorName || '';
        return (r[c.key as keyof VisitorRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'visitors-list.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  const inp = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 transition bg-white';
  const lbl = 'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Visitors Book</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Visitors Book</span>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================== */}
        {/* LEFT COLUMN: Add Visitors Form (4 of 12)                   */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <span className="text-slate-700 text-sm">📝</span>
            <h2 className="font-bold text-slate-800 text-sm">
              {editingId ? 'Edit Visitor' : 'Add Visitors'}
            </h2>
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

            {/* Purpose * */}
            <div>
              <label className={lbl}>
                Purpose <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.purpose || ''}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                className={inp}
              >
                <option value="">select</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Name * */}
            <div>
              <label className={lbl}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder=""
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Email */}
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                placeholder=""
                value={form.email || ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={lbl}>Phone</label>
              <input
                type="tel"
                placeholder=""
                value={form.phone || ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Number Of Person */}
            <div>
              <label className={lbl}>Number Of Person</label>
              <input
                type="number"
                min="1"
                placeholder=""
                value={form.numberOfPerson || 1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numberOfPerson: parseInt(e.target.value) || 1 }))
                }
                className={inp}
              />
            </div>

            {/* Id Card */}
            <div>
              <label className={lbl}>Id Card</label>
              <input
                type="text"
                placeholder=""
                value={form.idCard || ''}
                onChange={(e) => setForm((f) => ({ ...f, idCard: e.target.value }))}
                className={inp}
              />
            </div>

            {/* Date * */}
            <div>
              <label className={lbl}>
                Date <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={form.date ? String(form.date).slice(0, 10) : ''}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inp}
              />
            </div>

            {/* In Time */}
            <div>
              <label className={lbl}>In Time</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#80229a] focus-within:ring-1 focus-within:ring-[#80229a]/20">
                <span className="bg-[#80229a] text-white px-3 flex items-center justify-center shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <input
                  type="time"
                  placeholder="In time"
                  value={form.inTime || ''}
                  onChange={(e) => setForm((f) => ({ ...f, inTime: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
                />
              </div>
            </div>

            {/* Out Time */}
            <div>
              <label className={lbl}>Out Time</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#80229a] focus-within:ring-1 focus-within:ring-[#80229a]/20">
                <span className="bg-[#80229a] text-white px-3 flex items-center justify-center shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <input
                  type="time"
                  placeholder="Out time"
                  value={form.outTime || ''}
                  onChange={(e) => setForm((f) => ({ ...f, outTime: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
                />
              </div>
            </div>

            {/* Attachment (Upload / Capture) */}
            <div>
              <label className={lbl}>Attachment</label>
              <div className="flex items-center gap-4 mb-2 text-xs text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="attachmentType"
                    checked={attachmentType === 'upload'}
                    onChange={() => setAttachmentType('upload')}
                    className="accent-[#80229a]"
                  />
                  <span>Upload</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="attachmentType"
                    checked={attachmentType === 'capture'}
                    onChange={() => setAttachmentType('capture')}
                    className="accent-[#80229a]"
                  />
                  <span>Capture</span>
                </label>
              </div>

              {attachmentType === 'upload' ? (
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
              ) : (
                <div className="border border-dashed border-purple-200 rounded-lg p-3 text-center bg-purple-50/40">
                  <Camera className="h-4 w-4 text-[#80229a] mx-auto mb-1" />
                  <p className="text-[11px] text-[#80229a] font-medium">Capture photo via webcam</p>
                </div>
              )}
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
        {/* RIGHT COLUMN: Visitor List (8 of 12)                       */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header & Bulk Delete Button */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">Visitor List</h2>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="px-3.5 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow transition active:scale-95"
            >
              Bulk Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </button>
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
              <p className="mt-3 text-xs text-slate-400">Loading visitors...</p>
            </div>
          ) : pagedRecords.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No visitor records found</p>
              <p className="text-slate-300 text-xs mt-1">
                Fill the &quot;Add Visitors&quot; form on the left to add a record
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
                  <tr>
                    {/* Select All Checkbox */}
                    <th className="px-3 py-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          pagedRecords.length > 0 &&
                          pagedRecords.every((r) => selectedIds.includes(r._id!))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="accent-[#80229a] cursor-pointer"
                      />
                    </th>

                    {/* Row Number */}
                    <th className="px-3 py-3 w-10 text-[11px] font-bold text-slate-700">#</th>

                    {/* Visible Columns */}
                    {visibleCols.includes('purpose') && (
                      <th
                        onClick={() => handleSort('purpose')}
                        className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          PURPOSE
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                    )}

                    {visibleCols.includes('name') && (
                      <th
                        onClick={() => handleSort('name')}
                        className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          NAME
                          <ArrowUpDown className="h-3 w-3 text-slate-400" />
                        </div>
                      </th>
                    )}

                    {visibleCols.includes('email') && (
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        EMAIL
                      </th>
                    )}

                    {visibleCols.includes('phone') && (
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        PHONE
                      </th>
                    )}

                    {visibleCols.includes('numberOfPerson') && (
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        PERSONS
                      </th>
                    )}

                    {visibleCols.includes('idCard') && (
                      <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        ID CARD
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

                    <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pagedRecords.map((r, i) => {
                    const isSelected = selectedIds.includes(r._id!);
                    return (
                      <tr
                        key={r._id}
                        className={`hover:bg-purple-50/30 transition ${
                          isSelected ? 'bg-purple-50/50' : ''
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(r._id!)}
                            className="accent-[#80229a] cursor-pointer"
                          />
                        </td>

                        {/* Row # */}
                        <td className="px-3 py-3 text-xs text-slate-600 font-medium">
                          {(page - 1) * pageSize + i + 1}
                        </td>

                        {/* Purpose */}
                        {visibleCols.includes('purpose') && (
                          <td className="px-3 py-3 text-xs text-slate-700 font-medium">
                            {r.purpose || '—'}
                          </td>
                        )}

                        {/* Name */}
                        {visibleCols.includes('name') && (
                          <td className="px-3 py-3 text-xs text-slate-800 font-semibold">
                            {r.name || r.visitorName || '—'}
                          </td>
                        )}

                        {/* Email */}
                        {visibleCols.includes('email') && (
                          <td className="px-3 py-3 text-xs text-slate-600 font-mono">
                            {r.email || '—'}
                          </td>
                        )}

                        {/* Phone */}
                        {visibleCols.includes('phone') && (
                          <td className="px-3 py-3 text-xs text-slate-700 font-mono">
                            {r.phone || '—'}
                          </td>
                        )}

                        {/* Persons */}
                        {visibleCols.includes('numberOfPerson') && (
                          <td className="px-3 py-3 text-xs text-slate-700 text-center">
                            {r.numberOfPerson || 1}
                          </td>
                        )}

                        {/* Id Card */}
                        {visibleCols.includes('idCard') && (
                          <td className="px-3 py-3 text-xs text-slate-700">
                            {r.idCard || '—'}
                          </td>
                        )}

                        {/* Date */}
                        {visibleCols.includes('date') && (
                          <td className="px-3 py-3 text-xs text-slate-700 whitespace-nowrap">
                            {r.date ? String(r.date).slice(0, 10) : '—'}
                          </td>
                        )}

                        {/* In Time */}
                        {visibleCols.includes('inTime') && (
                          <td className="px-3 py-3 text-xs text-slate-700">
                            {r.inTime || '—'}
                          </td>
                        )}

                        {/* Out Time */}
                        {visibleCols.includes('outTime') && (
                          <td className="px-3 py-3 text-xs text-slate-700">
                            {r.outTime || '—'}
                          </td>
                        )}

                        {/* Actions */}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Bottom Pagination */}
          {!loading && filteredRecords.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Floating Scroll to Top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-[#80229a] hover:bg-[#68167f] text-white flex items-center justify-center shadow-lg transition active:scale-95 z-20"
        title="Scroll to Top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}

