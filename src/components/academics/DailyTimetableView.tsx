'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  GraduationCap,
  Search,
  Download,
  Printer,
  Clock,
  MapPin,
  User,
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

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toYYYYMMDD(val: string): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parts = val.split('-');
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return val;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function DailyTimetableView({ onNavigate }: Props) {
  const [course, setCourse] = useState('B.Sc. Nursing');
  const [semester, setSemester] = useState('Semester 1');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [modeLabel, setModeLabel] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const getWeekday = (dateInput: string): string => {
    if (!dateInput) return 'Monday';
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const d =
        parts[0].length === 4
          ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
          : new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return WEEKDAYS[d.getDay()];
    }
    return 'Monday';
  };

  const fetchDaily = useCallback(
    async (allCoursesMode: boolean, cOverride?: string, sOverride?: string) => {
      const c = cOverride !== undefined ? cOverride : course;
      const s = sOverride !== undefined ? sOverride : semester;
      setLoading(true);
      setHasSearched(true);
      const dayName = getWeekday(dateStr);
      setModeLabel(
        allCoursesMode
          ? `All Courses — ${dateStr} (${dayName})`
          : `${c || 'All Courses'} ${s ? `(${s})` : ''} — ${dateStr} (${dayName})`
      );

      try {
        const params = new URLSearchParams();
        if (!allCoursesMode) {
          if (c && c !== 'Select Course') params.set('course', c);
          if (s && s !== 'Select Semester') params.set('semester', s);
        }
        // Filter by weekday when available; if Sunday, fallback to all
        if (dayName !== 'Sunday') {
          params.set('day', dayName);
        }

        const res = await fetch(`${API}/academics/timetable?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch daily timetable');
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : []);
      } catch (err: any) {
        showToast('error', err?.message || 'Error loading daily timetable');
      } finally {
        setLoading(false);
      }
    },
    [course, semester, dateStr]
  );

  // Initial load
  useEffect(() => {
    fetchDaily(false, 'B.Sc. Nursing', 'Semester 1');
  }, []);

  const handleExportCsv = () => {
    if (!slots.length) {
      showToast('error', 'No timetable slots to export.');
      return;
    }
    const headers = ['Course', 'Semester', 'Day', 'Time', 'Subject', 'Teacher', 'Room', 'Type'];
    const rows = slots.map((s) => [
      s.course,
      s.semester,
      s.day,
      `${s.startTime} - ${s.endTime}`,
      s.subject,
      s.teacher,
      s.roomNo,
      s.classType,
    ]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_timetable_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Daily timetable CSV downloaded.');
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
            <Calendar className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Daily Time Table</h1>
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
            <span className="text-gray-600">Daily Time Table</span>
          </div>
        </div>

        {/* Select Criteria Card (exact match to screenshot) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDaily(false);
          }}
          className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Select Criteria</h2>
            </div>

            <button
              type="button"
              onClick={() => fetchDaily(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              All Course Timetable
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={toYYYYMMDD(dateStr)}
                  onChange={(e) => setDateStr(e.target.value)}
                  onClick={(e) => (e.currentTarget as any).showPicker?.()}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700 cursor-pointer shadow-xs"
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

        {/* Daily Timetable Table */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold text-gray-800">
                {modeLabel}{' '}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({slots.length} slot{slots.length === 1 ? '' : 's'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                Loading daily timetable...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Room / Lab</th>
                      <th className="px-4 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {slots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No classes scheduled for {getWeekday(dateStr)}.
                        </td>
                      </tr>
                    ) : (
                      slots.map((s) => (
                        <tr key={s._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{s.course}</td>
                          <td className="px-4 py-3 text-gray-600">{s.semester}</td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {s.startTime} - {s.endTime}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#80229a]">{s.subject}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {s.teacher}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {s.roomNo}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-[#80229a]">
                              {s.classType}
                            </span>
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

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

