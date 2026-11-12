'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Percent,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AttemptResult {
  _id: string;
  examId: string;
  examTitle: string;
  admissionNo: string;
  studentName: string;
  rollNo?: string;
  course: string;
  semester: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
  status: string;
  submittedAt: string;
}

interface OnlineExam {
  _id: string;
  title: string;
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

export default function OnlineExamResultView({ onNavigate }: Props) {
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [loading, setLoading] = useState(false);

  const [examFilter, setExamFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, examsData] = await Promise.all([
        fetch(`${API}/online-exam/results`),
        fetch(`${API}/online-exam`),
      ]);
      if (resData.ok) setResults(await resData.json());
      if (examsData.ok) setExams(await examsData.json());
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResults = results.filter((r) => {
    if (examFilter !== 'All' && r.examTitle !== examFilter) return false;
    if (courseFilter !== 'All Courses' && r.course !== courseFilter) return false;
    if (semesterFilter !== 'All Semesters' && r.semester !== semesterFilter) return false;
    return true;
  });

  const totalCount = filteredResults.length;
  const passedCount = filteredResults.filter((r) => r.status === 'Pass').length;
  const failedCount = filteredResults.filter((r) => r.status === 'Fail').length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          filteredResults.reduce((acc, r) => acc + (r.scorePercentage || 0), 0) / totalCount
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-7 h-7 text-[#80229a]" />
            Online Exam Result
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Online Examination / Digital Evaluation • Student Computer Based Test Score Ledger & Pass/Fail Analysis
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#80229a]" /> Total Submissions
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</div>
        </div>

        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Passed Candidates
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{passedCount}</div>
        </div>

        <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Failed Candidates
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{failedCount}</div>
        </div>

        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-[#80229a] uppercase tracking-wide flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5" /> Class Average Score
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{avgScore}%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#80229a]" /> Filter Examination Results
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Online Exam</label>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
            >
              <option value="All">All Online Exams</option>
              {exams.map((e) => (
                <option key={e._id} value={e.title}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#80229a]" />
            <h2 className="text-base font-bold text-slate-800">CBT Evaluation Ledger</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredResults.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Exam & Class</th>
                <th className="py-3 px-4 text-center">Total Questions</th>
                <th className="py-3 px-4 text-center">Correct</th>
                <th className="py-3 px-4 text-center">Incorrect</th>
                <th className="py-3 px-4 text-center">Score %</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Loading results...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No online exam submissions found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.studentName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {r.admissionNo} • Roll: {r.rollNo || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{r.examTitle}</div>
                      <div className="text-slate-400">
                        {r.course} ({r.semester})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                      {r.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                      {r.correctAnswers}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-700">
                      {r.incorrectAnswers}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          r.scorePercentage >= 50
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.scorePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.status === 'Pass' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" /> Fail
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono">
                      {r.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

