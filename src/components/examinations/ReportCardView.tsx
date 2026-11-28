'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Award,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

type ReportMode = 'term' | 'exam' | 'consolidated';

interface ExamTerm {
  _id: string;
  name: string;
}

interface ExamItem {
  _id: string;
  name: string;
  examGroupName: string;
}

interface ReportCardSubject {
  examName: string;
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  result: string;
}

interface ReportCardItem {
  admissionNo: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
  course: string;
  semester: string;
  subjects: ReportCardSubject[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  division: string;
  result: string;
  coCurricular: { subject: string; grade: string; remark: string } | null;
  teacherComment: string;
  principalComment: string;
  attendance: { totalDays: number; presentDays: number } | null;
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

export default function ReportCardView({ onNavigate }: Props) {
  const [mode, setMode] = useState<ReportMode>('term');
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [cards, setCards] = useState<ReportCardItem[]>([]);
  const [activeCard, setActiveCard] = useState<ReportCardItem | null>(null);
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
        const [termsRes, examsRes, courseRes, semRes] = await Promise.all([
          fetch(`${API}/examinations/exam-groups`),
          fetch(`${API}/examinations/exams`),
          fetch(`${API}/academics/courses`),
          fetch(`${API}/academics/semesters`),
        ]);
        if (termsRes.ok) setTerms(await termsRes.json());
        if (examsRes.ok) setExams(await examsRes.json());
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
    if (mode === 'term' && (!selectedTerm || !selectedCourse || !selectedSemester)) {
      showToast('error', 'Please select Term List, Course, and Semester');
      return;
    }
    if (mode === 'exam' && (!selectedTerm || !selectedExam || !selectedCourse || !selectedSemester)) {
      showToast('error', 'Please select Term List, Exam Name, Course, and Semester');
      return;
    }
    if (mode === 'consolidated' && (!selectedCourse || !selectedSemester)) {
      showToast('error', 'Please select Course and Semester');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        mode,
        course: selectedCourse,
        semester: selectedSemester,
      });
      if (selectedTerm && mode !== 'consolidated') params.set('termName', selectedTerm);
      if (selectedExam && mode === 'exam') params.set('examName', selectedExam);

      const res = await fetch(`${API}/examinations/report-cards?${params.toString()}`);
      if (res.ok) {
        const data: ReportCardItem[] = await res.json();
        setCards(Array.isArray(data) ? data : []);
        setActiveCard(data[0] || null);
      } else {
        showToast('error', 'Failed to generate report cards');
      }
    } catch {
      showToast('error', 'Network error while generating report cards');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ReportMode; title: string; subtitle: string }[] = [
    { id: 'term', title: 'TERM WISE REPORT CARD', subtitle: 'Term Wise Report Card' },
    { id: 'exam', title: 'EXAM WISE REPORT CARD', subtitle: 'Exam Wise Report Card' },
    { id: 'consolidated', title: 'CONSOLIDATED REPORT CARD', subtitle: 'Consolidated Report Card' },
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
          <h1 className="text-xl font-bold text-slate-800">Report Card</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Report Card</span>
        </div>
      </div>

      {/* 3 Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setSearched(false);
                setCards([]);
                setActiveCard(null);
              }}
              className={`bg-white rounded-xl p-4 flex items-center gap-3.5 text-left transition cursor-pointer shadow-sm border ${
                isActive
                  ? 'border-[#80229a]/40 border-b-4 border-b-[#80229a]'
                  : 'border-slate-200/80 hover:border-purple-200'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-wide text-[#80229a]">{tab.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{tab.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Select Criteria */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-800">Select Criteria</h2>
        </div>

        <div className="p-5">
          <div
            className={`grid grid-cols-1 gap-4 ${
              mode === 'exam' ? 'md:grid-cols-4' : mode === 'term' ? 'md:grid-cols-3' : 'md:grid-cols-2'
            }`}
          >
            {mode !== 'consolidated' && (
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
            )}

            {mode === 'exam' && (
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
            )}

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

      {/* Results */}
      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Students ({cards.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                    <th className="px-3 py-2.5">ADMISSION NO</th>
                    <th className="px-3 py-2.5">STUDENT</th>
                    <th className="px-3 py-2.5">%</th>
                    <th className="px-3 py-2.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cards.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No active students found
                      </td>
                    </tr>
                  ) : (
                    cards.map((c) => (
                      <tr
                        key={c.admissionNo}
                        className={activeCard?.admissionNo === c.admissionNo ? 'bg-purple-50/70' : ''}
                      >
                        <td className="px-3 py-2.5 font-medium">{c.admissionNo}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{c.studentName}</td>
                        <td className="px-3 py-2.5">{c.percentage}%</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveCard(c)}
                            className="px-2.5 py-1 bg-[#80229a] text-white rounded-md text-[11px] font-semibold cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#80229a]" />
                <h3 className="text-sm font-semibold text-slate-800">Report Card Preview</h3>
              </div>
              {activeCard && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6b1b82] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              )}
            </div>

            {activeCard ? (
              <div className="p-6">
                <div className="border-2 border-[#80229a]/30 rounded-xl p-5 space-y-4 text-xs">
                  <div className="text-center border-b border-slate-200 pb-3">
                    <div className="text-base font-bold text-[#80229a]">
                      ELECTRO INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
                    </div>
                    <div className="text-slate-500 mt-0.5 uppercase font-semibold">
                      {mode === 'term'
                        ? `Term Wise Report Card (${selectedTerm})`
                        : mode === 'exam'
                          ? `Exam Wise Report Card (${selectedExam})`
                          : 'Consolidated Report Card'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block">Student Name</span>
                      <span className="font-bold text-slate-800">{activeCard.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Admission No</span>
                      <span className="font-semibold">{activeCard.admissionNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Roll No</span>
                      <span className="font-semibold">{activeCard.rollNo || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Father Name</span>
                      <span className="font-semibold">{activeCard.fatherName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Course & Semester</span>
                      <span className="font-semibold">
                        {activeCard.course} ({activeCard.semester})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Result / Division</span>
                      <span className="font-bold text-[#80229a]">
                        {activeCard.result} ({activeCard.division})
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                          <th className="px-3 py-2">SUBJECT</th>
                          <th className="px-3 py-2">THEORY</th>
                          <th className="px-3 py-2">PRACTICAL</th>
                          <th className="px-3 py-2">TOTAL</th>
                          <th className="px-3 py-2">GRADE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeCard.subjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                              No marks recorded yet
                            </td>
                          </tr>
                        ) : (
                          activeCard.subjects.map((sub, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">{sub.subject}</td>
                              <td className="px-3 py-2">{sub.theoryMarks}</td>
                              <td className="px-3 py-2">{sub.practicalMarks}</td>
                              <td className="px-3 py-2 font-semibold">
                                {sub.totalMarks} / {sub.maxMarks}
                              </td>
                              <td className="px-3 py-2 font-bold text-[#80229a]">{sub.grade}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-lg p-3">
                    <div>
                      <span className="text-slate-400 block">Grand Total</span>
                      <span className="font-bold">
                        {activeCard.totalObtained} / {activeCard.totalMax}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Percentage</span>
                      <span className="font-bold">{activeCard.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Overall Grade</span>
                      <span className="font-bold">{activeCard.overallGrade}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Attendance</span>
                      <span className="font-bold">
                        {activeCard.attendance
                          ? `${activeCard.attendance.presentDays} / ${activeCard.attendance.totalDays}`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {(activeCard.teacherComment || activeCard.principalComment || activeCard.coCurricular) && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {activeCard.coCurricular && (
                        <div>
                          <span className="font-semibold text-slate-700">Co-Curricular:</span>{' '}
                          {activeCard.coCurricular.subject} — Grade {activeCard.coCurricular.grade}{' '}
                          {activeCard.coCurricular.remark ? `(${activeCard.coCurricular.remark})` : ''}
                        </div>
                      )}
                      {activeCard.teacherComment && (
                        <div>
                          <span className="font-semibold text-slate-700">Teacher Comment:</span>{' '}
                          {activeCard.teacherComment}
                        </div>
                      )}
                      {activeCard.principalComment && (
                        <div>
                          <span className="font-semibold text-slate-700">Principal Comment:</span>{' '}
                          {activeCard.principalComment}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400">
                Select a student to preview their Report Card
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

