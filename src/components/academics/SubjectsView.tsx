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
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SubjectItem {
  _id: string;
  name: string;
  type: string;
  code: string;
  credits?: number;
  isCoCurricular?: boolean;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function SubjectsView({ onNavigate }: Props) {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('0');
  const [type, setType] = useState('Theory');

  const [searchTerm, setSearchTerm] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/academics/subjects`);
      if (res.ok) {
        const data = await res.json();
        const list: SubjectItem[] = Array.isArray(data) ? data : [];
        setSubjects(list.filter((s) => !s.isCoCurricular));
      }
    } catch {
      showToast('error', 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return subjects;
    const q = searchTerm.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
    );
  }, [subjects, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Subject Name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || `SUB-${Date.now().toString().slice(-4)}`,
        credits: Number(credits) || 0,
        type,
      };
      const res = await fetch(
        editingId ? `${API}/academics/subjects/${editingId}` : `${API}/academics/subjects`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Failed to save subject');
      showToast('success', editingId ? 'Subject updated.' : 'Subject added.');
      setEditingId(null);
      setName('');
      setCode('');
      setCredits('0');
      setType('Theory');
      fetchSubjects();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: SubjectItem) => {
    setEditingId(s._id);
    setName(s.name);
    setCode(s.code || '');
    setCredits(String(s.credits ?? 0));
    setType(s.type || 'Theory');
    setOpenActionId(null);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${API}/academics/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Subject deleted.');
      fetchSubjects();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting subject');
    }
  };

  const handleExportCsv = () => {
    const headers = ['NAME', 'TYPE', 'CODE', 'CREDITS'];
    const rows = filtered.map((s) => [s.name, s.type, s.code || '', String(s.credits ?? 0)]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subjects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
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
            <BookOpen className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Subject</h1>
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
            <span className="text-gray-600">Subject</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit Subject */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-800">Add / Edit Subject</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setCode('');
                    setCredits('0');
                    setType('Theory');
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
                <label className="block font-medium text-gray-700 mb-1.5">Credits</label>
                <input
                  type="number"
                  min={0}
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="Enter credits"
                  className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Type <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-5 pt-1">
                  {['Theory', 'Practical'].map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subType"
                        checked={type === t}
                        onChange={() => setType(t)}
                        className="accent-[#80229a]"
                      />
                      <span className="text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
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

          {/* Right: Subject List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Subject List</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#80229a] rounded-md p-1">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        filtered.map((s) => `${s.name}\t${s.type}\t${s.code}\t${s.credits ?? 0}`).join('\n')
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
                      <th className="px-4 py-3">NAME</th>
                      <th className="px-4 py-3">TYPE</th>
                      <th className="px-4 py-3">CODE</th>
                      <th className="px-4 py-3">CREDITS</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
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
                      filtered.map((s) => (
                        <tr key={s._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                          <td className="px-4 py-3 text-gray-700">{s.type}</td>
                          <td className="px-4 py-3 text-gray-600">{s.code || ''}</td>
                          <td className="px-4 py-3 text-gray-600">{s.credits ?? 0}</td>
                          <td className="px-4 py-3 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(openActionId === s._id ? null : s._id)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#80229a] text-white text-xs font-medium cursor-pointer"
                            >
                              Action <ChevronDown className="w-3 h-3" />
                            </button>
                            {openActionId === s._id && (
                              <div className="absolute right-4 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg w-28 text-left py-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(s)}
                                  className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(s._id)}
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
