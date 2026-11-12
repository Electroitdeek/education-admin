'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  ChevronRight,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Filter,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SUMMARY_ENDPOINT = `${API}/fees-collection/fees-reports/summary`;
const DATA_ENDPOINT = `${API}/fees-collection/fees-reports/data`;

export interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  color: string;
  iconType: string;
}

export interface ReportRow {
  receiptNo: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  course: string;
  semester: string;
  feesGroup?: string;
  feesType?: string;
  totalFee: number;
  paidAmount: number;
  balanceDue: number;
  discount: number;
  paymentMode: string;
  date: string;
  collectedBy?: string;
  status: string;
}

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
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

const PAYMENT_MODES = ['All', 'Online/UPI', 'Cash', 'Cheque', 'Bank Transfer'];

// The 14 Report Cards matching Screenshot media_1793692032341_08d35997.jpg Exactly
const REPORT_CARDS: ReportItem[] = [
  {
    id: 'statement',
    title: 'FEES STATEMENT',
    subtitle: 'Fees Statement',
    type: 'statement',
    color: 'from-amber-400 to-amber-500',
    iconType: 'statement',
  },
  {
    id: 'due_fees',
    title: 'SEARCH DUE FEES',
    subtitle: 'Search Due Fees',
    type: 'due_fees',
    color: 'from-cyan-500 to-blue-600',
    iconType: 'due',
  },
  {
    id: 'group_assigned',
    title: 'FEE GROUP ASSIGNED REPORT',
    subtitle: 'Fee Group Assigned Report',
    type: 'group_assigned',
    color: 'from-emerald-500 to-teal-600',
    iconType: 'chart_line',
  },
  {
    id: 'balance_fees',
    title: 'BALANCE FEES REPORT',
    subtitle: 'Balance Fees Report',
    type: 'balance_fees',
    color: 'from-teal-400 to-emerald-500',
    iconType: 'invoice',
  },
  {
    id: 'current_balance',
    title: 'CURRENT BALANCE REPORT',
    subtitle: 'Current Balance Report',
    type: 'current_balance',
    color: 'from-blue-500 to-indigo-600',
    iconType: 'calc_chart',
  },
  {
    id: 'outstanding',
    title: 'OUTSTANDING',
    subtitle: 'Outstanding',
    type: 'outstanding',
    color: 'from-amber-500 to-yellow-600',
    iconType: 'podium',
  },
  {
    id: 'dcr',
    title: 'DCR',
    subtitle: 'DCR',
    type: 'dcr',
    color: 'from-indigo-500 to-purple-600',
    iconType: 'bars',
  },
  {
    id: 'discount',
    title: 'DISCOUNT REPORT',
    subtitle: 'Discount Report',
    type: 'discount',
    color: 'from-amber-400 to-orange-500',
    iconType: 'pie_percent',
  },
  {
    id: 'type_assigned',
    title: 'FEE TYPE ASSIGNED REPORT',
    subtitle: 'Fee Type Assigned Report',
    type: 'type_assigned',
    color: 'from-purple-500 to-indigo-600',
    iconType: 'chart_line',
  },
  {
    id: 'paid_student',
    title: 'PAID FEES REPORT',
    subtitle: 'Student Wise',
    type: 'paid_student',
    color: 'from-cyan-400 to-teal-500',
    iconType: 'invoice',
  },
  {
    id: 'paid_date',
    title: 'PAID FEES REPORT',
    subtitle: 'Date Wise',
    type: 'paid_date',
    color: 'from-teal-500 to-emerald-600',
    iconType: 'invoice_calendar',
  },
  {
    id: 'online_transaction',
    title: 'ONLINE TRANSACTION',
    subtitle: 'Online Transaction List',
    type: 'online_transaction',
    color: 'from-amber-400 to-yellow-500',
    iconType: 'statement',
  },
  {
    id: 'assigned_paid',
    title: 'ASSIGNED PAID FEES REPORT',
    subtitle: 'Assigned Paid Fees Report',
    type: 'assigned_paid',
    color: 'from-amber-500 to-orange-600',
    iconType: 'statement',
  },
  {
    id: 'mode_wise',
    title: 'MODE WISE REPORT',
    subtitle: 'Mode Wise Report',
    type: 'mode_wise',
    color: 'from-amber-400 to-yellow-500',
    iconType: 'pie_percent',
  },
];

