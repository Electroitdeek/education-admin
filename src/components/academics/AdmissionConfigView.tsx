'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
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

const DEFAULT_BATCHES = [
  'GNM 2023-2026',
  'GNM 2024-2027',
  'GNM 2025-2028',
  'B.Sc Nursing 2023-2027',
  'B.Sc Nursing 2024-2028',
  '2025-26',
];

interface ConfigItem {
  _id: string;
  prefix: string;
  course: string;
  batch: string;
  range: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function AdmissionConfigView({ onNavigate }: Props) {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [batches, setBatches] = useState<string[]>(DEFAULT_BATCHES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [prefix, setPrefix] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [range, setRange] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([
        fetch(`${API}/academics/admission-configs`),
        fetch(`${API}/student-info/batches`),
      ]);
      if (cRes.ok) setConfigs(await cRes.json());
      if (bRes.ok) {
        const bData = await bRes.json();
        const bList = (Array.isArray(bData) ? bData : bData.items || [])
          .map((b: any) => b.name)
          .filter(Boolean);
        if (bList.length > 0) setBatches(Array.from(new Set([...bList, ...DEFAULT_BATCHES])));
      }
    } catch {
      showToast('error', 'Failed to load admission configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return configs;
    const q = searchTerm.toLowerCase();
    return configs.filter(
      (c) =>
        c.prefix.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q) ||
        c.batch.toLowerCase().includes(q) ||
        c.range.toLowerCase().includes(q)
    );
  }, [configs, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim() || !course || !batch || !range.trim()) {
      showToast('error', 'All required fields must be filled.');
      return;
    }
    setSaving(true);
    try {
      const payload = { prefix: prefix.trim(), course, batch, range: range.trim() };
      const res = await fetch(
        editingId
          ? `${API}/academics/admission-configs/${editingId}`
          : `${API}/academics/admission-configs`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Failed to save configuration');
      showToast('success', editingId ? 'Configuration updated.' : 'Configuration saved.');
      setEditingId(null);
      setPrefix('');
      setCourse('');
      setBatch('');
      setRange('');
      fetchConfigs();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ConfigItem) => {
    setEditingId(item._id);
    setPrefix(item.prefix);
    setCourse(item.course);
    setBatch(item.batch);
    setRange(item.range);
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/academics/admission-configs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Configuration deleted.');
      fetchConfigs();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting configuration');
    }
  };

  const handleExportCsv = () => {
    const headers = ['PREFIX', 'COURSE', 'BATCH', 'RANGE'];
    const rows = filtered.map((c) => [c.prefix, c.course, c.batch, c.range]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission-configurations.csv';
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
            <SlidersHorizontal className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Admission Configuration</h1>
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
            <span className="text-gray-600">Admission Configuration</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-800">Add / Edit</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setPrefix('');
                    setCourse('');
                    setBatch('');
                    setRange('');
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
                  Admission Prefix <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Enter Prefix"
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
                <label className="block font-medium text-gray-700 mb-1.5">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Range <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder="Enter Range"
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

          {/* Right: Admission Configuration List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">
                Admission Configuration List
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#80229a] rounded-md p-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        filtered.map((c) => `${c.prefix}\t${c.course}\t${c.batch}\t${c.range}`).join('\n')
                      )
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">PREFIX</th>
                      <th className="px-4 py-3">COURSE</th>
                      <th className="px-4 py-3">BATCH</th>
                      <th className="px-4 py-3">RANGE</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                          Loading configurations...
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
                          <td className="px-4 py-3 font-medium text-gray-800">{item.prefix}</td>
                          <td className="px-4 py-3 text-gray-700">{item.course}</td>
                          <td className="px-4 py-3 text-gray-600">{item.batch}</td>
                          <td className="px-4 py-3 text-gray-600">{item.range}</td>
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

      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

