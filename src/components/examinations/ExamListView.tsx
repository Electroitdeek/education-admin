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

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

interface ExamTerm {
  _id: string;
  name: string;
}

interface ExamItem {
  _id: string;
  order?: number;
  examGroupName: string;
  name: string;
  description?: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ExamListView({ onNavigate }: Props) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [order, setOrder] = useState<string>('');
  const [termName, setTermName] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const [search, setSearch] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, termsRes] = await Promise.all([
        fetch(`${API}/examinations/exams`),
        fetch(`${API}/examinations/exam-groups`),
      ]);
      if (examsRes.ok) {
        const data = await examsRes.json();
        setExams(Array.isArray(data) ? data : []);
      }
      if (termsRes.ok) {
        const tData = await termsRes.json();
        setTerms(Array.isArray(tData) ? tData : []);
      }
    } catch {
      showToast('error', 'Failed to load exam list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setOrder('');
    setTermName('');
    setName('');
    setNote('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !termName || !name.trim()) {
      showToast('error', 'Please fill Order, Term, and Name');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        order: Number(order) || 1,
        examGroupName: termName,
        name: name.trim(),
        description: note.trim(),
      };
      const url = editingId
        ? `${API}/examinations/exams/${editingId}`
        : `${API}/examinations/exams`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('success', editingId ? 'Exam updated successfully' : 'Exam saved successfully');
        resetForm();
        fetchData();
      } else {
        showToast('error', 'Failed to save exam');
      }
    } catch {
      showToast('error', 'Network error while saving exam');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exam: ExamItem) => {
    setEditingId(exam._id);
    setOrder(String(exam.order ?? 1));
    setTermName(exam.examGroupName || '');
    setName(exam.name || '');
    setNote(exam.description || '');
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/examinations/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Exam deleted');
        if (editingId === id) resetForm();
        fetchData();
      }
    } catch {
      showToast('error', 'Failed to delete exam');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter(
      (ex) =>
        ex.name?.toLowerCase().includes(q) ||
        ex.examGroupName?.toLowerCase().includes(q) ||
        String(ex.order ?? '').includes(q)
    );
  }, [exams, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [
      ['Order', 'Term', 'Name', 'Note'],
      ...filtered.map((ex) => [ex.order ?? 1, ex.examGroupName || '', ex.name || '', ex.description || '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTable = () => {
    const text = filtered.map((ex) => `${ex.order ?? 1}\t${ex.examGroupName}\t${ex.name}`).join('\n');
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
          <h1 className="text-xl font-bold text-slate-800">Exam List</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Exam List</span>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Add / Edit Exam List */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              {editingId ? 'Edit Exam List' : 'Add / Edit Exam List'}
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Order <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="Order No."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Term <span className="text-rose-500">*</span>
              </label>
              <select
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              >
                <option value="">Select Term</option>
                {terms.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Note</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
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

        {/* Right: Exam List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <List className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Exam List</h2>
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
                    <th className="px-4 py-3">ORDER</th>
                    <th className="px-4 py-3">TERM</th>
                    <th className="px-4 py-3">NAME</th>
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
                    paginated.map((exam) => (
                      <tr key={exam._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-medium">{exam.order ?? 1}</td>
                        <td className="px-4 py-3">{exam.examGroupName}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{exam.name}</td>
                        <td className="px-4 py-3 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenActionId(openActionId === exam._id ? null : exam._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#6b1b82] text-white text-xs font-medium rounded-lg transition cursor-pointer"
                          >
                            Action <ChevronDown className="w-3 h-3" />
                          </button>
                          {openActionId === exam._id && (
                            <div className="absolute right-4 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-left">
                              <button
                                type="button"
                                onClick={() => handleEdit(exam)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#80229a]" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(exam._id)}
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