// Rich SVG Illustrations matching the icons in the screenshot
const StatementIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="8" y="6" width="26" height="34" rx="3" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
    <line x1="14" y1="14" x2="26" y2="14" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="20" x2="24" y2="20" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="26" x2="20" y2="26" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <circle cx="34" cy="32" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
    <text x="34" y="36" textAnchor="middle" fill="#78350F" fontSize="12" fontWeight="bold">₹</text>
    <path d="M6 14L10 6L14 14H6Z" fill="#10B981" />
  </svg>
);

const SearchDueIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="6" y="10" width="24" height="28" rx="3" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
    <line x1="12" y1="18" x2="22" y2="18" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="24" x2="20" y2="24" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="24" r="9" fill="#FFFFFF" stroke="#0891B2" strokeWidth="2.5" />
    <line x1="38" y1="30" x2="44" y2="36" stroke="#0891B2" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="24" r="4" fill="#67E8F9" />
  </svg>
);

const ChartLineIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="6" y="8" width="36" height="32" rx="4" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5" />
    <rect x="11" y="24" width="4" height="12" rx="1" fill="#F87171" />
    <rect x="18" y="18" width="4" height="18" rx="1" fill="#60A5FA" />
    <rect x="25" y="22" width="4" height="14" rx="1" fill="#34D399" />
    <rect x="32" y="14" width="4" height="22" rx="1" fill="#A78BFA" />
    <path d="M12 20L19 14L26 17L34 10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InvoiceIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="10" y="6" width="28" height="36" rx="3" fill="#F0FDFA" stroke="#14B8A6" strokeWidth="2" />
    <line x1="16" y1="14" x2="32" y2="14" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="20" x2="28" y2="20" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="26" x2="30" y2="26" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" />
    <text x="24" y="36" textAnchor="middle" fill="#0D9488" fontSize="11" fontWeight="bold">₹</text>
  </svg>
);

const CalcChartIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="6" y="8" width="22" height="30" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
    <rect x="10" y="12" width="14" height="6" rx="1" fill="#BFDBFE" />
    <circle cx="12" cy="23" r="1.5" fill="#3B82F6" />
    <circle cx="17" cy="23" r="1.5" fill="#3B82F6" />
    <circle cx="22" cy="23" r="1.5" fill="#3B82F6" />
    <circle cx="12" cy="28" r="1.5" fill="#3B82F6" />
    <circle cx="17" cy="28" r="1.5" fill="#3B82F6" />
    <circle cx="22" cy="28" r="1.5" fill="#3B82F6" />
    <rect x="26" y="18" width="16" height="20" rx="3" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
    <rect x="29" y="26" width="3" height="9" fill="#60A5FA" />
    <rect x="34" y="22" width="3" height="13" fill="#34D399" />
    <rect x="39" y="29" width="3" height="6" fill="#F87171" />
  </svg>
);

const PodiumIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="18" y="14" width="12" height="24" rx="2" fill="#F59E0B" />
    <rect x="8" y="22" width="10" height="16" rx="2" fill="#94A3B8" />
    <rect x="30" y="26" width="10" height="12" rx="2" fill="#B45309" />
    <polygon points="24,6 26,10 30,11 27,14 28,18 24,16 20,18 21,14 18,11 22,10" fill="#FBBF24" />
    <line x1="6" y1="38" x2="42" y2="38" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const BarsIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <rect x="8" y="26" width="6" height="14" rx="2" fill="#06B6D4" />
    <rect x="17" y="16" width="6" height="24" rx="2" fill="#3B82F6" />
    <rect x="26" y="10" width="6" height="30" rx="2" fill="#10B981" />
    <rect x="35" y="20" width="6" height="20" rx="2" fill="#F59E0B" />
    <line x1="6" y1="40" x2="44" y2="40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PiePercentIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
    <circle cx="24" cy="24" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
    <path d="M24 8A16 16 0 0 1 40 24H24V8Z" fill="#F59E0B" />
    <path d="M24 24L35 35A16 16 0 0 1 12 30L24 24Z" fill="#3B82F6" />
    <rect x="28" y="28" width="16" height="14" rx="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    <text x="36" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">%</text>
  </svg>
);

