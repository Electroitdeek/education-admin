'use client';

import { useState, useCallback } from 'react';
import {
  GraduationCap,
  Search,
  ArrowUpRight,
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

const SESSIONS = ['2025-26', '2026-27', '2027-28'];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function PromoteStudentsView({ onNavigate }: Props) {
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [students, setStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const [nextSession, setNextSession] = useState('2026-27');
  const [nextCourse, setNextCourse] = useState('');
  const [nextSemester, setNextSemester] = useState('Semester 2');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStudents = useCallback(async () => {
    if (!course || !semester) {
      showToast('error', 'Please select both Course and Semester.');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ course, semester });
      const res = await fetch(`${API}/student-info/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      setStudents(items);
      setSelectedIds(items.map((s: any) => s.admissionNo));
      setNextCourse(course);
    } catch (err: any) {
      showToast('error', err?.message || 'Error loading students');
    } finally {
      setLoading(false);
    }
  }, [course, semester]);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.admissionNo));
    }
  };

  const toggleStudent = (admNo: string) => {
    setSelectedIds((prev) =>
      prev.includes(admNo) ? prev.filter((id) => id !== admNo) : [...prev, admNo]
    );
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      showToast('error', 'Please select at least one student to promote.');
      return;
    }
    if (!nextCourse || !nextSemester) {
      showToast('error', 'Please select target Course and Semester.');
      return;
    }
    setPromoting(true);
    try {
      const res = await fetch(`${API}/academics/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCourse: course,
          currentSemester: semester,
          nextSession,
          nextCourse,
          nextSemester,
          studentIds: selectedIds,
        }),
      });
      if (!res.ok) throw new Error('Promotion failed');
      const result = await res.json();
      showToast(
        'success',
        result.message || `Promoted ${result.promotedCount ?? selectedIds.length} student(s).`
      );
      fetchStudents();
    } catch (err: any) {
      showToast('error', err?.message || 'Error promoting students');
    } finally {
      setPromoting(false);
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
            <GraduationCap className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Promote Students</h1>
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
            <span className="text-gray-600">Promote Students</span>
          </div>
        </div>

        {/* Select Criteria Card */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStudents();
          }}
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
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
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

        {/* Student Promotion List */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-bold text-gray-800">
                Promote Students ({selectedIds.length} of {students.length} selected)
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <select
                  value={nextSession}
                  onChange={(e) => setNextSession(e.target.value)}
                  className="h-9 px-2.5 border border-gray-300 rounded bg-white"
                >
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>
                      Session: {s}
                    </option>
                  ))}
                </select>
                <select
                  value={nextCourse}
                  onChange={(e) => setNextCourse(e.target.value)}
                  className="h-9 px-2.5 border border-gray-300 rounded bg-white"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={nextSemester}
                  onChange={(e) => setNextSemester(e.target.value)}
                  className="h-9 px-2.5 border border-gray-300 rounded bg-white"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePromote}
                  disabled={promoting || selectedIds.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white font-semibold disabled:opacity-60 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {promoting ? 'Promoting...' : 'Promote Selected'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={students.length > 0 && selectedIds.length === students.length}
                        onChange={toggleSelectAll}
                        className="accent-[#80229a]"
                      />
                    </th>
                    <th className="px-4 py-3">Admission No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Current Course</th>
                    <th className="px-4 py-3">Current Semester</th>
                    <th className="px-4 py-3">Status</th>
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
                    students.map((s) => (
                      <tr key={s.admissionNo} className="hover:bg-purple-50/30">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.admissionNo)}
                            onChange={() => toggleStudent(s.admissionNo)}
                            className="accent-[#80229a]"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{s.admissionNo}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {s.firstName} {s.lastName || ''}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.course}</td>
                        <td className="px-4 py-3 text-gray-600">{s.semester}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
                            {s.status || 'Active'}
                          </span>
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

      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}
