'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  BookOpen,
  CalendarDays,
  UserX,
  CalendarClock,
  SlidersHorizontal,
  Users,
  BarChart3,
  Search,
  Copy,
  Download,
  Printer,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

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

type AttReportId =
  | 'attendance-report'
  | 'course-wise-report'
  | 'attendance-by-date'
  | 'absent-student-report'
  | 'unmarked-attendance'
  | 'custom-attendance-report'
  | 'custom-faculty-wise'
  | 'detailed-course-attendance';

interface AttCardDef {
  id: AttReportId;
  title: string;
  subtitle: string;
  icon: any;
  bgClass: string;
  iconClass: string;
}

const REPORT_CARDS: AttCardDef[] = [
  {
    id: 'attendance-report',
    title: 'ATTENDANCE REPORT',
    subtitle: 'Attendance Report',
    icon: FileText,
    bgClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
  {
    id: 'course-wise-report',
    title: 'COURSE WISE REPORT',
    subtitle: 'Course Wise Report',
    icon: BookOpen,
    bgClass: 'bg-indigo-100',
    iconClass: 'text-indigo-600',
  },
  {
    id: 'attendance-by-date',
    title: 'ATTENDANCE BY DATE',
    subtitle: 'Attendance By Date',
    icon: CalendarDays,
    bgClass: 'bg-sky-100',
    iconClass: 'text-sky-600',
  },
  {
    id: 'absent-student-report',
    title: 'ABSENT STUDENT REPORT',
    subtitle: 'Absent Student Report',
    icon: UserX,
    bgClass: 'bg-rose-100',
    iconClass: 'text-rose-600',
  },
  {
    id: 'unmarked-attendance',
    title: 'UNMARKED ATTENDANCE',
    subtitle: 'Unmarked Attendance',
    icon: CalendarClock,
    bgClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
  },
  {
    id: 'custom-attendance-report',
    title: 'CUSTOM ATTENDANCE REPORT',
    subtitle: 'Custom Attendance Report',
    icon: SlidersHorizontal,
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    id: 'custom-faculty-wise',
    title: 'CUSTOM FACULTY WISE',
    subtitle: 'Custom Faculty Wise',
    icon: Users,
    bgClass: 'bg-cyan-100',
    iconClass: 'text-cyan-600',
  },
  {
    id: 'detailed-course-attendance',
    title: 'DETAILED COURSE ATTENDANCE',
    subtitle: 'Detailed Course Attendance',
    icon: BarChart3,
    bgClass: 'bg-purple-100',
    iconClass: 'text-[#80229a]',
  },
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function AttendanceReportView({ onNavigate }: Props) {
  const [activeReport, setActiveReport] = useState<AttReportId | null>(null);
  const [loading, setLoading] = useState(false);

  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState('17-10-2026');
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState('2026');

  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(
    async (repId: AttReportId) => {
      setLoading(true);
      try {
        if (
          repId === 'attendance-by-date' ||
          repId === 'absent-student-report' ||
          repId === 'unmarked-attendance'
        ) {
          const params = new URLSearchParams();
          if (course) params.set('course', course);
          if (semester) params.set('semester', semester);
          params.set('date', date || '17-10-2026');
          const res = await fetch(`${API}/attendance/roster?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setRoster(data.roster || []);
          }
        } else {
          const params = new URLSearchParams();
          if (course) params.set('course', course);
          if (semester) params.set('semester', semester);
          params.set('month', month);
          params.set('year', year);
          const res = await fetch(`${API}/attendance/report?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setMonthlyReport(data.report || []);
          }
        }
      } catch {
        showToast('error', 'Failed to fetch attendance report data.');
      } finally {
        setLoading(false);
      }
    },
    [course, semester, date, month, year]
  );

  useEffect(() => {
    if (activeReport) loadData(activeReport);
  }, [activeReport]);

  const activeCard = REPORT_CARDS.find((c) => c.id === activeReport);

  const getTableData = (): { headers: string[]; rows: string[][] } => {
    switch (activeReport) {
      case 'attendance-by-date':
        return {
          headers: ['#', 'Admission No', 'Roll No', 'Student Name', 'Course', 'Date', 'Status', 'Remark'],
          rows: roster.map((r, i) => [
            String(i + 1),
            r.admissionNo,
            r.rollNo || '-',
            r.studentName,
            `${r.course} (${r.semester})`,
            r.date,
            r.status,
            r.remark || '-',
          ]),
        };
      case 'absent-student-report': {
        const absents = roster.filter((r) => r.status === 'Absent');
        return {
          headers: ['#', 'Admission No', 'Roll No', 'Student Name', 'Course', 'Date', 'Status', 'Remark'],
          rows: absents.map((r, i) => [
            String(i + 1),
            r.admissionNo,
            r.rollNo || '-',
            r.studentName,
            `${r.course} (${r.semester})`,
            r.date,
            r.status,
            r.remark || '-',
          ]),
        };
      }
      case 'unmarked-attendance': {
        const unmarked = roster.filter((r) => !r.isSaved);
        return {
          headers: ['#', 'Admission No', 'Roll No', 'Student Name', 'Course', 'Date', 'Saved Status'],
          rows: unmarked.map((r, i) => [
            String(i + 1),
            r.admissionNo,
            r.rollNo || '-',
            r.studentName,
            `${r.course} (${r.semester})`,
            r.date,
            'Unmarked',
          ]),
        };
      }
      case 'course-wise-report':
      case 'detailed-course-attendance': {
        const map: Record<
          string,
          { course: string; students: number; totalPresent: number; totalWorking: number; eligible: number }
        > = {};
        monthlyReport.forEach((r) => {
          const k = `${r.course} (${r.semester})`;
          if (!map[k]) {
            map[k] = { course: k, students: 0, totalPresent: 0, totalWorking: 0, eligible: 0 };
          }
          map[k].students++;
          map[k].totalPresent += r.presentDays || 0;
          map[k].totalWorking += r.totalWorkingDays || 0;
          if (r.isEligibleForExam) map[k].eligible++;
        });
        return {
          headers: ['#', 'Course / Semester', 'Total Students', 'Avg Attendance %', 'Eligible (>=75%)', 'Defaulters'],
          rows: Object.values(map).map((g, i) => {
            const pct = g.totalWorking > 0 ? Math.round((g.totalPresent / g.totalWorking) * 100) : 0;
            return [
              String(i + 1),
              g.course,
              String(g.students),
              `${pct}%`,
              String(g.eligible),
              String(g.students - g.eligible),
            ];
          }),
        };
      }
      default:
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Roll No',
            'Course',
            'Working Days',
            'Present',
            'Absent',
            'Percentage',
            'Eligibility',
          ],
          rows: monthlyReport.map((r, i) => [
            String(i + 1),
            r.admissionNo,
            r.studentName,
            r.rollNo || '-',
            `${r.course} (${r.semester})`,
            String(r.totalWorkingDays),
            String(r.presentDays),
            String(r.absentDays),
            `${r.percentage}%`,
            r.isEligibleForExam ? 'Eligible' : 'Defaulter (<75%)',
          ]),
        };
    }
  };

  const { headers, rows } = activeReport ? getTableData() : { headers: [], rows: [] };

  const handleDownloadCsv = () => {
    if (!rows.length) {
      showToast('error', 'No rows to export.');
      return;
    }
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport || 'attendance-report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV report downloaded.');
  };

  const handleCopy = async () => {
    const text = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied report table to clipboard.');
    } catch {
      showToast('error', 'Copy failed.');
    }
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
            <FileText className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">
              {activeCard ? activeCard.title : 'Attendance Report'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('student-attendance')}
              className="inline-flex items-center gap-1 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              Attendance
            </button>
            <span className="text-gray-400">/</span>
            {activeCard ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="text-[#80229a] hover:underline font-medium cursor-pointer"
                >
                  Attendance Report
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{activeCard.subtitle}</span>
              </>
            ) : (
              <span className="text-gray-600">Attendance Report</span>
            )}
          </div>
        </div>

        {/* HUB VIEW: 3-COLUMN GRID OF 8 REPORT CARDS */}
        {!activeReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPORT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveReport(card.id)}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-[#80229a]/40 transition p-4 flex items-center gap-4 text-left cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${card.bgClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition`}
                  >
                    <Icon className={`w-6 h-6 ${card.iconClass}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-800 tracking-wide truncate group-hover:text-[#80229a] transition">
                      {card.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{card.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* DETAIL REPORT VIEW */}
        {activeReport && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-bold text-gray-800">Select Criteria</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> All Attendance Reports
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                  >
                    <option value="">All Courses</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {activeReport === 'attendance-by-date' ||
                activeReport === 'absent-student-report' ||
                activeReport === 'unmarked-attendance' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Month / Year</label>
                    <div className="flex gap-2">
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="flex-1 h-9 px-2 text-xs bg-white border border-gray-300 rounded-md"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                          (m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-20 h-9 px-2 text-xs bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => loadData(activeReport)}
                    className="h-9 px-4 bg-[#80229a] hover:bg-[#6a1b82] text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" /> Search
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-bold text-gray-800">
                  {activeCard?.title}{' '}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    ({rows.length} record{rows.length === 1 ? '' : 's'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                  Loading report...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="px-4 py-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={Math.max(headers.length, 1)} className="px-4 py-10 text-center text-gray-500">
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-purple-50/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
