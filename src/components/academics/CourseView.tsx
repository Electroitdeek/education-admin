'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Monitor,
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

interface CourseItem {
  _id: string;
  srNo?: number;
  name: string;
  code?: string;
  fullName?: string;
  semesters?: string;
  duration?: string;
  status?: string;
}

const SEMESTER_PRESETS = [
  '1st Semester, 2nd Semester, 3rd Semester, 4th Semester, 5th Semester, 6th Semester, 7th Semester, 8th Semester',
  '1st Year, 2nd Year, 3rd Year, 1st Year (OLD)',
  '1st Year, 2nd Year, 1st Year (OLD)',
  'Semester 1, Semester 2, Semester 3, Semester 4',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function CourseView({ onNavigate }: Props) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [srNo, setSrNo] = useState('1');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [fullName, setFullName] = useState('');
  const [semesters, setSemesters] = useState(SEMESTER_PRESETS[0]);
  const [status, setStatus] = useState('Active');

  const [searchTerm, setSearchTerm] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/academics/courses`);
      if (res.ok) {
        const data = await res.json();
        const list: CourseItem[] = Array.isArray(data) ? data : [];
        setCourses(list);
        if (!editingId) setSrNo(String(list.length + 1));
      }
    } catch {
      showToast('error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const q = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.semesters || '').toLowerCase().includes(q) ||
        (c.status || 'Active').toLowerCase().includes(q)
    );
  }, [courses, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !semesters.trim()) {
      showToast('error', 'Course and Semester are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        srNo: Number(srNo) || courses.length + 1,
        name: name.trim(),
        code: name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8),
        duration: duration.trim() || '4 Years',
        fullName: fullName.trim() || name.trim(),
        semesters: semesters.trim(),
        status,
      };
      const res = await fetch(
        editingId ? `${API}/academics/courses/${editingId}` : `${API}/academics/courses`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Failed to save course');
      showToast('success', editingId ? 'Course updated.' : 'Course added.');
      setEditingId(null);
      setName('');
      setDuration('');
      setFullName('');
      setStatus('Active');
      fetchCourses();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: CourseItem) => {
    setEditingId(c._id);
    setSrNo(String(c.srNo ?? 1));
    setName(c.name);
    setDuration(c.duration || '');
    setFullName(c.fullName || '');
    setSemesters(c.semesters || SEMESTER_PRESETS[0]);
    setStatus(c.status || 'Active');
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/academics/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Course deleted.');
      fetchCourses();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting course');
    }
  };

  const handleExportCsv = () => {
    const headers = ['SR. NO', 'COURSE', 'SEMESTER', 'STATUS'];
    const rows = filtered.map((c, idx) => [
      String(c.srNo ?? idx + 1),
      c.name,
      c.semesters || '-',
      c.status || 'Active',
    ]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
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
            <Monitor className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Course</h1>
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
            <span className="text-gray-600">Course</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit Course */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-800">Add / Edit Course</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setDuration('');
                    setFullName('');
                  }}
                  className="text-xs text-[#80229a] hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Sr. No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={srNo}
                  onChange={(e) => setSrNo(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter class"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter Duration"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Course Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Course Full Name"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={semesters}
                  onChange={(e) => setSemesters(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  {SEMESTER_PRESETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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

          {/* Right: Course List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Course List</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#80229a] rounded-md p-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        filtered
                          .map((c, idx) => `${c.srNo ?? idx + 1}\t${c.name}\t${c.semesters || '-'}\t${c.status || 'Active'}`)
                          .join('\n')
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
                      <th className="px-4 py-3">SR. NO</th>
                      <th className="px-4 py-3">COURSE</th>
                      <th className="px-4 py-3">SEMESTER</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                          Loading courses...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c, idx) => (
                        <tr key={c._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 text-gray-700">{c.srNo ?? idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs">{c.semesters || '-'}</td>
                          <td className="px-4 py-3 text-gray-700">{c.status || 'Active'}</td>
                          <td className="px-4 py-3 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(openActionId === c._id ? null : c._id)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#80229a] text-white text-xs font-medium cursor-pointer"
                            >
                              Action <ChevronDown className="w-3 h-3" />
                            </button>
                            {openActionId === c._id && (
                              <div className="absolute right-4 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg w-28 text-left py-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(c)}
                                  className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(c._id)}
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
                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-1 border border-gray-200 rounded text-gray-400">
                    Previous
                  </span>
                  <span className="px-2.5 py-1 bg-[#80229a] text-white rounded font-medium">1</span>
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

