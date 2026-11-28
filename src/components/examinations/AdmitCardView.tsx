'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  User,
  Calendar,
  Building2,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

interface ExamTerm {
  _id: string;
  name: string;
}

interface ExamItem {
  _id: string;
  name: string;
  examGroupName: string;
}

interface Candidate {
  admissionNo: string;
  studentName: string;
  rollNo: string;
  fatherName: string;
  gender: string;
  category: string;
}

interface Paper {
  subject: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  roomNo: string;
  maxMarks: number;
}

interface AdmitCardData {
  instituteName: string;
  centerName: string;
  session: string;
  examName: string;
  course: string;
  semester: string;
  papers: Paper[];
  candidates: Candidate[];
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

export default function AdmitCardView({ onNavigate }: Props) {
  const [terms, setTerms] = useState<ExamTerm[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [courses, setCourses] = useState<string[]>(DEFAULT_COURSES);
  const [semesters, setSemesters] = useState<string[]>(DEFAULT_SEMESTERS);

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [admitCardData, setAdmitCardData] = useState<AdmitCardData | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
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
        if (termsRes.ok) {
          const t = await termsRes.json();
          setTerms(Array.isArray(t) ? t : []);
        }
        if (examsRes.ok) {
          const e = await examsRes.json();
          setExams(Array.isArray(e) ? e : []);
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
        // Fallback defaults
      }
    };
    loadMeta();
  }, []);

  const filteredExams = selectedTerm
    ? exams.filter((e) => e.examGroupName === selectedTerm)
    : exams;

  const handleSearch = async () => {
    if (!selectedTerm || !selectedExam || !selectedCourse || !selectedSemester) {
      showToast('error', 'Please select Term List, Exam Name, Course, and Semester');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        course: selectedCourse,
        semester: selectedSemester,
        examName: selectedExam,
      });
      const res = await fetch(`${API}/examinations/admit-card?${params.toString()}`);
      if (res.ok) {
        const data: AdmitCardData = await res.json();
        setAdmitCardData(data);
        setSelectedCandidate(data.candidates?.[0] || null);
      } else {
        showToast('error', 'Failed to fetch admit card data');
      }
    } catch {
      showToast('error', 'Network error while fetching admit card data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTerm && selectedExam && selectedCourse && selectedSemester) {
      handleSearch();
    }
  }, [selectedTerm, selectedExam, selectedCourse, selectedSemester]);

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
          <h1 className="text-xl font-bold text-slate-800">Admit Card</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => onNavigate?.('term-list')}
            className="text-[#80229a] font-medium cursor-pointer hover:underline"
          >
            Examinations
          </span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Admit Card</span>
        </div>
      </div>

      {/* Select Criteria */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-800">Select Criteria</h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Candidate List + Admit Card Preview */}
      {admitCardData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Eligible Students ({admitCardData.candidates.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                    <th className="px-3 py-2.5">ADMISSION NO</th>
                    <th className="px-3 py-2.5">STUDENT</th>
                    <th className="px-3 py-2.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {admitCardData.candidates.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                        No active students found for selected course & semester
                      </td>
                    </tr>
                  ) : (
                    admitCardData.candidates.map((c) => (
                      <tr
                        key={c.admissionNo}
                        className={`hover:bg-purple-50/40 ${
                          selectedCandidate?.admissionNo === c.admissionNo ? 'bg-purple-50/70' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 font-medium">{c.admissionNo}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{c.studentName}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(c)}
                            className="px-2.5 py-1 bg-[#80229a] text-white rounded-md text-[11px] font-semibold cursor-pointer"
                          >
                            View Card
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
                <ShieldCheck className="w-4 h-4 text-[#80229a]" />
                <h3 className="text-sm font-semibold text-slate-800">Admit Card Preview</h3>
              </div>
              {selectedCandidate && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6b1b82] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Admit Card
                </button>
              )}
            </div>

            {selectedCandidate ? (
              <div className="p-6 space-y-5">
                <div className="border-2 border-[#80229a]/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#80229a] font-bold text-base">
                        <Building2 className="w-5 h-5" />
                        <span>{admitCardData.instituteName}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Examination Center: {admitCardData.centerName} • Session {admitCardData.session}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-[#80229a] text-xs font-bold rounded-full">
                      ADMIT CARD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Student Name</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#80229a]" /> {selectedCandidate.studentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Admission No</span>
                      <span className="font-semibold text-slate-800">{selectedCandidate.admissionNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Roll No</span>
                      <span className="font-semibold text-slate-800">{selectedCandidate.rollNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Father Name</span>
                      <span className="font-semibold text-slate-800">{selectedCandidate.fatherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Course & Semester</span>
                      <span className="font-semibold text-slate-800">
                        {admitCardData.course} ({admitCardData.semester})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Exam</span>
                      <span className="font-semibold text-slate-800">{admitCardData.examName}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#fef2f2] border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                          <th className="px-3 py-2">SUBJECT</th>
                          <th className="px-3 py-2">DATE</th>
                          <th className="px-3 py-2">TIME</th>
                          <th className="px-3 py-2">ROOM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {admitCardData.papers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                              No exam schedule papers added yet
                            </td>
                          </tr>
                        ) : (
                          admitCardData.papers.map((p, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 font-medium">{p.subject}</td>
                              <td className="px-3 py-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {p.date}
                              </td>
                              <td className="px-3 py-2">
                                {p.timeFrom} - {p.timeTo}
                              </td>
                              <td className="px-3 py-2">{p.roomNo}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400">
                Select a student from the list to preview their Admit Card
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
