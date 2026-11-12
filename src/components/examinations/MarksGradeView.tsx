'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Edit3,
  Trash2,
  Copy,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  List,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MarksGrade {
  _id: string;
  gradeName: string;
  percentFrom: number;
  percentUpto: number;
  gradePoint?: number;
  description?: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function MarksGradeView({ onNavigate }: Props) {
  const [grades, setGrades] = useState<MarksGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [gradeName, setGradeName] = useState('');
  const [percentFrom, setPercentFrom] = useState('');
  const [percentUpto, setPercentUpto] = useState('');
  const [description, setDescription] = useState('');

  const [search, setSearch] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/examinations/grades`);
      if (res.ok) {
        const data = await res.json();
        setGrades(Array.isArray(data) ? data : []);
      }
    } catch {
      showToast('error', 'Failed to load grade list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setGradeName('');
    setPercentFrom('');
    setPercentUpto('');
    setDescription('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeName.trim() || percentFrom === '' || percentUpto === '') {
      showToast('error', 'Please fill Grade Name, Percent From, and Percent Upto');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        gradeName: gradeName.trim(),
        percentFrom: Number(percentFrom),
        percentUpto: Number(percentUpto),
        gradePoint: 0,
        description: description.trim(),
      };
      const url = editingId
        ? `${API}/examinations/grades/${editingId}`
        : `${API}/examinations/grades`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('success', editingId ? 'Grade updated successfully' : 'Grade saved successfully');
        resetForm();
        fetchGrades();
      } else {
        showToast('error', 'Failed to save grade (duplicate grade name?)');
      }
    } catch {
      showToast('error', 'Network error while saving grade');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (g: MarksGrade) => {
    setEditingId(g._id);
    setGradeName(g.gradeName || '');
    setPercentFrom(String(g.percentFrom ?? ''));
    setPercentUpto(String(g.percentUpto ?? ''));
    setDescription(g.description || '');
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/examinations/grades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Grade deleted');
        if (editingId === id) resetForm();
        fetchGrades();
      }
    } catch {
      showToast('error', 'Failed to delete grade');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grades;
    return grades.filter(
      (g) =>
        g.gradeName?.toLowerCase().includes(q) ||
        String(g.percentFrom).includes(q) ||
        String(g.percentUpto).includes(q)
    );
  }, [grades, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [
      ['Grade Name', 'Percent From', 'Percent Upto', 'Description'],
      ...filtered.map((g) => [g.gradeName, g.percentFrom, g.percentUpto, g.description || '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marks_grade.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTable = () => {
    const text = filtered.map((g) => `${g.gradeName}\t${g.percentFrom}\t${g.percentUpto}`).join('\n');
    navigator.clipboard?.writeText(text);
    showToast('success', 'Copied to clipboard');
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header + Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">Marks Grade</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Marks Grade</span>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Add / Edit Grade List */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId ? 'Edit Grade List' : 'Add / Edit Grade List'}
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Grade Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={gradeName}
                onChange={(e) => setGradeName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Percent From <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={percentFrom}
                onChange={(e) => setPercentFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Percent Upto <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={percentUpto}
                onChange={(e) => setPercentUpto(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        {/* Right: Grade List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <List className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Grade List</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-lg overflow-hidden bg-[#80229a] text-white text-xs font-medium shadow-sm">
                <button
                  type="button"
                  onClick={copyTable}
                  title="Copy"
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  title="Excel"
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  title="CSV"
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print"
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-2 border-l border-white/15 flex items-center gap-1 select-none">
                  Column visibility <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-44"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    <th className="px-4 py-3">GRADE NAME</th>
                    <th className="px-4 py-3">PERCENT FROM</th>
                    <th className="px-4 py-3">PERCENT UPTO</th>
                    <th className="px-4 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        Loading...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginated.map((g) => (
                      <tr key={g._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-slate-800">{g.gradeName}</td>
                        <td className="px-4 py-3">{g.percentFrom}</td>
                        <td className="px-4 py-3">{g.percentUpto}</td>
                        <td className="px-4 py-3 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenActionId(openActionId === g._id ? null : g._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#6b1b82] text-white text-xs font-medium rounded-lg transition cursor-pointer"
                          >
                            Action <ChevronDown className="w-3 h-3" />
                          </button>
                          {openActionId === g._id && (
                            <div className="absolute right-4 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-left">
                              <button
                                type="button"
                                onClick={() => handleEdit(g)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#80229a]" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(g._id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
              </span>
              <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border-l border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
