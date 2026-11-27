'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Users,
  History,
  UserCheck,
  GitFork,
  KeyRound,
  SlidersHorizontal,
  FileUp,
  BarChart3,
  Layers,
  UserX,
  Search,
  Download,
  Printer,
  Copy,
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
  'DOTT-1st Year',
  'DECG-1st Year',
  'DMLT-1st Year',
];

type ReportId =
  | 'student-report'
  | 'guardian-report'
  | 'student-history'
  | 'ptm-reports'
  | 'siblings-report'
  | 'student-login-credential'
  | 'custom-field-report'
  | 'export-student'
  | 'student-strength-report'
  | 'batch-wise-strength-report'
  | 'admission-inactive-counter';

interface ReportCardDef {
  id: ReportId;
  title: string;
  subtitle: string;
  icon: any;
  bgClass: string;
  iconClass: string;
}

const REPORT_CARDS: ReportCardDef[] = [
  {
    id: 'student-report',
    title: 'STUDENT REPORT',
    subtitle: 'Class Section Wise',
    icon: FileText,
    bgClass: 'bg-sky-100',
    iconClass: 'text-sky-600',
  },
  {
    id: 'guardian-report',
    title: 'GUARDIAN REPORT',
    subtitle: 'Guardian Report',
    icon: Users,
    bgClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
  {
    id: 'student-history',
    title: 'STUDENT HISTORY',
    subtitle: 'Student History',
    icon: History,
    bgClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    id: 'ptm-reports',
    title: 'PTM REPORTS',
    subtitle: 'Student Ptm',
    icon: UserCheck,
    bgClass: 'bg-indigo-100',
    iconClass: 'text-indigo-600',
  },
  {
    id: 'siblings-report',
    title: 'SIBLINGS REPORT',
    subtitle: 'Siblings Report',
    icon: GitFork,
    bgClass: 'bg-cyan-100',
    iconClass: 'text-cyan-600',
  },
  {
    id: 'student-login-credential',
    title: 'STUDENT LOGIN CREDENTIAL',
    subtitle: 'Student Login Credential',
    icon: KeyRound,
    bgClass: 'bg-purple-100',
    iconClass: 'text-[#80229a]',
  },
  {
    id: 'custom-field-report',
    title: 'CUSTOM FIELD REPORT',
    subtitle: 'Custom Field Report',
    icon: SlidersHorizontal,
    bgClass: 'bg-rose-100',
    iconClass: 'text-rose-600',
  },
  {
    id: 'export-student',
    title: 'EXPORT STUDENT',
    subtitle: 'Export Student',
    icon: FileUp,
    bgClass: 'bg-lime-100',
    iconClass: 'text-lime-700',
  },
  {
    id: 'student-strength-report',
    title: 'STUDENT STRENGTH REPORT',
    subtitle: 'Student Strength Report',
    icon: BarChart3,
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    id: 'batch-wise-strength-report',
    title: 'BATCH WISE STRENGTH REPORT',
    subtitle: 'Batch Wise Strength Report',
    icon: Layers,
    bgClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
  },
  {
    id: 'admission-inactive-counter',
    title: 'ADMISSION - INACTIVE COUNTER',
    subtitle: 'Admission - Inactive Counter',
    icon: UserX,
    bgClass: 'bg-pink-100',
    iconClass: 'text-pink-600',
  },
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentReportsView({ onNavigate }: Props) {
  const [activeReport, setActiveReport] = useState<ReportId | null>(null);
  const [loading, setLoading] = useState(false);

  // Criteria filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [keyword, setKeyword] = useState('');

  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [siblingGroups, setSiblingGroups] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadReportData = useCallback(
    async (reportId: ReportId, course = selectedCourse, semester = selectedSemester) => {
      setLoading(true);
      try {
        if (
          reportId === 'student-strength-report' ||
          reportId === 'batch-wise-strength-report' ||
          reportId === 'admission-inactive-counter'
        ) {
          const [repRes, batchRes] = await Promise.all([
            fetch(`${API}/student-info/reports`),
            fetch(`${API}/student-info/batches`),
          ]);
          if (repRes.ok) setReportSummary(await repRes.json());
          if (batchRes.ok) {
            const bData = await batchRes.json();
            setBatches(Array.isArray(bData) ? bData : bData.items || []);
          }
        } else if (reportId === 'siblings-report') {
          const res = await fetch(`${API}/student-info/siblings`);
          if (res.ok) {
            const sData = await res.json();
            setSiblingGroups(Array.isArray(sData) ? sData : sData.groups || sData.items || []);
          }
        } else {
          const params = new URLSearchParams();
          if (course) params.set('course', course);
          if (semester) params.set('semester', semester);
          const res = await fetch(`${API}/student-info/students?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setStudents(Array.isArray(data) ? data : data.items || []);
          }
        }
      } catch {
        showToast('error', 'Failed to load report data.');
      } finally {
        setLoading(false);
      }
    },
    [selectedCourse, selectedSemester]
  );

  const handleOpenReport = (card: ReportCardDef) => {
    if (card.id === 'export-student' && onNavigate) {
      onNavigate('student-import-export');
      return;
    }
    setActiveReport(card.id);
    setKeyword('');
    loadReportData(card.id, selectedCourse, selectedSemester);
  };

  useEffect(() => {
    if (activeReport) {
      loadReportData(activeReport, selectedCourse, selectedSemester);
    }
  }, [activeReport]);

  const filteredStudents = useMemo(() => {
    if (!keyword.trim()) return students;
    const q = keyword.toLowerCase();
    return students.filter(
      (s) =>
        (s.admissionNo || '').toLowerCase().includes(q) ||
        `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(q) ||
        (s.fatherName || '').toLowerCase().includes(q) ||
        (s.guardianName || '').toLowerCase().includes(q) ||
        (s.mobileNumber || '').includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q)
    );
  }, [students, keyword]);

  const activeCard = REPORT_CARDS.find((c) => c.id === activeReport);

  // Build CSV & Copy rows based on active report
  const getExportTable = (): { headers: string[]; rows: string[][] } => {
    switch (activeReport) {
      case 'student-report':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Course',
            'Semester',
            'Roll No',
            'Father Name',
            'DOB',
            'Gender',
            'Category',
            'Mobile Number',
            'Status',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            s.course || '',
            s.semester || '',
            s.rollNo || '',
            s.fatherName || '',
            s.dateOfBirth || '',
            s.gender || '',
            s.category || '',
            s.mobileNumber || '',
            s.status || 'Active',
          ]),
        };
      case 'guardian-report':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Course - Semester',
            'Mobile Number',
            'Guardian Name',
            'Guardian Relation',
            'Guardian Phone',
            'Father Name',
            'Mother Name',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            `${s.course || ''} - ${s.semester || ''}`,
            s.mobileNumber || '',
            s.guardianName || s.fatherName || '',
            s.guardianRelation || 'Father',
            s.guardianPhone || s.mobileNumber || '',
            s.fatherName || '',
            s.motherName || '',
          ]),
        };
      case 'student-history':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Admission Date',
            'Course',
            'Semester',
            'Batch',
            'Previous School',
            'Status',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            s.admissionDate || (s.createdAt ? String(s.createdAt).slice(0, 10) : '-'),
            s.course || '',
            s.semester || '',
            s.batch || '-',
            s.previousSchool || '-',
            s.status || 'Active',
          ]),
        };
      case 'ptm-reports':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Course',
            'Semester',
            'Father Name',
            'Mother Name',
            'Guardian Phone',
            'Status',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            s.course || '',
            s.semester || '',
            s.fatherName || '',
            s.motherName || '',
            s.guardianPhone || s.mobileNumber || '',
            s.status || 'Active',
          ]),
        };
      case 'siblings-report': {
        const flatRows: string[][] = [];
        let idx = 1;
        siblingGroups.forEach((grp: any) => {
          const list = grp.students || [];
          list.forEach((st: any) => {
            flatRows.push([
              String(idx++),
              grp.guardianPhone || st.guardianPhone || '',
              grp.guardianName || st.guardianName || '',
              `${st.firstName || ''} ${st.lastName || ''}`.trim(),
              st.admissionNo || '',
              st.course || '',
              st.semester || '',
            ]);
          });
        });
        return {
          headers: [
            '#',
            'Guardian Phone',
            'Guardian Name',
            'Student Name',
            'Admission No',
            'Course',
            'Semester',
          ],
          rows: flatRows,
        };
      }
      case 'student-login-credential':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Course',
            'Username',
            'Email',
            'Mobile Number',
            'Status',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            s.course || '',
            s.admissionNo || '',
            s.email || '-',
            s.mobileNumber || '-',
            s.status || 'Active',
          ]),
        };
      case 'custom-field-report':
        return {
          headers: [
            '#',
            'Admission No',
            'Student Name',
            'Blood Group',
            'House',
            'Religion',
            'Caste',
            'Hostel',
            'Transport Route',
          ],
          rows: filteredStudents.map((s, i) => [
            String(i + 1),
            s.admissionNo || '',
            `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            s.bloodGroup || '-',
            s.house || '-',
            s.religion || '-',
            s.caste || '-',
            s.hostelName || '-',
            s.transportRoute || '-',
          ]),
        };
      case 'student-strength-report': {
        const list = reportSummary?.courseStrength || [];
        return {
          headers: ['#', 'Course', 'Semester', 'Male', 'Female', 'Active', 'Inactive', 'Total Strength'],
          rows: list.map((r: any, i: number) => [
            String(i + 1),
            r.course,
            r.semester,
            String(r.male),
            String(r.female),
            String(r.active),
            String(r.disabled),
            String(r.total),
          ]),
        };
      }
      case 'batch-wise-strength-report': {
        const list = reportSummary?.batchStrength || [];
        return {
          headers: ['#', 'Batch Name', 'Start Date', 'End Date', 'Male', 'Female', 'Active', 'Inactive', 'Total'],
          rows: list.map((r: any, i: number) => {
            const meta = batches.find((b) => b.name === r.batch);
            return [
              String(i + 1),
              r.batch,
              meta?.startDate || '-',
              meta?.endDate || '-',
              String(r.male),
              String(r.female),
              String(r.active),
              String(r.disabled),
              String(r.total),
            ];
          }),
        };
      }
      case 'admission-inactive-counter': {
        const list = reportSummary?.admissionInactiveCounter || [];
        return {
          headers: ['#', 'Course', 'Total Admitted', 'Active Students', 'Inactive Students', 'Active %'],
          rows: list.map((r: any, i: number) => [
            String(i + 1),
            r.course,
            String(r.totalAdmitted),
            String(r.activeCount),
            String(r.inactiveCount),
            r.totalAdmitted > 0 ? `${Math.round((r.activeCount / r.totalAdmitted) * 100)}%` : '0%',
          ]),
        };
      }
      default:
        return { headers: [], rows: [] };
    }
  };

  const handleDownloadCsv = () => {
    const { headers, rows } = getExportTable();
    if (rows.length === 0) {
      showToast('error', 'No rows to export.');
      return;
    }
    const escape = (v: string) =>
      v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport || 'student-report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV report downloaded.');
  };

  const handleCopy = async () => {
    const { headers, rows } = getExportTable();
    const text = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Report table copied to clipboard.');
    } catch {
      showToast('error', 'Failed to copy to clipboard.');
    }
  };

  const { headers: tableHeaders, rows: tableRows } = activeReport
    ? getExportTable()
    : { headers: [], rows: [] };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {/* Toast Notification */}
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
        {/* Top Page Header & Breadcrumb (exact match to screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">
              {activeCard ? activeCard.title : 'Student Report'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('student-details')}
              className="inline-flex items-center gap-1 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              Students
            </button>
            <span className="text-gray-400">/</span>
            {activeCard ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="text-[#80229a] hover:underline font-medium cursor-pointer"
                >
                  Student Report
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{activeCard.subtitle}</span>
              </>
            ) : (
              <span className="text-gray-600">Student Report</span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* HUB VIEW: 3-COLUMN GRID OF 11 REPORT CARDS                     */}
        {/* ============================================================== */}
        {!activeReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPORT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleOpenReport(card)}
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

        {/* ============================================================== */}
        {/* REPORT DETAIL VIEW                                             */}
        {/* ============================================================== */}
        {activeReport && (
          <div className="space-y-5">
            {/* Back & Criteria Bar */}
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
                  <ArrowLeft className="w-3.5 h-3.5" /> All Student Reports
                </button>
              </div>

              {activeReport !== 'student-strength-report' &&
                activeReport !== 'batch-wise-strength-report' &&
                activeReport !== 'admission-inactive-counter' &&
                activeReport !== 'siblings-report' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
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
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
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
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Search Keyword
                      </label>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Admission No, Name, Mobile..."
                        className="w-full h-9 px-3 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#80229a]"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => loadReportData(activeReport, selectedCourse, selectedSemester)}
                        className="h-9 px-4 bg-[#80229a] hover:bg-[#6a1b82] text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" /> Search
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-bold text-gray-800">
                  {activeCard?.title}{' '}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    ({tableRows.length} record{tableRows.length === 1 ? '' : 's'})
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
                  Loading report data...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        {tableHeaders.map((h) => (
                          <th key={h} className="px-4 py-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={Math.max(tableHeaders.length, 1)}
                            className="px-4 py-10 text-center text-gray-500"
                          >
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        tableRows.map((row, rIdx) => (
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
