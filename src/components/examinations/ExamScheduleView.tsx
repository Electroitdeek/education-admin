'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ExamSchedule {
  _id: string;
  examName: string;
  course: string;
  semester: string;
  subject: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  roomNo: string;
  maxMarks: number;
  minMarks: number;
}

interface Exam {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  code?: string;
}

interface BulkRow {
  subject: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  roomNo: string;
  maxMarks: number;
  minMarks: number;
}

const DEFAULT_COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
];

const DEFAULT_SEMESTERS = [
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

export default function ExamScheduleView({ onNavigate }: Props) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Criteria filters
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Single Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    examName: '',
    course: '',
    semester: '',
    subject: '',
    date: '20-11-2026',
    timeFrom: '10:00 AM',
    timeTo: '01:00 PM',
    roomNo: 'Exam Hall 101',
    maxMarks: 100,
    minMarks: 50,
  });

  // Bulk Add Modal
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkExamName, setBulkExamName] = useState('');
  const [bulkCourse, setBulkCourse] = useState('');
  const [bulkSemester, setBulkSemester] = useState('');
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    {
      subject: '',
      date: '20-11-2026',
      timeFrom: '10:00 AM',
      timeTo: '01:00 PM',
      roomNo: 'Exam Hall 101',
      maxMarks: 100,
      minMarks: 50,
    },
  ]);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [examsRes, subjRes, courseRes, semRes] = await Promise.all([
          fetch(`${API}/examinations/exams`),
          fetch(`${API}/academics/subjects`),
          fetch(`${API}/academics/courses`),
          fetch(`${API}/academics/semesters`),
        ]);
        if (examsRes.ok) {
          const ex = await examsRes.json();
          setExams(Array.isArray(ex) ? ex : []);
        }
        if (subjRes.ok) {
          const sb = await subjRes.json();
          setSubjects(Array.isArray(sb) ? sb : []);
        }
        if (courseRes.ok) {
          const cs = await courseRes.json();
          if (Array.isArray(cs) && cs.length > 0) {
            setCourses(cs.map((c: { name?: string }) => c.name || '').filter(Boolean));
          }
        }
        if (semRes.ok) {
          const sm = await semRes.json();
          if (Array.isArray(sm) && sm.length > 0) {
            setSemesters(sm.map((s: { name?: string }) => s.name || '').filter(Boolean));
          }
        }
      } catch {
        // Fallback to default lists
      }
    };
    loadMeta();
  }, []);

  const fetchSchedules = async () => {
    if (!courseFilter || !semesterFilter) {
      showToast('error', 'Please select Course and Semester');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        course: courseFilter,
        semester: semesterFilter,
      });
      const res = await fetch(`${API}/examinations/schedules?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch {
      showToast('error', 'Failed to load exam schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData((prev) => ({
      ...prev,
      examName: exams[0]?.name || prev.examName,
      course: courseFilter || courses[0] || '',
      semester: semesterFilter || semesters[0] || '',
    }));
    setIsAddOpen(true);
  };

  const handleOpenBulk = () => {
    setBulkExamName(exams[0]?.name || '');
    setBulkCourse(courseFilter || courses[0] || '');
    setBulkSemester(semesterFilter || semesters[0] || '');
    setIsBulkOpen(true);
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.examName || !formData.course || !formData.semester || !formData.subject) {
      showToast('error', 'Please complete all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showToast('success', 'Exam schedule added');
        setIsAddOpen(false);
        setCourseFilter(formData.course);
        setSemesterFilter(formData.semester);
        setSearched(true);
        const params = new URLSearchParams({ course: formData.course, semester: formData.semester });
        const listRes = await fetch(`${API}/examinations/schedules?${params.toString()}`);
        if (listRes.ok) setSchedules(await listRes.json());
      } else {
        showToast('error', 'Failed to save schedule');
      }
    } catch {
      showToast('error', 'Network error while saving schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter((r) => r.subject.trim() && r.date.trim());
    if (!bulkExamName || !bulkCourse || !bulkSemester || validRows.length === 0) {
      showToast('error', 'Please fill exam, course, semester, and at least one subject row');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/schedules/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: bulkExamName,
          course: bulkCourse,
          semester: bulkSemester,
          schedules: validRows,
        }),
      });
      if (res.ok) {
        showToast('success', `${validRows.length} schedule(s) added`);
        setIsBulkOpen(false);
        setCourseFilter(bulkCourse);
        setSemesterFilter(bulkSemester);
        setSearched(true);
        const params = new URLSearchParams({ course: bulkCourse, semester: bulkSemester });
        const listRes = await fetch(`${API}/examinations/schedules?${params.toString()}`);
        if (listRes.ok) setSchedules(await listRes.json());
      } else {
        showToast('error', 'Failed to bulk save schedules');
      }
    } catch {
      showToast('error', 'Network error while bulk saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/examinations/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Schedule deleted');
        setSchedules((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      showToast('error', 'Failed to delete schedule');
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.subject?.toLowerCase().includes(q) ||
      s.examName?.toLowerCase().includes(q) ||
      s.roomNo?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header + Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Exam Schedule</span>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Select Criteria</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBulk}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Bulk Add
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={fetchSchedules}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <Search className="w-3.5 h-3.5" /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {searched && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Exam Schedule ({courseFilter} - {semesterFilter})
            </h3>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-lg overflow-hidden bg-[#80229a] text-white text-xs font-medium shadow-sm">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(filteredSchedules))}
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-2 hover:bg-[#6b1b82] transition cursor-pointer border-l border-white/15"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-2 border-l border-white/15 flex items-center gap-1 select-none">
                  Column visibility <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Search:</span>
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    <th className="px-4 py-3">EXAM</th>
                    <th className="px-4 py-3">SUBJECT</th>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">TIME</th>
                    <th className="px-4 py-3">ROOM NO</th>
                    <th className="px-4 py-3">MAX / MIN MARKS</th>
                    <th className="px-4 py-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No exam schedule found for selected criteria
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-medium">{row.examName}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{row.subject}</td>
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3">
                          {row.timeFrom} - {row.timeTo}
                        </td>
                        <td className="px-4 py-3">{row.roomNo}</td>
                        <td className="px-4 py-3">
                          {row.maxMarks} / {row.minMarks}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(row._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Single Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSingle}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#80229a] text-white">
              <h3 className="text-sm font-semibold">Add Exam Schedule</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Exam *</label>
                <select
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                >
                  <option value="">Select Exam</option>
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex.name}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  list="exam-subject-options"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Select or enter subject"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
                <datalist id="exam-subject-options">
                  {subjects.map((sb) => (
                    <option key={sb._id} value={sb.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room No *</label>
                <input
                  type="text"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time From *</label>
                <input
                  type="text"
                  value={formData.timeFrom}
                  onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time To *</label>
                <input
                  type="text"
                  value={formData.timeTo}
                  onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks *</label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Marks *</label>
                <input
                  type="number"
                  value={formData.minMarks}
                  onChange={(e) => setFormData({ ...formData, minMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Add Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleBulkSave}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#80229a] text-white">
              <h3 className="text-sm font-semibold">Bulk Add Exam Schedule</h3>
              <button type="button" onClick={() => setIsBulkOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam *</label>
                  <select
                    value={bulkExamName}
                    onChange={(e) => setBulkExamName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex.name}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                  <select
                    value={bulkCourse}
                    onChange={(e) => setBulkCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                  <select
                    value={bulkSemester}
                    onChange={(e) => setBulkSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                      <th className="px-3 py-2">Subject *</th>
                      <th className="px-3 py-2">Date *</th>
                      <th className="px-3 py-2">From</th>
                      <th className="px-3 py-2">To</th>
                      <th className="px-3 py-2">Room</th>
                      <th className="px-3 py-2">Max</th>
                      <th className="px-3 py-2">Min</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <input
                            list="exam-subject-options"
                            value={row.subject}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].subject = e.target.value;
                              setBulkRows(next);
                            }}
                            placeholder="Subject"
                            className="w-40 px-2 py-1.5 border border-slate-200 rounded"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={row.date}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].date = e.target.value;
                              setBulkRows(next);
                            }}
                            className="w-28 px-2 py-1.5 border border-slate-200 rounded"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={row.timeFrom}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].timeFrom = e.target.value;
                              setBulkRows(next);
                            }}
                            className="w-24 px-2 py-1.5 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={row.timeTo}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].timeTo = e.target.value;
                              setBulkRows(next);
                            }}
                            className="w-24 px-2 py-1.5 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={row.roomNo}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].roomNo = e.target.value;
                              setBulkRows(next);
                            }}
                            className="w-28 px-2 py-1.5 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.maxMarks}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].maxMarks = Number(e.target.value);
                              setBulkRows(next);
                            }}
                            className="w-16 px-2 py-1.5 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.minMarks}
                            onChange={(e) => {
                              const next = [...bulkRows];
                              next[idx].minMarks = Number(e.target.value);
                              setBulkRows(next);
                            }}
                            className="w-16 px-2 py-1.5 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          {bulkRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))}
                              className="text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBulkRows([
                    ...bulkRows,
                    {
                      subject: '',
                      date: '21-11-2026',
                      timeFrom: '10:00 AM',
                      timeTo: '01:00 PM',
                      roomNo: 'Exam Hall 101',
                      maxMarks: 100,
                      minMarks: 50,
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#80229a] font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save All'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
