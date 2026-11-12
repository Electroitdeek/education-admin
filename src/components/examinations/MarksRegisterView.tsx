'use client';

import { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MarksRow {
  admissionNo: string;
  studentName: string;
  rollNo?: string;
  course: string;
  semester: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  maxMarks: number;
  isAbsent: boolean;
  grade: string;
  result: string;
  note: string;
}

interface ExamTerm {
  _id: string;
  name: string;
}

interface ExamItem {
  _id: string;
  name: string;
  examGroupName: string;
}

interface Subject {
  _id: string;
  name: string;
  code?: string;
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

export default function MarksRegisterView({ onNavigate }: Props) {
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [rows, setRows] = useState<MarksRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [maxMarks, setMaxMarks] = useState(100);

  // Quick Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [quickEntry, setQuickEntry] = useState({
    admissionNo: '',
    studentName: '',
    rollNo: '',
    theoryMarks: 0,
    practicalMarks: 0,
    isAbsent: false,
    note: '',
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [termsRes, examsRes, subjRes, courseRes, semRes] = await Promise.all([
          fetch(`${API}/examinations/exam-groups`),
          fetch(`${API}/examinations/exams`),
          fetch(`${API}/academics/subjects`),
          fetch(`${API}/academics/courses`),
          fetch(`${API}/academics/semesters`),
        ]);
        if (termsRes.ok) setTerms(await termsRes.json());
        if (examsRes.ok) setExams(await examsRes.json());
        if (subjRes.ok) setSubjects(await subjRes.json());
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

  const filteredExams = selectedTerm
    ? exams.filter((e) => e.examGroupName === selectedTerm)
    : exams;

  const handleSearch = async () => {
    if (!selectedTerm || !selectedExam || !selectedCourse || !selectedSemester || !selectedSubject) {
      showToast('error', 'Please select Term List, Exam Name, Course, Semester, and Subject');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        examName: selectedExam,
        course: selectedCourse,
        semester: selectedSemester,
        subject: selectedSubject,
      });
      const res = await fetch(`${API}/examinations/marks-register?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } else {
        showToast('error', 'Failed to load marks register');
      }
    } catch {
      showToast('error', 'Network error while loading marks register');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedExam || !selectedCourse || !selectedSemester || !selectedSubject) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/marks-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: selectedExam,
          course: selectedCourse,
          semester: selectedSemester,
          subject: selectedSubject,
          maxMarks,
          entries: rows.map((r) => ({
            admissionNo: r.admissionNo,
            studentName: r.studentName,
            rollNo: r.rollNo,
            theoryMarks: Number(r.theoryMarks) || 0,
            practicalMarks: Number(r.practicalMarks) || 0,
            isAbsent: Boolean(r.isAbsent),
            note: r.note || '',
          })),
        }),
      });
      if (res.ok) {
        showToast('success', 'Marks saved successfully');
        handleSearch();
      } else {
        showToast('error', 'Failed to save marks');
      }
    } catch {
      showToast('error', 'Network error while saving marks');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedCourse || !selectedSemester || !selectedSubject) {
      showToast('error', 'Select criteria (Term, Exam, Course, Semester, Subject) first');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/marks-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: selectedExam,
          course: selectedCourse,
          semester: selectedSemester,
          subject: selectedSubject,
          maxMarks,
          entries: [quickEntry],
        }),
      });
      if (res.ok) {
        showToast('success', 'Student marks added');
        setIsAddOpen(false);
        setQuickEntry({
          admissionNo: '',
          studentName: '',
          rollNo: '',
          theoryMarks: 0,
          practicalMarks: 0,
          isAbsent: false,
          note: '',
        });
        handleSearch();
      }
    } catch {
      showToast('error', 'Failed to add student marks');
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
          <FileCheck className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">Marks Register</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Marks Register</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Term List <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  setSelectedExam('');
                }}
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
                Exam Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              >
                <option value="">Select</option>
                {filteredExams.map((ex) => (
                  <option key={ex._id} value={ex.name}>
                    {ex.name}
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
                <option value="">Select</option>
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
                <option value="">Select</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
              >
                <option value="">Select</option>
                {subjects.map((sb) => (
                  <option key={sb._id} value={sb.name}>
                    {sb.name}
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

      {/* Marks Table */}
      {searched && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Marks Entry — {selectedSubject} ({selectedCourse} / {selectedSemester})
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <label className="font-semibold text-slate-600">Max Marks:</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
                className="w-20 px-2.5 py-1 border border-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving || rows.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6b1b82] text-white font-semibold rounded-lg cursor-pointer disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                  <th className="px-4 py-3">SR. NO</th>
                  <th className="px-4 py-3">ADMISSION NO.</th>
                  <th className="px-4 py-3">ROLL NO</th>
                  <th className="px-4 py-3">STUDENT</th>
                  <th className="px-4 py-3">THEORY</th>
                  <th className="px-4 py-3">PRACTICAL</th>
                  <th className="px-4 py-3">TOTAL</th>
                  <th className="px-4 py-3">ABSENT</th>
                  <th className="px-4 py-3">NOTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No active students found for this course and semester
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.admissionNo} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{r.admissionNo}</td>
                      <td className="px-4 py-2.5">{r.rollNo || '-'}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{r.studentName}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          disabled={r.isAbsent}
                          value={r.theoryMarks}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].theoryMarks = Number(e.target.value) || 0;
                            next[idx].totalMarks = next[idx].theoryMarks + next[idx].practicalMarks;
                            setRows(next);
                          }}
                          className="w-20 px-2 py-1 border border-slate-200 rounded"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          disabled={r.isAbsent}
                          value={r.practicalMarks}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].practicalMarks = Number(e.target.value) || 0;
                            next[idx].totalMarks = next[idx].theoryMarks + next[idx].practicalMarks;
                            setRows(next);
                          }}
                          className="w-20 px-2 py-1 border border-slate-200 rounded"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#80229a]">
                        {r.isAbsent ? 'AB' : Number(r.theoryMarks) + Number(r.practicalMarks)}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={r.isAbsent}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].isAbsent = e.target.checked;
                            setRows(next);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={r.note || ''}
                          onChange={(e) => {
                            const next = [...rows];
                            next[idx].note = e.target.value;
                            setRows(next);
                          }}
                          placeholder="Remark..."
                          className="w-36 px-2 py-1 border border-slate-200 rounded"
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

      {/* Quick Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickAdd}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#80229a] text-white">
              <h3 className="text-sm font-semibold">Add Student Marks</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission No *</label>
                <input
                  required
                  value={quickEntry.admissionNo}
                  onChange={(e) => setQuickEntry({ ...quickEntry, admissionNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name *</label>
                <input
                  required
                  value={quickEntry.studentName}
                  onChange={(e) => setQuickEntry({ ...quickEntry, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Theory Marks</label>
                  <input
                    type="number"
                    value={quickEntry.theoryMarks}
                    onChange={(e) => setQuickEntry({ ...quickEntry, theoryMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Practical Marks</label>
                  <input
                    type="number"
                    value={quickEntry.practicalMarks}
                    onChange={(e) => setQuickEntry({ ...quickEntry, practicalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
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