export default function FeesReportsView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Active Report (null = Hub Grid, string = Active Table View)
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);

  // Filter State for Active Report
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [mode, setMode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Report Data
  const [reportData, setReportData] = useState<{
    rowCount: number;
    totalCollected: number;
    totalDue: number;
    totalDiscount: number;
    rows: ReportRow[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<any>(null);

  // Table pagination & sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const pageSize = 10;

  // Fetch Hub Summary Metrics
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(SUMMARY_ENDPOINT);
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load summary stats', err);
      }
    };
    fetchSummary();
  }, []);

  // Fetch Report Data when Active Report or Filters change
  const fetchReportData = useCallback(async () => {
    if (!activeReport) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('reportType', activeReport.type);
      if (course && course !== 'Select Course') params.append('course', course);
      if (semester && semester !== 'Select Semester') params.append('semester', semester);
      if (mode && mode !== 'All') params.append('mode', mode);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${DATA_ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  }, [activeReport, course, semester, mode, searchQuery]);

  useEffect(() => {
    if (activeReport) {
      fetchReportData();
    }
  }, [activeReport, fetchReportData]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!reportData || reportData.rows.length === 0) return;
    const headers = [
      '#',
      'Receipt No',
      'Student Name',
      'Admission No',
      'Course',
      'Semester',
      'Fee Type',
      'Total Fee (₹)',
      'Paid (₹)',
      'Balance (₹)',
      'Discount (₹)',
      'Mode',
      'Date',
      'Status',
    ];
    const csvRows = reportData.rows.map((r, i) => [
      i + 1,
      `"${r.receiptNo}"`,
      `"${r.studentName}"`,
      `"${r.admissionNo}"`,
      `"${r.course}"`,
      `"${r.semester}"`,
      `"${r.feesType || ''}"`,
      r.totalFee,
      r.paidAmount,
      r.balanceDue,
      r.discount,
      `"${r.paymentMode}"`,
      `"${r.date}"`,
      `"${r.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeReport?.type || 'report'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!reportData || reportData.rows.length === 0) return;
    const text = reportData.rows
      .map(
        (r, i) =>
          `${i + 1}. [${r.receiptNo}] ${r.studentName} (${r.admissionNo}) - Paid: ₹${r.paidAmount} | Due: ₹${r.balanceDue} (${r.paymentMode})`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Report copied to clipboard!');
  };

  // Render Card Icon Helper
  const renderCardIcon = (iconType: string) => {
    switch (iconType) {
      case 'statement':
        return <StatementIcon />;
      case 'due':
        return <SearchDueIcon />;
      case 'chart_line':
        return <ChartLineIcon />;
      case 'invoice':
      case 'invoice_calendar':
        return <InvoiceIcon />;
      case 'calc_chart':
        return <CalcChartIcon />;
      case 'podium':
        return <PodiumIcon />;
      case 'bars':
        return <BarsIcon />;
      case 'pie_percent':
        return <PiePercentIcon />;
      default:
        return <StatementIcon />;
    }
  };

  const rows = reportData?.rows || [];
  const totalPages = Math.ceil(rows.length / pageSize) || 1;
  const paginated = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header matching reference screenshot: 📈 Fees Reports & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Document with pulse / chart icon */}
          <div className="text-slate-800">
            <svg
              className="h-5 w-5 fill-slate-800"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fees Reports</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Fees Reports */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          {activeReport ? (
            <>
              <button
                onClick={() => setActiveReport(null)}
                className="hover:text-[#80229a] transition cursor-pointer"
              >
                Fees Reports
              </button>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-[#80229a] font-semibold">{activeReport.subtitle}</span>
            </>
          ) : (
            <span className="text-[#80229a] font-semibold">Fees Reports</span>
          )}
        </div>
      </div>

      {/* VIEW 1: THE 14 REPORT CARDS PORTAL (Matches Screenshot Exactly) */}
      {!activeReport && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {/* 3-Column Grid of 14 Report Cards matching Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPORT_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  setActiveReport(card);
                  setCurrentPage(1);
                }}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-150 cursor-pointer flex items-center gap-4 group"
              >
                {/* Illustration Icon */}
                <div className="p-2 bg-slate-50/80 rounded-xl group-hover:scale-105 transition transform">
                  {renderCardIcon(card.iconType)}
                </div>

                {/* Report Titles matching screenshot */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#80229a] tracking-wider uppercase group-hover:text-[#68167f] transition">
                    {card.title}
                  </span>
                  <span className="text-xs font-medium text-slate-600 mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregate Overview Bar at bottom of Hub */}
          {summary && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Collected</div>
                <div className="text-lg font-bold text-[#80229a] mt-0.5">
                  ₹{summary.totalCollected.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Dues</div>
                <div className="text-lg font-bold text-rose-600 mt-0.5">
                  ₹{summary.totalDue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Today&apos;s Collection</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">
                  ₹{summary.todayCollection.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Advance Deposits</div>
                <div className="text-lg font-bold text-blue-700 mt-0.5">
                  ₹{summary.totalAdvanceBalance.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INDIVIDUAL ACTIVE REPORT VIEWER */}
      {activeReport && (
        <div className="space-y-5 animate-scale-up">
          {/* Back button & Report Title Bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveReport(null)}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All Reports</span>
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-800">{activeReport.subtitle}</h2>
                <p className="text-[11px] text-slate-400">
                  Comprehensive audit and accounting records for {activeReport.title}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            {reportData && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-3 py-1 rounded-full">
                  Total Collected: ₹{reportData.totalCollected.toLocaleString('en-IN')}
                </span>
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                  Total Due: ₹{reportData.totalDue.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Select Criteria Filter Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Search className="h-4 w-4 text-[#80229a]" />
              <h3 className="text-sm font-bold text-slate-700 tracking-wide">Select Criteria</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchReportData();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Course
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                  >
                    <option value="">Select Course</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Report Records ({rows.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Export Buttons */}
                <div className="flex items-center bg-[#80229a] text-white rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={handleCopy}
                    title="Copy Table"
                    className="p-1.5 hover:bg-white/20 rounded transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    title="Export CSV"
                    className="p-1.5 hover:bg-white/20 rounded transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    title="Print Table"
                    className="p-1.5 hover:bg-white/20 rounded transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Search:</span>
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-52"
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">RECEIPT NO</th>
                    <th className="py-3 px-3">STUDENT NAME</th>
                    <th className="py-3 px-3">ADMISSION NO</th>
                    <th className="py-3 px-3">COURSE & SEM</th>
                    <th className="py-3 px-3">TOTAL FEE</th>
                    <th className="py-3 px-3">PAID (₹)</th>
                    <th className="py-3 px-3">DUE (₹)</th>
                    <th className="py-3 px-3">MODE</th>
                    <th className="py-3 px-3">DATE</th>
                    <th className="py-3 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                        <div>Generating report...</div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                        No records match the report criteria.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-3 text-center text-slate-400 font-semibold">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {r.receiptNo}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#80229a]">
                          {r.studentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {r.admissionNo}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            {r.course} • {r.semester}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          ₹{r.totalFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          ₹{r.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-bold text-rose-600">
                          ₹{r.balanceDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-purple-50 text-[#80229a] px-2 py-0.5 rounded text-[10px] font-semibold">
                            {r.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {r.date}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div>
                Showing {rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, rows.length)} of {rows.length} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition font-medium"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded font-semibold text-xs transition ${
                      currentPage === i + 1
                        ? 'bg-[#80229a] text-white shadow-sm'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer matching screenshot */}
      <div className="text-center pt-8 pb-4 text-xs text-white/90 drop-shadow-sm font-medium">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </div>
    </div>
  );
}

