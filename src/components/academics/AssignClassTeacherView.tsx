'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
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

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

const TEACHERS = [
  'Dr. Pooja Sharma',
  'Prof. Rajesh Deshmukh',
  'Prof. Ananya Sen',
  'Dr. K. N. Joshi',
  'Dr. S. K. Roy',
  'Gaurav Kumar Bhardwaj',
  'Tarun Kumar Sharma',
  'Praveen Kumar',
  'Bhushan Sharma',
  'Sister Mary Joseph',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function AssignClassTeacherView({ onNavigate }: Props) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [classTeacher, setClassTeacher] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/academics/assign-class-teacher`);
      if (res.ok) setList(await res.json());
    } catch {
      showToast('error', 'Failed to load class teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (i) =>
        i.course.toLowerCase().includes(q) ||
        i.semester.toLowerCase().includes(q) ||
        i.classTeacher.toLowerCase().includes(q)
    );
  }, [list, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !semester || !classTeacher) {
      showToast('error', 'Course, Semester, and Class Teacher are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/academics/assign-class-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, semester, classTeacher }),
      });
      if (!res.ok) throw new Error('Failed to assign class teacher');
      showToast('success', 'Class Teacher assigned successfully.');
      setCourse('');
      setSemester('');
      setClassTeacher('');
      fetchList();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving class teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setCourse(item.course);
    setSemester(item.semester);
    setClassTeacher(item.classTeacher);
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/academics/assign-class-teacher/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Class Teacher assignment removed.');
      fetchList();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting');
    }
  };

  const handleExportCsv = () => {
    const headers = ['COURSE', 'SEMESTER', 'CLASS TEACHER'];
    const rows = filtered.map((i) => [i.course, i.semester, i.classTeacher]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assign-class-teacher.csv';
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
            <UserCheck className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Assign Class Teacher</h1>
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
            <span className="text-gray-600">Assign Class Teacher</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit Class Teacher */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Add / Edit Class Teacher</h2>
            </div>

            <div className="p-5 space-y-4 text-xs">
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
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Class Teacher <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="">Select</option>
                  {TEACHERS.map((t) => (
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

          {/* Right: Assign Class Teacher List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Assign Class Teacher List</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#80229a] rounded-md p-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        filtered.map((i) => `${i.course}\t${i.semester}\t${i.classTeacher}`).join('\n')
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
                      <th className="px-4 py-3">COURSE</th>
                      <th className="px-4 py-3">SEMESTER</th>
                      <th className="px-4 py-3">CLASS TEACHER</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                          Loading...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{item.course}</td>
                          <td className="px-4 py-3 text-gray-600">{item.semester}</td>
                          <td className="px-4 py-3 text-gray-700 uppercase">{item.classTeacher}</td>
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
