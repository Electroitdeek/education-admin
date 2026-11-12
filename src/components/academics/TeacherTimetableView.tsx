'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  GraduationCap,
  Search,
  Printer,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEFAULT_STAFF = [
  'Dr. Pooja Sharma',
  'Prof. Rajesh Deshmukh',
  'Prof. Ananya Sen',
  'Dr. K. N. Joshi',
  'Dr. S. K. Roy',
  'Prof. S. R. Dixit',
  'Sister Mary Joseph',
  'Sister Rekha Patel',
  'Sister Kavita Rao',
  'Lab Tech. Amit Verma',
  'Rad Tech. Manoj Kumar',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function TeacherTimetableView({ onNavigate }: Props) {
  const [staffList, setStaffList] = useState<string[]>(DEFAULT_STAFF);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [dateStr, setDateStr] = useState('17-10-2026');
  const [showAllDays, setShowAllDays] = useState(true);

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch(`${API}/academics/timetable`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const fromDb = data.map((d) => d.teacher).filter(Boolean);
          setStaffList(Array.from(new Set([...DEFAULT_STAFF, ...fromDb])));
        }
      })
      .catch(() => {});
  }, []);

  const getWeekdayFromDdMmYyyy = (ddmmyyyy: string): string => {
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3) {
      const d =
        parts[0].length === 4
          ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
          : new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return WEEKDAYS[d.getDay()];
    }
    return 'Monday';
  };

  const fetchTeacherTimetable = useCallback(async () => {
    if (!selectedStaff) {
      showToast('error', 'Please select a Staff member.');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ teacher: selectedStaff });
      if (!showAllDays) {
        params.set('day', getWeekdayFromDdMmYyyy(dateStr));
      }
      const res = await fetch(`${API}/academics/timetable?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teacher timetable');
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast('error', err?.message || 'Error fetching timetable');
    } finally {
      setLoading(false);
    }
  }, [selectedStaff, dateStr, showAllDays]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeacherTimetable();
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
            <h1 className="text-xl font-bold text-gray-800">Teacher Timetable</h1>
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
            <span className="text-gray-600">Teacher Timetable</span>
          </div>
        </div>

        {/* Select Criteria Card */}
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
                  Staff <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
                >
                  <option value="">Select</option>
                  {staffList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="17-10-2026"
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllDays}
                  onChange={(e) => setShowAllDays(e.target.checked)}
                  className="accent-[#80229a]"
                />
                Show Full Weekly Schedule (instead of only {getWeekdayFromDdMmYyyy(dateStr)})
              </label>

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

        {/* Timetable Results */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-800">
                Schedule for {selectedStaff}{' '}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({slots.length} slot{slots.length === 1 ? '' : 's'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                Loading teacher schedule...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Room / Lab</th>
                      <th className="px-4 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {slots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No classes assigned to {selectedStaff}.
                        </td>
                      </tr>
                    ) : (
                      slots.map((s) => (
                        <tr key={s._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{s.day}</td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {s.startTime} - {s.endTime}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{s.course}</td>
                          <td className="px-4 py-3 text-gray-600">{s.semester}</td>
                          <td className="px-4 py-3 font-semibold text-[#80229a]">{s.subject}</td>
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

