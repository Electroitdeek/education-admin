'use client';

import { useState, useCallback } from 'react';
import {
  Calendar,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
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

interface StudentRow {
  admissionNo: string;
  firstName: string;
  lastName?: string;
  rollNo?: string;
  course: string;
  semester?: string;
  subjects?: string[];
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentSubjectsView({ onNavigate }: Props) {
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [groupSubjects, setGroupSubjects] = useState<string[]>([]);
  const [studentSubjectsMap, setStudentSubjectsMap] = useState<Record<string, string[]>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!course || !semester) {
        showToast('error', 'Please select both Course and Semester.');
        return;
      }
      setLoading(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({ course, semester });
        const [stRes, subRes, grpRes] = await Promise.all([
          fetch(`${API}/student-info/students?${params.toString()}`),
          fetch(`${API}/academics/subjects`),
          fetch(`${API}/academics/subject-groups`),
        ]);

        const stData = stRes.ok ? await stRes.json() : [];
        const stList: StudentRow[] = Array.isArray(stData) ? stData : stData.items || [];

        const subData = subRes.ok ? await subRes.json() : [];
        const subNames: string[] = (Array.isArray(subData) ? subData : [])
          .map((s: any) => s.name)
          .filter(Boolean);

        const grpData = grpRes.ok ? await grpRes.json() : [];
        const matchingGroups = (Array.isArray(grpData) ? grpData : []).filter(
          (g: any) =>
            g.course?.toLowerCase() === course.toLowerCase() &&
            g.semester?.toLowerCase() === semester.toLowerCase()
        );
        const defaultGroupSubs: string[] = Array.from(
          new Set(matchingGroups.flatMap((g: any) => g.subjects || []))
        );

        const map: Record<string, string[]> = {};
        stList.forEach((st) => {
          map[st.admissionNo] =
            Array.isArray(st.subjects) && st.subjects.length > 0 ? st.subjects : defaultGroupSubs;
        });

        setStudents(stList);
        setAvailableSubjects(Array.from(new Set([...subNames, ...defaultGroupSubs])));
        setGroupSubjects(defaultGroupSubs);
        setStudentSubjectsMap(map);
      } catch {
        showToast('error', 'Failed to load student subjects.');
      } finally {
        setLoading(false);
      }
    },
    [course, semester]
  );

  const toggleStudentSubject = (admissionNo: string, subjectName: string) => {
    setStudentSubjectsMap((prev) => {
      const current = prev[admissionNo] || [];
      const next = current.includes(subjectName)
        ? current.filter((s) => s !== subjectName)
        : [...current, subjectName];
      return { ...prev, [admissionNo]: next };
    });
  };

  const applyCourseGroupToAll = () => {
    if (groupSubjects.length === 0) {
      showToast('error', 'No Subject Group configured for this Course & Semester.');
      return;
    }
    const next: Record<string, string[]> = {};
    students.forEach((s) => {
      next[s.admissionNo] = [...groupSubjects];
    });
    setStudentSubjectsMap(next);
    showToast('success', 'Applied Course Subject Group to all listed students.');
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        students: students.map((s) => ({
          admissionNo: s.admissionNo,
          subjects: studentSubjectsMap[s.admissionNo] || [],
        })),
      };
      const res = await fetch(`${API}/student-info/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save student subjects');
      showToast('success', `Saved subjects for ${students.length} student(s).`);
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving student subjects');
    } finally {
      setSaving(false);
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
        {/* Top Header & Breadcrumb (exact match to screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Student Subjects</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('class-timetable')}
              className="inline-flex items-center gap-1.5 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Academics
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Student Subjects</span>
          </div>
        </div>

        {/* Select Criteria Card (exact match to screenshot) */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-800">Select Criteria</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
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
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
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

        {/* Student Subjects Assignment Table */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#80229a]" />
                <h2 className="text-sm font-bold text-gray-800">
                  Student Subject Mapping ({students.length} student{students.length === 1 ? '' : 's'})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={applyCourseGroupToAll}
                  className="px-3 py-1.5 rounded border border-[#80229a] text-[#80229a] hover:bg-purple-50 text-xs font-medium cursor-pointer"
                >
                  Apply Course Subject Group
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || students.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Student Subjects
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                Loading students and subjects...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Admission No</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Assigned Subjects</th>
                      <th className="px-4 py-3 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                          No students found for {course} - {semester}.
                        </td>
                      </tr>
                    ) : (
                      students.map((st, idx) => {
                        const assigned = studentSubjectsMap[st.admissionNo] || [];
                        return (
                          <tr key={st.admissionNo} className="hover:bg-purple-50/20">
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{st.admissionNo}</td>
                            <td className="px-4 py-3 text-gray-600">{st.rollNo || '-'}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {st.firstName} {st.lastName || ''}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {availableSubjects.map((subName) => {
                                  const checked = assigned.includes(subName);
                                  return (
                                    <button
                                      key={subName}
                                      type="button"
                                      onClick={() => toggleStudentSubject(st.admissionNo, subName)}
                                      className={`px-2 py-1 rounded border text-[11px] font-medium transition cursor-pointer ${
                                        checked
                                          ? 'bg-[#80229a] text-white border-[#80229a]'
                                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#80229a]'
                                      }`}
                                    >
                                      {subName}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[#80229a]">
                              {assigned.length}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

