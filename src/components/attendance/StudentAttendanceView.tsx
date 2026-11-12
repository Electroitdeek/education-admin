'use client';

import { useState, useCallback } from 'react';
import {
  Calendar,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sun,
  Trash2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/attendance`;

interface RosterRow {
  admissionNo: string;
  studentName: string;
  rollNo?: string;
  course: string;
  semester: string;
  gender?: string;
  date: string;
  status: string; // Present, Late, Absent, Half Day, Holiday
  remark: string;
  isSaved?: boolean;
}

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
  'DOTT-1st Year',
  'DECG-1st Year',
  'DMLT-1st Year',
];

const ATTENDANCE_STATUSES = ['Present', 'Late', 'Absent', 'Half Day', 'Holiday'];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentAttendanceView({ onNavigate }: Props) {
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('17-10-2026');
  const [hasSearched, setHasSearched] = useState(false);

  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mark Holiday Range Modal
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayFrom, setHolidayFrom] = useState('2026-10-17');
  const [holidayTo, setHolidayTo] = useState('2026-10-17');
  const [holidayCourse, setHolidayCourse] = useState('');
  const [holidaySemester, setHolidaySemester] = useState('');
  const [holidayRemark, setHolidayRemark] = useState('Institutional Holiday');
  const [markingHoliday, setMarkingHoliday] = useState(false);

  // Clear Attendance Modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Convert DD-MM-YYYY <-> YYYY-MM-DD for native date input if needed
  const toInputDate = (ddmmyyyy: string): string => {
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ddmmyyyy;
  };

  const toDdMmYyyy = (yyyymmdd: string): string => {
    const parts = yyyymmdd.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return yyyymmdd;
  };

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (semester) params.append('semester', semester);
      params.append('date', attendanceDate.trim() || '17-10-2026');

      const res = await fetch(`${ENDPOINT}/roster?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch attendance roster');
      const data = await res.json();
      setRoster(data.roster || []);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to fetch attendance roster');
    } finally {
      setLoading(false);
    }
  }, [course, semester, attendanceDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRoster();
  };

  const setAllStatus = (newStatus: string) => {
    setRoster((prev) =>
      prev.map((row) => ({
        ...row,
        status: newStatus,
        remark: newStatus === 'Holiday' && !row.remark ? 'Institutional Holiday' : row.remark,
      }))
    );
  };

  const handleStatusChange = (admissionNo: string, newStatus: string) => {
    setRoster((prev) =>
      prev.map((row) => (row.admissionNo === admissionNo ? { ...row, status: newStatus } : row))
    );
  };

  const handleRemarkChange = (admissionNo: string, remark: string) => {
    setRoster((prev) =>
      prev.map((row) => (row.admissionNo === admissionNo ? { ...row, remark } : row))
    );
  };

  const handleSaveAttendance = async () => {
    if (roster.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${ENDPOINT}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: course || 'All Courses',
          semester: semester || 'All Semesters',
          date: attendanceDate.trim() || '17-10-2026',
          records: roster.map((r) => ({
            admissionNo: r.admissionNo,
            studentName: r.studentName,
            rollNo: r.rollNo,
            course: r.course,
            semester: r.semester,
            date: attendanceDate.trim() || '17-10-2026',
            status: r.status,
            remark: r.remark,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed to save attendance');
      showToast('success', `Saved attendance for ${roster.length} student(s) on ${attendanceDate}.`);
      fetchRoster();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkHolidayRange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarkingHoliday(true);
    try {
      const res = await fetch(`${ENDPOINT}/holiday-range`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: toDdMmYyyy(holidayFrom),
          toDate: toDdMmYyyy(holidayTo),
          course: holidayCourse || undefined,
          semester: holidaySemester || undefined,
          remark: holidayRemark || 'Institutional Holiday',
        }),
      });
      if (!res.ok) throw new Error('Failed to mark holiday range');
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Invalid holiday range');

      showToast(
        'success',
        `Marked ${result.days} day(s) as Holiday (${result.count} student records updated).`
      );
      setShowHolidayModal(false);
      if (hasSearched) fetchRoster();
    } catch (err: any) {
      showToast('error', err?.message || 'Error marking holiday range');
    } finally {
      setMarkingHoliday(false);
    }
  };

  const handleClearAttendance = async () => {
    setClearing(true);
    try {
      const res = await fetch(`${ENDPOINT}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate.trim() || '17-10-2026',
          course: course || undefined,
          semester: semester || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to clear attendance');
      const result = await res.json();
      showToast(
        'success',
        `Cleared ${result.deletedCount ?? 0} attendance record(s) for ${attendanceDate}.`
      );
      setShowClearModal(false);
      if (hasSearched) fetchRoster();
    } catch (err: any) {
      showToast('error', err?.message || 'Error clearing attendance');
    } finally {
      setClearing(false);
    }
  };

  const summary = {
    total: roster.length,
    present: roster.filter((r) => r.status === 'Present').length,
    late: roster.filter((r) => r.status === 'Late').length,
    absent: roster.filter((r) => r.status === 'Absent').length,
    halfDay: roster.filter((r) => r.status === 'Half Day').length,
    holiday: roster.filter((r) => r.status === 'Holiday').length,
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {/* Toast Notification */}
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
            <h1 className="text-xl font-bold text-gray-800">Student Attendance</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('attendance-report')}
              className="inline-flex items-center gap-1.5 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Attendance
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Student Attendance</span>
          </div>
        </div>

        {/* Select Criteria Card (exact match to screenshot) */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
        >
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Select Criteria</h2>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowHolidayModal(true)}
                className="px-3.5 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium shadow-xs transition cursor-pointer"
              >
                Mark Holiday Range
              </button>
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="px-3.5 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium shadow-xs transition cursor-pointer"
              >
                Clear Attendance
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Course * */}
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

              {/* Semester * */}
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

              {/* Attendance Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  Attendance Date
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                </label>
                <input
                  type="date"
                  value={toInputDate(attendanceDate)}
                  onChange={(e) => setAttendanceDate(toDdMmYyyy(e.target.value))}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
                />
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

        {/* Attendance Roster Table (shown after Search) */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-bold text-gray-800">
                  Student List ({attendanceDate})
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                    Total: {summary.total}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                    Present: {summary.present}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                    Late: {summary.late}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-medium">
                    Absent: {summary.absent}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-medium">
                    Half Day: {summary.halfDay}
                  </span>
                  {summary.holiday > 0 && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-[#80229a] font-medium">
                      Holiday: {summary.holiday}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllStatus('Present')}
                  className="px-2.5 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-medium cursor-pointer"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => setAllStatus('Absent')}
                  className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                >
                  All Absent
                </button>
                <button
                  type="button"
                  onClick={() => setAllStatus('Holiday')}
                  className="px-2.5 py-1 rounded border border-purple-300 text-[#80229a] hover:bg-purple-50 text-xs font-medium cursor-pointer"
                >
                  Mark Holiday
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={saving || roster.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Attendance
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                Loading student roster...
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
                      <th className="px-4 py-3">Course / Semester</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {roster.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No students found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      roster.map((row, idx) => (
                        <tr key={row.admissionNo} className="hover:bg-purple-50/30">
                          <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800">
                            {row.admissionNo}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{row.rollNo || '-'}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {row.course} ({row.semester})
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {ATTENDANCE_STATUSES.map((st) => (
                                <label
                                  key={st}
                                  className="inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`att-${row.admissionNo}`}
                                    checked={row.status === st}
                                    onChange={() => handleStatusChange(row.admissionNo, st)}
                                    className="accent-[#80229a]"
                                  />
                                  <span
                                    className={
                                      row.status === st
                                        ? 'font-semibold text-[#80229a]'
                                        : 'text-gray-600'
                                    }
                                  >
                                    {st}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={row.remark}
                              onChange={(e) => handleRemarkChange(row.admissionNo, e.target.value)}
                              placeholder="Add note..."
                              className="w-40 h-8 px-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mark Holiday Range Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleMarkHolidayRange}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Sun className="w-4 h-4" /> Mark Holiday Range
              </div>
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayFrom}
                    onChange={(e) => setHolidayFrom(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayTo}
                    onChange={(e) => setHolidayTo(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Course (Optional)</label>
                  <select
                    value={holidayCourse}
                    onChange={(e) => setHolidayCourse(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  >
                    <option value="">All Courses</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Semester (Optional)
                  </label>
                  <select
                    value={holidaySemester}
                    onChange={(e) => setHolidaySemester(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Holiday Reason / Note</label>
                <input
                  type="text"
                  value={holidayRemark}
                  onChange={(e) => setHolidayRemark(e.target.value)}
                  placeholder="e.g. Diwali Break / Institutional Holiday"
                  className="w-full h-9 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={markingHoliday}
                className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {markingHoliday ? 'Saving...' : 'Save Holiday Range'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clear Attendance Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Trash2 className="w-4 h-4" /> Clear Attendance
              </div>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs text-gray-700 space-y-2">
              <p>
                Are you sure you want to clear saved attendance records for{' '}
                <span className="font-semibold text-gray-900">{attendanceDate}</span>?
              </p>
              <p className="text-gray-500">
                Scope: {course || 'All Courses'} / {semester || 'All Semesters'}
              </p>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAttendance}
                disabled={clearing}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {clearing ? 'Clearing...' : 'Confirm Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}
