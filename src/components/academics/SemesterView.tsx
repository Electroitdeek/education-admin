'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  GraduationCap,
  FileEdit,
  List,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SectionItem {
  _id: string;
  name: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function SemesterView({ onNavigate }: Props) {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/academics/sections`);
      if (res.ok) setSections(await res.json());
    } catch {
      showToast('error', 'Failed to load semesters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const q = searchTerm.toLowerCase();
    return sections.filter((s) => s.name.toLowerCase().includes(q));
  }, [sections, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Semester name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `${API}/academics/sections/${editingId}` : `${API}/academics/sections`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        }
      );
      if (!res.ok) throw new Error('Failed to save semester');
      showToast('success', editingId ? 'Semester updated.' : 'Semester added.');
      setEditingId(null);
      setName('');
      fetchSections();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving semester');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: SectionItem) => {
    setEditingId(item._id);
    setName(item.name);
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/academics/sections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Semester deleted.');
      fetchSections();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting semester');
    }
  };

  const handleExportCsv = () => {
    const csv = ['SEMESTER', ...filtered.map((s) => `"${s.name.replace(/"/g, '""')}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semesters.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Semester</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('class-timetable')}
              className="inline-flex items-center gap-1.5 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Academics
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Semester</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit Semester */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-800">Add / Edit Semester</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                  }}
                  className="text-xs text-[#80229a] hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter section"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>

          {/* Right: Semester List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Semester List</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#80229a] rounded-md p-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(filtered.map((s) => s.name).join('\n'))
                    }
                    className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                    title="Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                    title="CSV"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                    title="Print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">SEMESTER</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-10 text-center text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                          Loading semesters...
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-10 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      paginated.map((item) => (
                        <tr key={item._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                          <td className="px-4 py-3 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(openActionId === item._id ? null : item._id)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#80229a] text-white text-xs font-medium cursor-pointer"
                            >
                              Action <ChevronDown className="w-3 h-3" />
                            </button>
                            {openActionId === item._id && (
                              <div className="absolute right-4 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg w-28 text-left py-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item._id)}
                                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  Delete
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

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-gray-200 rounded disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                        page === n ? 'bg-[#80229a] text-white' : 'border border-gray-200 text-gray-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-gray-200 rounded disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

