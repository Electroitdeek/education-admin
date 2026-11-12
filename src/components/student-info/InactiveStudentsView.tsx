'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Accessibility,
  Search,
  List,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns,
  Check,
  RefreshCw,
  UserCheck,
  Eye,
  ArrowUpDown,
  X,
  Phone,
  Mail,
  GraduationCap,
  CreditCard,
  Building,
} from 'lucide-react';
import { StudentItem } from './StudentDetailsView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/student-info/students`;

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

const DISABLED_STATUSES = [
  'Medical Leave',
  'Semester Break',
  'Suspended',
  'Dropped Out',
  'Fees Default',
  'Transfer / Migrated',
  'Other',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function InactiveStudentsView({ onNavigate }: Props) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Criteria Filters matching screenshot (media_1793862187031_4968ac69.jpg)
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [disabledStatus, setDisabledStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Table Search
  const [tableSearch, setTableSearch] = useState('');

  // Column Visibility
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    admissionNo: true,
    studentName: true,
    biometricId: true,
    rollNo: true,
    dateOfBirth: true,
    mobileNumber: true,
    fatherName: true,
    gender: true,
    disabledReason: true,
    action: true,
  });

  // Pagination (10 per page default matching ERP)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Disabled Students
  const fetchDisabledStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', 'Disabled');
      if (selectedCourse && selectedCourse !== 'Select Course') params.append('course', selectedCourse);
      if (selectedSemester && selectedSemester !== 'Select Semester') params.append('semester', selectedSemester);
      if (searchKeyword.trim()) params.append('search', searchKeyword.trim());

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let items: StudentItem[] = data.items || [];
        if (disabledStatus && disabledStatus !== 'Select') {
          items = items.filter((s) =>
            s.disableReason?.toLowerCase().includes(disabledStatus.toLowerCase())
          );
        }
        setStudents(items);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load inactive students', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, disabledStatus, searchKeyword]);

  useEffect(() => {
    fetchDisabledStudents();
  }, []);

  // Restore Student to Active Status
  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to re-activate student ${name}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active', disableReason: '' }),
      });
      if (res.ok) {
        showToast('success', `Student ${name} has been restored to Active status!`);
        fetchDisabledStudents();
      } else {
        showToast('error', 'Failed to re-activate student');
      }
    } catch (err) {
      showToast('error', 'Network error');
    }
  };

  // Filtered by in-table search
  const filteredStudents = useMemo(() => {
    let result = students;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.admissionNo?.toLowerCase().includes(q) ||
          s.rollNo?.toLowerCase().includes(q) ||
          `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(q) ||
          s.fatherName?.toLowerCase().includes(q) ||
          s.course?.toLowerCase().includes(q) ||
          s.mobileNumber?.includes(q) ||
          s.disableReason?.toLowerCase().includes(q)
      );
    }
    if (!sortAsc) {
      result = [...result].reverse();
    }
    return result;
  }, [students, tableSearch, sortAsc]);

  // Paginated students
  const totalEntries = filteredStudents.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Exports
  const handleCopy = () => {
    if (!filteredStudents.length) return;
    const header = 'ADMISSION NO\tSTUDENT NAME\tBIOMETRIC ID\tROLL NO\tDOB\tMOBILE\tFATHER NAME\tGENDER\tDISABLED REASON\n';
    const body = filteredStudents
      .map(
        (s) =>
          `${s.admissionNo}\t${s.firstName} ${s.lastName || ''}\t${(s as any).biometricId || '-'}\t${s.rollNo || '-'}\t${s.dateOfBirth}\t${s.mobileNumber}\t${s.fatherName || '-'}\t${s.gender}\t${s.disableReason || 'Inactive'}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const header = 'Admission No,Student Name,Biometric ID,Roll No,DOB,Mobile,Father Name,Gender,Disabled Reason\n';
    const body = filteredStudents
      .map(
        (s) =>
          `"${s.admissionNo}","${s.firstName} ${s.lastName || ''}","${(s as any).biometricId || ''}","${s.rollNo || ''}","${s.dateOfBirth}","${s.mobileNumber}","${s.fatherName || ''}","${s.gender}","${s.disableReason || 'Inactive'}"`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inactive_Students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium text-xs transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB (EXACT ERP LAYOUT)                  */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-800">
            <Accessibility className="w-6 h-6 text-slate-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Inactive Students</h1>
        </div>

        {/* Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            onClick={() => onNavigate?.('student-admission')}
            className="hover:text-[#80229a] cursor-pointer"
          >
            Student info
          </span>
          <span>/</span>
          <span className="text-[#80229a] font-semibold">Inactive Students</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SELECT CRITERIA CARD (4 FILTER INPUTS + SEARCH BUTTON)       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
        {/* Card Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Search className="w-4 h-4 text-purple-700 font-bold" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">Select Criteria</h2>
        </div>

        {/* Card Body: 4 inputs across the grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {/* 1. Course */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
              >
                <option value="">Select Course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Semester */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Student Disabled Status */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Student Disabled Status
              </label>
              <select
                value={disabledStatus}
                onChange={(e) => setDisabledStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
              >
                <option value="">Select</option>
                {DISABLED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Search by Keyword */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Search by Keyword
              </label>
              <input
                type="text"
                placeholder="Search by Admission no , St"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDisabledStudents()}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={fetchDisabledStudents}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. INACTIVE STUDENTS LIST TABLE                                */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
        {/* Card Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <List className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">Inactive Students List</h2>
        </div>

        {/* Toolbar: Export Icons + Column Visibility + Page Size + Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Left Export & Columns */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
              title="Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
              title="Export Document"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Column Visibility Menu */}
            <div className="relative">
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Column visibility ▾</span>
              </button>
              {showColMenu && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 space-y-1 text-xs">
                  {Object.entries(visibleColumns).map(([col, val]) => (
                    <label key={col} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() =>
                          setVisibleColumns({ ...visibleColumns, [col]: !val })
                        }
                        className="rounded text-[#80229a] focus:ring-purple-200"
                      />
                      <span>{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Tools: Page size & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <label>Search:</label>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                {visibleColumns.admissionNo && (
                  <th
                    className="py-3 px-3 cursor-pointer select-none"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    <div className="flex items-center gap-1">
                      <span>ADMISSION NO</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.studentName && (
                  <th className="py-3 px-3">STUDENT NAME</th>
                )}
                {visibleColumns.biometricId && (
                  <th className="py-3 px-3">BIOMETRIC ID</th>
                )}
                {visibleColumns.rollNo && (
                  <th className="py-3 px-3">ROLL NO</th>
                )}
                {visibleColumns.dateOfBirth && (
                  <th className="py-3 px-3">DATE OF BIRTH</th>
                )}
                {visibleColumns.mobileNumber && (
                  <th className="py-3 px-3">MOBILE NUMBER</th>
                )}
                {visibleColumns.fatherName && (
                  <th className="py-3 px-3">FATHER NAME</th>
                )}
                {visibleColumns.gender && (
                  <th className="py-3 px-3">GENDER</th>
                )}
                {visibleColumns.disabledReason && (
                  <th className="py-3 px-3">DISABLED REASON</th>
                )}
                {visibleColumns.action && (
                  <th className="py-3 px-3 text-center">ACTION</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                      <span>Loading inactive students...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    {visibleColumns.admissionNo && (
                      <td className="py-3 px-3 font-mono font-semibold text-[#80229a]">
                        {s.admissionNo}
                      </td>
                    )}
                    {visibleColumns.studentName && (
                      <td className="py-3 px-3">
                        <span
                          className="font-medium text-slate-800 hover:text-[#80229a] cursor-pointer"
                          onClick={() => setSelectedStudent(s)}
                        >
                          {s.firstName} {s.lastName || ''}
                        </span>
                      </td>
                    )}
                    {visibleColumns.biometricId && (
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {(s as any).biometricId || '-'}
                      </td>
                    )}
                    {visibleColumns.rollNo && (
                      <td className="py-3 px-3 text-slate-600">
                        {s.rollNo || '-'}
                      </td>
                    )}
                    {visibleColumns.dateOfBirth && (
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {s.dateOfBirth}
                      </td>
                    )}
                    {visibleColumns.mobileNumber && (
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {s.mobileNumber}
                      </td>
                    )}
                    {visibleColumns.fatherName && (
                      <td className="py-3 px-3 text-slate-600">
                        {s.fatherName || '-'}
                      </td>
                    )}
                    {visibleColumns.gender && (
                      <td className="py-3 px-3 text-slate-600">
                        {s.gender}
                      </td>
                    )}
                    {visibleColumns.disabledReason && (
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {s.disableReason || 'Inactive / Medical Leave'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                            title="View Full Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleRestore(s._id, `${s.firstName} ${s.lastName || ''}`)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition cursor-pointer shadow-xs"
                            title="Re-activate Student"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Re-activate</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <div>
            Showing {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-[#80229a] text-white font-bold'
                    : 'border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. FOOTER (EXACT COPYRIGHT NOTICE FROM SCREENSHOT)            */}
      {/* ============================================================== */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </footer>

      {/* ============================================================== */}
      {/* 5. STUDENT PROFILE DOSSIER MODAL                              */}
      {/* ============================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-xs">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-900 to-[#80229a] text-white flex items-start justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold uppercase shadow-inner">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName?.[0] || ''}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedStudent.firstName} {selectedStudent.lastName || ''}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-purple-200 text-xs">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded">
                      Adm No: {selectedStudent.admissionNo}
                    </span>
                    <span>•</span>
                    <span>{selectedStudent.course}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-700 block mb-0.5">
                  Disability / Inactive Reason
                </span>
                <span className="font-semibold text-rose-900 text-xs">
                  {selectedStudent.disableReason || 'Admin Action / Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll No</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.rollNo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Semester</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.semester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-semibold text-slate-700">{selectedStudent.bloodGroup || '-'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">Father / Guardian</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.fatherName || '-'} ({selectedStudent.fatherOccupation || 'Guardian'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Mobile Number</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedStudent.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Address</span>
                  <span className="text-slate-700">{selectedStudent.currentAddress || selectedStudent.permanentAddress || 'Campus Quarters'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  handleRestore(s._id, `${s.firstName} ${s.lastName || ''}`);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Re-activate Student</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
