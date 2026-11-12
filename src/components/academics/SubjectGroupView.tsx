'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  GraduationCap,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

interface Props {
  onNavigate?: (view: string) => void;
}

export default function SubjectGroupView({ onNavigate }: Props) {
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [modalCourse, setModalCourse] = useState('B.Sc. Nursing');
  const [modalSemester, setModalSemester] = useState('Semester 1');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        fetch(`${API}/academics/subject-groups`),
        fetch(`${API}/academics/subjects`),
      ]);
      if (gRes.ok) setGroups(await gRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
    } catch {
      showToast('error', 'Failed to load assigned subjects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    fetchAll();
  };

  const filteredGroups = groups.filter((g) => {
    const matchCourse = !courseFilter || g.course?.toLowerCase() === courseFilter.toLowerCase();
    const matchSem = !semesterFilter || g.semester?.toLowerCase() === semesterFilter.toLowerCase();
    return matchCourse && matchSem;
  });

  const toggleSubject = (subName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
    );
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedSubjects.length === 0) {
      showToast('error', 'Group Name and at least one Subject are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/academics/subject-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          course: modalCourse,
          semester: modalSemester,
          subjects: selectedSubjects,
          description,
        }),
      });
      if (!res.ok) throw new Error('Failed to assign subjects');
      showToast('success', 'Subjects assigned to Course & Semester.');
      setIsAddOpen(false);
      setGroupName('');
      setSelectedSubjects([]);
      setDescription('');
      setHasSearched(true);
      fetchAll();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving subject group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      const res = await fetch(`${API}/academics/subject-groups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Removed assigned subject group.');
      fetchAll();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting');
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Assign Subjects</h1>
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
            <span className="text-gray-600">Assign Subjects</span>
          </div>
        </div>

        {/* Select Criteria Card (exact match to screenshot) */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Select Criteria</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalCourse(courseFilter || COURSES[0]);
                setModalSemester(semesterFilter || SEMESTERS[0]);
                setIsAddOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Assigned Subjects List */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 text-sm font-bold text-gray-800">
              Assigned Subject List ({filteredGroups.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Group Name</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                        No assigned subjects found for this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((g) => (
                      <tr key={g._id} className="hover:bg-purple-50/30">
                        <td className="px-4 py-3 font-medium text-gray-800">{g.name}</td>
                        <td className="px-4 py-3 text-gray-700">{g.course}</td>
                        <td className="px-4 py-3 text-gray-600">{g.semester}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {(g.subjects || []).map((s: string) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded bg-purple-100 text-[#80229a] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(g._id)}
                            className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Assign Subjects Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGroup}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <span className="font-semibold text-sm">Assign Subjects to Course</span>
              <button type="button" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. B.Sc. Nursing Sem 1 Core"
                  className="w-full h-9 px-2.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={modalCourse}
                    onChange={(e) => setModalCourse(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    value={modalSemester}
                    onChange={(e) => setModalSemester(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Select Subjects * ({selectedSubjects.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                  {subjects.map((sub) => (
                    <label
                      key={sub._id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-purple-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(sub.name)}
                        onChange={() => toggleSubject(sub.name)}
                        className="accent-[#80229a]"
                      />
                      <span>
                        {sub.name} ({sub.type})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}
