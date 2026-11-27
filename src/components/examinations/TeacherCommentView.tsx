'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

interface ExamTerm {
  _id: string;
  name: string;
}

interface RemarkRow {
  admissionNo: string;
  rollNo: string;
  studentName: string;
  teacherComment: string;
  principalComment: string;
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

export default function TeacherCommentView({ onNavigate }: Props) {
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [rows, setRows] = useState<RemarkRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [quickRow, setQuickRow] = useState<RemarkRow>({
    admissionNo: '',
    rollNo: '',
    studentName: '',
    teacherComment: '',
    principalComment: '',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [termsRes, courseRes, semRes] = await Promise.all([
          fetch(`${API}/examinations/exam-groups`),
          fetch(`${API}/academics/courses`),
          fetch(`${API}/academics/semesters`),
        ]);
        if (termsRes.ok) setTerms(await termsRes.json());
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
        // Fallback defaults
      }
    };
    loadMeta();
  }, []);

  const handleSearch = async () => {
    if (!selectedTerm || !selectedCourse || !selectedSemester) {
      showToast('error', 'Please select Term List, Course, and Semester');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        termName: selectedTerm,
        course: selectedCourse,
        semester: selectedSemester,
      });
      const res = await fetch(`${API}/examinations/teacher-remarks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } else {
        showToast('error', 'Failed to fetch teacher comments');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/teacher-remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termName: selectedTerm,
          course: selectedCourse,
          semester: selectedSemester,
          entries: rows,
        }),
      });
      if (res.ok) {
        showToast('success', 'Teacher & Principal comments saved');
      } else {
        showToast('error', 'Failed to save comments');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTerm || !selectedCourse || !selectedSemester) {
      showToast('error', 'Please select Term List, Course, and Semester first');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/teacher-remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termName: selectedTerm,
          course: selectedCourse,
          semester: selectedSemester,
          entries: [quickRow],
        }),
      });
      if (res.ok) {
        showToast('success', 'Comment added');
        setIsAddOpen(false);
        setQuickRow({
          admissionNo: '',
          rollNo: '',
          studentName: '',
          teacherComment: '',
          principalComment: '',
        });
        handleSearch();
      }
    } catch {
      showToast('error', 'Failed to add comment');
    } finally {
      setSaving(false);
    }
  };

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
          <MessageSquare className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">Teacher Comment</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Teacher Comment</span>
        </div>
      </div>

      {/* Select Criteria */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Select Criteria</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Term List <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              >
                <option value="">Select</option>
                {terms.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
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
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
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
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <Search className="w-3.5 h-3.5" /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Table matching Screenshot 5 */}
      {searched && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Teacher & Principal Comment ({selectedCourse} / {selectedSemester})
            </h3>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving || rows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#80229a] hover:bg-[#6b1b82] rounded-lg cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Comments'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                  <th className="px-4 py-3">SR. NO</th>
                  <th className="px-4 py-3">ADMISSION NO.</th>
                  <th className="px-4 py-3">ROLL NO</th>
                  <th className="px-4 py-3">STUDENT</th>
                  <th className="px-4 py-3">TEACHER COMMENT</th>
                  <th className="px-4 py-3">PRINCIPAL COMMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No active students found
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.admissionNo} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{r.admissionNo}</td>
                      <td className="px-4 py-2.5">{r.rollNo || ''}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{r.studentName}</td>
                      <td className="px-4 py-2.5">
                        <input
                          value={r.teacherComment}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].teacherComment = e.target.value;
                            setRows(next);
                          }}
                          placeholder="Teacher comment..."
                          className="w-full min-w-[180px] px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          value={r.principalComment}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].principalComment = e.target.value;
                            setRows(next);
                          }}
                          placeholder="Principal comment..."
                          className="w-full min-w-[180px] px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickAdd}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#80229a] text-white">
              <h3 className="text-sm font-semibold">Add Teacher / Principal Comment</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission No *</label>
                <input
                  required
                  value={quickRow.admissionNo}
                  onChange={(e) => setQuickRow({ ...quickRow, admissionNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name *</label>
                <input
                  required
                  value={quickRow.studentName}
                  onChange={(e) => setQuickRow({ ...quickRow, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Comment</label>
                <input
                  value={quickRow.teacherComment}
                  onChange={(e) => setQuickRow({ ...quickRow, teacherComment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Principal Comment</label>
                <input
                  value={quickRow.principalComment}
                  onChange={(e) => setQuickRow({ ...quickRow, principalComment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
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
                className="px-5 py-2 text-xs font-semibold text-white bg-[#80229a] rounded-lg cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

