'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  GraduationCap,
  Search,
  Plus,
  Trash2,
  Printer,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

interface TimetableSlot {
  _id: string;
  course: string;
  semester: string;
  day: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  roomNo: string;
  classType: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  type: string;
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
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FACULTY_LIST = [
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

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ClassTimetableView({ onNavigate }: Props) {
  const [courseFilter, setCourseFilter] = useState('B.Sc. Nursing');
  const [semesterFilter, setSemesterFilter] = useState('Semester 1');
  const [hasSearched, setHasSearched] = useState(true);
  const [activeDay, setActiveDay] = useState<string>('All');

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Slot Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    day: 'Monday',
    subject: '',
    teacher: FACULTY_LIST[0],
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    roomNo: 'Lecture Hall 101',
    classType: 'Theory',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch(`${API}/academics/subjects`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSubjects(Array.isArray(d) ? d : d.items || []))
      .catch(() => {});
  }, []);

  const fetchTimetable = useCallback(async (courseOverride?: string, semesterOverride?: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const c = courseOverride !== undefined ? courseOverride : courseFilter;
      const s = semesterOverride !== undefined ? semesterOverride : semesterFilter;
      const params = new URLSearchParams();
      if (c && c !== 'Select Course') params.set('course', c);
      if (s && s !== 'Select Semester') params.set('semester', s);

      const res = await fetch(`${API}/academics/timetable?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch timetable');
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      showToast('error', err?.message || 'Error loading timetable');
    } finally {
      setLoading(false);
    }
  }, [courseFilter, semesterFilter]);

  // Initial load: Fetch B.Sc. Nursing Semester 1 by default
  useEffect(() => {
    fetchTimetable('B.Sc. Nursing', 'Semester 1');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTimetable();
  };

  const handleReset = () => {
    setCourseFilter('');
    setSemesterFilter('');
    fetchTimetable('', '');
  };

  const handleOpenAddModal = () => {
    setFormData((prev) => ({
      ...prev,
      course: courseFilter || prev.course,
      semester: semesterFilter || prev.semester,
      day: activeDay !== 'All' ? activeDay : 'Monday',
      subject: subjects[0]?.name || prev.subject || 'Anatomy & Physiology',
    }));
    setIsModalOpen(true);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      showToast('error', 'Subject is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/academics/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to add timetable slot');
      showToast('success', 'Timetable slot added successfully.');
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving timetable slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const res = await fetch(`${API}/academics/timetable/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete slot');
      showToast('success', 'Timetable slot removed.');
      fetchTimetable();
    } catch (err: any) {
      showToast('error', err?.message || 'Error removing slot');
    }
  };

  const displayedSlots =
    activeDay === 'All' ? slots : slots.filter((s) => s.day.toLowerCase() === activeDay.toLowerCase());

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
            <h1 className="text-xl font-bold text-gray-800">Class Timetable</h1>
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
            <span className="text-gray-600">Timetable</span>
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
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
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
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
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

            <div className="flex justify-end items-center gap-2">
              {(courseFilter || semesterFilter) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium transition cursor-pointer"
                >
                  Show All
                </button>
              )}
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

        {/* Timetable Schedule Card (shown after Search) */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Class Timetable — {courseFilter || 'All Courses'} {semesterFilter ? `(${semesterFilter})` : ''}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {slots.length} scheduled lecture/clinical slot{slots.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </button>
              </div>
            </div>

            {/* Day Tabs */}
            <div className="px-6 pt-3 border-b border-gray-100 flex flex-wrap gap-2">
              {['All', ...DAYS].map((day) => {
                const count =
                  day === 'All'
                    ? slots.length
                    : slots.filter((s) => s.day.toLowerCase() === day.toLowerCase()).length;
                const active = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`px-3.5 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
                      active
                        ? 'border-[#80229a] text-[#80229a]'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {day} ({count})
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                Loading timetable...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Faculty / Teacher</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Room / Lab</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedSlots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                          No timetable slots found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedSlots.map((slot) => (
                        <tr key={slot._id} className="hover:bg-purple-50/30">
                          <td className="px-4 py-3 font-medium text-gray-800">{slot.day}</td>
                          <td className="px-4 py-3 font-semibold text-[#80229a]">{slot.subject}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {slot.teacher}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {slot.roomNo}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-[#80229a]">
                              {slot.classType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(slot._id)}
                              title="Delete Slot"
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
            )}
          </div>
        )}
      </div>

      {/* Add Timetable Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSlot}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <span className="font-semibold text-sm">Add Timetable Slot</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
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
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Day *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Class Type *</label>
                  <select
                    value={formData.classType}
                    onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Clinical">Clinical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    list="subject-options"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter or choose subject"
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                  <datalist id="subject-options">
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Teacher *</label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {FACULTY_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Room / Lab *</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}
