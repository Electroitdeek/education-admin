'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  GraduationCap,
  FileEdit,
  List,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
  'PARAMEDICAL',
];

const CO_TYPES = ['Co-Scholastic', 'Scholastic', 'Sports', 'Cultural', 'Community Service'];

interface CoSubject {
  _id: string;
  name: string;
  code: string;
  course?: string;
  type: string;
  isCoCurricular?: boolean;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function CoCurricularSubjectView({ onNavigate }: Props) {
  const [items, setItems] = useState<CoSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [course, setCourse] = useState('');
  const [type, setType] = useState('Co-Scholastic');

  const [searchTerm, setSearchTerm] = useState('');
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    code: true,
    course: true,
    type: true,
    action: true,
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/academics/subjects`);
      if (res.ok) {
        const data = await res.json();
        const list: CoSubject[] = Array.isArray(data) ? data : [];
        setItems(
          list.filter((s) => s.isCoCurricular || s.type === 'Co-Scholastic' || CO_TYPES.includes(s.type))
        );
      }
    } catch {
      showToast('error', 'Failed to load co-curricular subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.code || '').toLowerCase().includes(q) ||
        (i.course || '').toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !course) {
      showToast('error', 'Name and Course are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/academics/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || `CO-${Date.now().toString().slice(-4)}`,
          course,
          type,
          isCoCurricular: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to save co-curricular subject');
      showToast('success', 'Co-Curricular Subject added.');
      setName('');
      setCode('');
      setCourse('');
      setType('Co-Scholastic');
      fetchItems();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/academics/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Deleted co-curricular subject.');
      fetchItems();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting subject');
    }
  };

  const handleExportCsv = () => {
    const headers = ['NAME', 'CODE', 'COURSE', 'TYPE'];
    const rows = filtered.map((i) => [i.name, i.code, i.course || '-', i.type]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'co-curricular-subjects.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Exported CSV.');
  };

  const handleCopy = async () => {
    const headers = ['NAME', 'CODE', 'COURSE', 'TYPE'];
    const rows = filtered.map((i) => [i.name, i.code, i.course || '-', i.type].join('\t'));
    try {
      await navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n'));
      showToast('success', 'Copied to clipboard.');
    } catch {
      showToast('error', 'Failed to copy.');
    }
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
        {/* Header & Breadcrumb (exact match to screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Co-Curricular Subject</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('subjects')}
              className="inline-flex items-center gap-1.5 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Academics
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Co-Curricular Subject</span>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Card: Add Co-Curricular Subject */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Add Co-Curricular Subject</h2>
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
                  placeholder="Enter name"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="">Select Course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  {CO_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
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

          {/* Right Card: Co-Curricular Subject List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Co-Curricular Subject List</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 bg-[#80229a] rounded-md p-1 relative">
                  <button
                    type="button"
                    onClick={handleCopy}
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
                  <button
                    type="button"
                    onClick={() => setShowColMenu((v) => !v)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/15 rounded cursor-pointer"
                  >
                    Column visibility <ChevronDown className="w-3 h-3" />
                  </button>

                  {showColMenu && (
                    <div className="absolute left-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-40 text-xs text-gray-700">
                      {Object.entries(visibleCols).map(([k, v]) => (
                        <label
                          key={k}
                          className="flex items-center gap-2 px-2 py-1 hover:bg-purple-50 rounded cursor-pointer capitalize"
                        >
                          <input
                            type="checkbox"
                            checked={v}
                            onChange={() =>
                              setVisibleCols((p) => ({
                                ...p,
                                [k]: !p[k as keyof typeof p],
                              }))
                            }
                            className="accent-[#80229a]"
                          />
                          {k}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      {visibleCols.name && <th className="px-4 py-3">NAME</th>}
                      {visibleCols.code && <th className="px-4 py-3">CODE</th>}
                      {visibleCols.course && <th className="px-4 py-3">COURSE</th>}
                      {visibleCols.type && <th className="px-4 py-3">TYPE</th>}
                      {visibleCols.action && <th className="px-4 py-3 text-right">ACTION</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                          Loading subjects...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item._id} className="hover:bg-purple-50/30">
                          {visibleCols.name && (
                            <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                          )}
                          {visibleCols.code && (
                            <td className="px-4 py-3 text-gray-600">{item.code}</td>
                          )}
                          {visibleCols.course && (
                            <td className="px-4 py-3 text-gray-600">{item.course || '-'}</td>
                          )}
                          {visibleCols.type && (
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-[#80229a]">
                                {item.type}
                              </span>
                            </td>
                          )}
                          {visibleCols.action && (
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDelete(item._id)}
                                title="Delete"
                                className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>
                  Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length}{' '}
                  entries
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 border border-gray-200 rounded text-gray-400">
                    Previous
                  </span>
                  <span className="px-2.5 py-1 border border-gray-200 rounded text-gray-400">
                    Next
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

