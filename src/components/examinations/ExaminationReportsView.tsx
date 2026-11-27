'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  BarChart3,
  BookOpen,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

type ReportType = 'term' | 'subject' | 'fail';

interface ExamTerm {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface ReportRow {
  _id: string;
  admissionNo: string;
  rollNo?: string;
  studentName: string;
  examName: string;
  course: string;
  semester: string;
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  result: string;
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

export default function ExaminationReportsView({ onNavigate }: Props) {
  const [activeType, setActiveType] = useState<ReportType | null>(null);
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [termsRes, subjRes, courseRes, semRes] = await Promise.all([
          fetch(`${API}/examinations/exam-groups`),
          fetch(`${API}/academics/subjects`),
          fetch(`${API}/academics/courses`),
          fetch(`${API}/academics/semesters`),
        ]);
        if (termsRes.ok) setTerms(await termsRes.json());
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

  const handleSearch = async () => {
    if (!activeType) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ type: activeType });
      if (selectedTerm) params.set('termName', selectedTerm);
      if (selectedCourse) params.set('course', selectedCourse);
      if (selectedSemester) params.set('semester', selectedSemester);
      if (activeType === 'subject' && selectedSubject) params.set('subject', selectedSubject);

      const res = await fetch(`${API}/examinations/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } else {
        showToast('error', 'Failed to load report');
      }
    } catch {
      showToast('error', 'Network error while loading report');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const dataRows = [
      ['Admission No', 'Roll No', 'Student', 'Exam', 'Subject', 'Theory', 'Practical', 'Total', 'Grade', 'Result'],
      ...rows.map((r) => [
        r.admissionNo,
        r.rollNo || '',
        r.studentName,
        r.examName,
        r.subject,
        r.theoryMarks,
        r.practicalMarks,
        `${r.totalMarks}/${r.maxMarks}`,
        r.grade,
        r.result,
      ]),
    ];
    const csv = dataRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `examination_${activeType || 'summary'}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards: { id: ReportType; title: string; subtitle: string; color: string }[] = [
    { id: 'term', title: 'TERM WISE REPORT', subtitle: 'Term Wise Report', color: 'text-emerald-600' },
    { id: 'subject', title: 'SUBJECT WISE REPORT', subtitle: 'Subject Wise Report', color: 'text-rose-600' },
    { id: 'fail', title: 'FAIL STUDENTS REPORT', subtitle: 'Fail students Report', color: 'text-amber-600' },
  ];

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
          <FileText className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">Examination Reports</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examination
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Examination Reports</span>
        </div>
      </div>

      {/* 3 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isActive = activeType === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setActiveType(card.id);
                setSearched(false);
                setRows([]);
              }}
              className={`bg-white rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer shadow-sm border ${
                isActive
                  ? 'border-[#80229a]/40 border-b-4 border-b-[#80229a]'
                  : 'border-slate-200/80 hover:border-purple-200'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                {card.id === 'term' ? (
                  <BarChart3 className={`w-6 h-6 ${card.color}`} />
                ) : (
                  <BookOpen className={`w-6 h-6 ${card.color}`} />
                )}
              </div>
              <div>
                <div className="text-xs font-bold tracking-wide text-[#80229a]">{card.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{card.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Criteria when a report card is clicked */}
      {activeType && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Select Criteria</h2>
          </div>

          <div className="p-5">
            <div className={`grid grid-cols-1 gap-4 ${activeType === 'subject' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Term List</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">All Terms</option>
                  {terms.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/70"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/70"
                >
                  <option value="">All Semesters</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {activeType === 'subject' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sb) => (
                      <option key={sb._id} value={sb.name}>
                        {sb.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
      )}

      {/* Results Table */}
      {searched && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Report Results ({rows.length})</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                  <th className="px-4 py-3">ADMISSION NO</th>
                  <th className="px-4 py-3">STUDENT</th>
                  <th className="px-4 py-3">COURSE / SEM</th>
                  <th className="px-4 py-3">EXAM</th>
                  <th className="px-4 py-3">SUBJECT</th>
                  <th className="px-4 py-3">MARKS</th>
                  <th className="px-4 py-3">GRADE</th>
                  <th className="px-4 py-3">RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No records found for selected criteria
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-medium">{r.admissionNo}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{r.studentName}</td>
                      <td className="px-4 py-2.5">
                        {r.course} ({r.semester})
                      </td>
                      <td className="px-4 py-2.5">{r.examName}</td>
                      <td className="px-4 py-2.5">{r.subject}</td>
                      <td className="px-4 py-2.5">
                        {r.totalMarks} / {r.maxMarks}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#80229a]">{r.grade}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.result === 'Pass'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {r.result}
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
  );
}

