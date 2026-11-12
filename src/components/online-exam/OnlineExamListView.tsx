'use client';

import { useState, useEffect } from 'react';
import {
  Laptop,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface OnlineExam {
  _id: string;
  title: string;
  course: string;
  semester: string;
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  durationMinutes: number;
  attemptCount: number;
  passingPercentage: number;
  totalQuestions: number;
  isPublished: boolean;
  isResultPublished: boolean;
  description?: string;
  createdAt?: string;
}

const COURSES = [
  'All Courses',
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
];

const SEMESTERS = [
  'All Semesters',
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

export default function OnlineExamListView({ onNavigate }: Props) {
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    dateFrom: '20-11-2026',
    dateTo: '25-11-2026',
    timeFrom: '10:00 AM',
    durationMinutes: 60,
    attemptCount: 1,
    passingPercentage: 50,
    totalQuestions: 30,
    isPublished: true,
    isResultPublished: false,
    description: '',
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/online-exam`);
      if (res.ok) {
        setExams(await res.json());
      }
    } catch (err) {
      console.error('Failed to load online exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/online-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const created = await res.json();
        setExams((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({
          title: '',
          course: 'B.Sc. Nursing',
          semester: 'Semester 1',
          dateFrom: '20-11-2026',
          dateTo: '25-11-2026',
          timeFrom: '10:00 AM',
          durationMinutes: 60,
          attemptCount: 1,
          passingPercentage: 50,
          totalQuestions: 30,
          isPublished: true,
          isResultPublished: false,
          description: '',
        });
        setNotification({ type: 'success', message: 'Online Exam created successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to create online exam.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch(`${API}/online-exam/${id}/publish`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setExams((prev) => prev.map((e) => (e._id === id ? updated : e)));
        setNotification({
          type: 'success',
          message: `Exam ${updated.isPublished ? 'published' : 'unpublished'}!`,
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to toggle publish.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleTogglePublishResult = async (id: string) => {
    try {
      const res = await fetch(`${API}/online-exam/${id}/publish-result`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setExams((prev) => prev.map((e) => (e._id === id ? updated : e)));
        setNotification({
          type: 'success',
          message: `Result ${updated.isResultPublished ? 'published' : 'unpublished'}!`,
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to toggle result publish.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete online exam "${title}"?`)) return;

    try {
      const res = await fetch(`${API}/online-exam/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e._id !== id));
        setNotification({ type: 'success', message: 'Exam deleted.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete exam.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredExams = exams.filter((e) => {
    if (courseFilter !== 'All Courses' && e.course !== courseFilter) return false;
    if (semesterFilter !== 'All Semesters' && e.semester !== semesterFilter) return false;
    if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Laptop className="w-7 h-7 text-[#80229a]" />
            Online Exam
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Online Examination / Computer Based Testing • Schedule & Manage Multiple-Choice Digital Assessments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Online Exam
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
          >
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search online exams..."
            className="w-full text-xs border border-slate-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
          />
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Online Examination Register</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredExams.length} of {exams.length} exams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4">Exam Title</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Exam Window</th>
                <th className="py-3 px-4">Duration & Questions</th>
                <th className="py-3 px-4 text-center">Passing %</th>
                <th className="py-3 px-4 text-center">Publish Status</th>
                <th className="py-3 px-4 text-center">Result Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading exams...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No online exams found. Click "Add Online Exam" above to schedule one.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exam.title}</div>
                      {exam.description && (
                        <div className="text-xs text-slate-400 truncate max-w-xs">{exam.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{exam.course}</div>
                      <div className="text-slate-500">{exam.semester}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">
                        {exam.dateFrom} - {exam.dateTo}
                      </div>
                      <div className="text-slate-400 font-mono">{exam.timeFrom}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-[#80229a]" />
                        {exam.durationMinutes} Mins
                      </div>
                      <div className="text-slate-500 font-medium">
                        {exam.totalQuestions} Questions • {exam.attemptCount} Attempt
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-emerald-700">
                      {exam.passingPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(exam._id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          exam.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {exam.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {exam.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublishResult(exam._id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          exam.isResultPublished
                            ? 'bg-purple-100 text-[#80229a] hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {exam.isResultPublished ? 'Result Out' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(exam._id, exam.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Exam"
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

      {/* Modal: Add Online Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#80229a] to-[#a832c0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5" />
                <h3 className="font-bold text-lg">Add Online Exam</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. B.Sc. Nursing Sem 1 Online Mock Test"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                  >
                    {COURSES.filter((c) => c !== 'All Courses').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                  >
                    {SEMESTERS.filter((s) => s !== 'All Semesters').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date From</label>
                  <input
                    type="text"
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date To</label>
                  <input
                    type="text"
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.timeFrom}
                    onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                    }
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 30 })
                    }
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passing %</label>
                  <input
                    type="number"
                    value={formData.passingPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, passingPercentage: parseInt(e.target.value) || 50 })
                    }
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Exam instructions or scope..."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white text-sm font-semibold rounded-md shadow-md transition-colors disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Save Online Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

