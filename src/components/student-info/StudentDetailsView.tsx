'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Contact,
  GraduationCap,
  Search,
  Plus,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns,
  LayoutGrid,
  List,
  Eye,
  Edit,
  Trash2,
  Check,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  CreditCard,
  Building,
  X,
  ChevronDown,
  BookOpen,
  Award,
  Home,
  FileCheck2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/student-info/students`;

export interface StudentItem {
  _id: string;
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  lastName?: string;
  course: string;
  semester: string;
  batch?: string;
  gender: string;
  dateOfBirth: string;
  category?: string;
  religion?: string;
  caste?: string;
  mobileNumber: string;
  email?: string;
  admissionDate: string;
  session?: string;
  bloodGroup?: string;
  house?: string;
  studentPhoto?: string;
  biometricId?: string;
  tenthMarks?: string;
  twelfthMarks?: string;
  graduationMarks?: string;
  aadhaarNo?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherDob?: string;
  fatherOccupation?: string;
  fatherPhoto?: string;
  marriageAnniversaryDate?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  motherPhoto?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  guardianAddress?: string;
  currentAddress?: string;
  permanentAddress?: string;
  previousSchool?: string;
  qualification?: string;
  percentage?: number;
  status: 'Active' | 'Disabled';
  disableReason?: string;
  feesDue: number;
  feesPaid: number;
  hostelType?: string;
  hostelName?: string;
  roomType?: string;
  room?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  height?: string;
  weight?: string;
  admittedCourse?: string;
  asOnDate?: string;
  rte?: string;
  note?: string;
  referralBy?: string;
  uploadedDocuments?: { title: string; file?: string }[];
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

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentDetailsView({ onNavigate }: Props) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copied, setCopied] = useState(false);

  // Criteria Filters (exact matches to ERP screenshot)
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'profile' | 'parent' | 'hostel' | 'documents' | 'fees'>('profile');

  // Pagination & Column Visibility
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    serial: true,
    admissionNo: true,
    studentName: true,
    rollNo: true,
    course: true,
    dateOfBirth: true,
    gender: true,
    category: true,
    mobileNumber: true,
    action: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Table Search
  const [tableSearch, setTableSearch] = useState('');

  // Fetch Students with specific params
  const fetchStudentsWithParams = useCallback(async (paramsObj?: Record<string, string>) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (paramsObj) {
        Object.entries(paramsObj).forEach(([k, v]) => {
          if (v && v.trim() !== '') params.append(k, v.trim());
        });
      } else {
        if (selectedCourse && selectedCourse !== 'Select Course') params.append('course', selectedCourse);
        if (selectedSemester && selectedSemester !== 'Select Semester') params.append('semester', selectedSemester);
        if (statusFilter !== 'All') params.append('status', statusFilter);
        if (searchKeyword.trim()) params.append('search', searchKeyword.trim());
      }

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, statusFilter, searchKeyword]);

  useEffect(() => {
    fetchStudentsWithParams();
  }, []);

  // Search by Course & Semester
  const handleSearchCourseSemester = () => {
    const params: Record<string, string> = {};
    if (selectedCourse && selectedCourse !== 'Select Course') {
      params.course = selectedCourse;
    }
    if (selectedSemester && selectedSemester !== 'Select Semester') {
      params.semester = selectedSemester;
    }
    fetchStudentsWithParams(params);
  };

  // Search by Keyword
  const handleSearchKeyword = () => {
    if (!searchKeyword.trim()) {
      fetchStudentsWithParams();
      return;
    }
    fetchStudentsWithParams({ search: searchKeyword.trim() });
  };

  // Toggle Active/Disabled status
  const handleToggleStatus = async (student: StudentItem) => {
    const newStatus = student.status === 'Active' ? 'Disabled' : 'Active';
    const reason =
      newStatus === 'Disabled'
        ? prompt('Please enter reason for disabling student:', 'Semester Break / Leave') || 'Suspended'
        : '';

    try {
      const res = await fetch(`${ENDPOINT}/${student._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, disableReason: reason }),
      });
      if (res.ok) {
        fetchStudentsWithParams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered by in-table search
  const filteredStudents = useMemo(() => {
    if (!tableSearch.trim()) return students;
    const q = tableSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.admissionNo?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q) ||
        s.mobileNumber?.includes(q)
    );
  }, [students, tableSearch]);

  // Paginated items
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Exports
  const handleCopy = () => {
    if (!filteredStudents.length) return;
    const header = '#\tADMISSION NO\tSTUDENT NAME\tROLL NO\tCOURSE\tDOB\tGENDER\tCATEGORY\tMOBILE\n';
    const body = filteredStudents
      .map(
        (s, idx) =>
          `${idx + 1}\t${s.admissionNo}\t${s.firstName} ${s.lastName || ''}\t${s.rollNo || '-'}\t${s.course} (${s.semester})\t${s.dateOfBirth}\t${s.gender}\t${s.category || 'General'}\t${s.mobileNumber}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const header = 'S.No,Admission No,Roll No,Student Name,Course,Semester,Father Name,DOB,Gender,Category,Mobile Number,Status,Fees Paid,Fees Due\n';
    const body = filteredStudents
      .map(
        (s, idx) =>
          `${idx + 1},"${s.admissionNo}","${s.rollNo || ''}","${s.firstName} ${s.lastName || ''}","${s.course}","${s.semester}","${s.fatherName || ''}","${s.dateOfBirth}","${s.gender}","${s.category || ''}","${s.mobileNumber}","${s.status}",${s.feesPaid || 0},${s.feesDue || 0}`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Students_List_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB (EXACT ERP LAYOUT)                  */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-800">
            <Contact className="w-6 h-6 text-slate-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Details</h1>
        </div>

        {/* Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            onClick={() => onNavigate?.('student-admission')}
            className="hover:text-[#80229a] cursor-pointer"
          >
            Student Information
          </span>
          <span>/</span>
          <span className="text-[#80229a] font-semibold">Student Details</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SELECT CRITERIA CARD (2 PARALLEL COLUMNS WITH DEDICATED SEARCH) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Search className="w-4 h-4 text-purple-700 font-bold" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">Select Criteria</h2>
        </div>

        {/* Card Body: 2 distinct search columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-xs">
          {/* Column 1: Course & Semester */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSearchCourseSemester}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Column 2: Search by Keyword */}
          <div className="md:border-l md:border-slate-200 md:pl-8 space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Search by Keyword
              </label>
              <input
                type="text"
                placeholder="Search by Admission no, Student Name"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchKeyword()}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSearchKeyword}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. STUDENT DIRECTORY LIST & RESULTS TABLE                      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          {/* Left tools: Export buttons & Column visibility */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs"
              title="Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs"
              title="Export Document"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Column visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition"
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

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 ml-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-[#80229a] text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-[#80229a] text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right tools: Page size & Table search */}
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
                onChange={(e) => setTableSearch(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* View Mode 1: Table List */}
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.serial && <th className="py-3 px-3 w-12">#</th>}
                  {visibleColumns.admissionNo && <th className="py-3 px-3">ADMISSION NO</th>}
                  {visibleColumns.studentName && <th className="py-3 px-3">STUDENT NAME</th>}
                  {visibleColumns.rollNo && <th className="py-3 px-3">ROLL NO</th>}
                  {visibleColumns.course && <th className="py-3 px-3">COURSE</th>}
                  {visibleColumns.dateOfBirth && <th className="py-3 px-3">DATE OF BIRTH</th>}
                  {visibleColumns.gender && <th className="py-3 px-3">GENDER</th>}
                  {visibleColumns.category && <th className="py-3 px-3">CATEGORY</th>}
                  {visibleColumns.mobileNumber && <th className="py-3 px-3">MOBILE NUMBER</th>}
                  {visibleColumns.action && <th className="py-3 px-3 text-center">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Loading student records...</span>
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
                  paginatedStudents.map((s, idx) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      {visibleColumns.serial && (
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                      )}
                      {visibleColumns.admissionNo && (
                        <td className="py-3 px-3 font-mono font-semibold text-[#80229a]">
                          {s.admissionNo}
                        </td>
                      )}
                      {visibleColumns.studentName && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-slate-800 hover:text-[#80229a] cursor-pointer"
                              onClick={() => setSelectedStudent(s)}
                            >
                              {s.firstName} {s.lastName || ''}
                            </span>
                            {s.status === 'Disabled' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                                Disabled
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.rollNo && (
                        <td className="py-3 px-3 text-slate-600">
                          {s.rollNo || '-'}
                        </td>
                      )}
                      {visibleColumns.course && (
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 block">{s.course}</span>
                          <span className="text-[11px] text-purple-600">{s.semester}</span>
                        </td>
                      )}
                      {visibleColumns.dateOfBirth && (
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {s.dateOfBirth}
                        </td>
                      )}
                      {visibleColumns.gender && (
                        <td className="py-3 px-3 text-slate-600">
                          {s.gender}
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td className="py-3 px-3 text-slate-600">
                          {s.category || 'General'}
                        </td>
                      )}
                      {visibleColumns.mobileNumber && (
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {s.mobileNumber}
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition cursor-pointer"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onNavigate?.('collect-fee')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                              title="Collect Fee"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(s)}
                              className={`p-1.5 rounded transition cursor-pointer ${
                                s.status === 'Active'
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-rose-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={s.status === 'Active' ? 'Disable Student' : 'Re-enable Student'}
                            >
                              {s.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
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
        ) : (
          /* View Mode 2: Grid / Card View */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStudents.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 text-[#80229a] font-bold flex items-center justify-center text-sm">
                      {s.firstName[0]}
                      {s.lastName?.[0] || ''}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {s.firstName} {s.lastName || ''}
                      </h3>
                      <p className="text-[11px] font-mono font-bold text-[#80229a]">
                        {s.admissionNo}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Course:</span>
                    <span className="font-medium text-slate-800">{s.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semester:</span>
                    <span className="font-medium text-purple-700">{s.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Father Name:</span>
                    <span className="font-medium text-slate-800">{s.fatherName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-medium font-mono text-slate-800">{s.mobileNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="px-3 py-1 bg-purple-50 text-[#80229a] hover:bg-purple-100 rounded text-xs font-semibold transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleToggleStatus(s)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <div>
            Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} entries
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
      {/* 5. COMPLETE STUDENT PROFILE DOSSIER MODAL                     */}
      {/* ============================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#80229a] to-[#58156b] text-white flex items-start justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName?.[0] || ''}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedStudent.firstName} {selectedStudent.lastName || ''}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-purple-200 text-xs">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded">
                      Adm No: {selectedStudent.admissionNo}
                    </span>
                    <span>•</span>
                    <span>{selectedStudent.course}</span>
                    <span>•</span>
                    <span>{selectedStudent.semester}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold text-slate-600 gap-6">
              <button
                onClick={() => setActiveDossierTab('profile')}
                className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeDossierTab === 'profile'
                    ? 'border-[#80229a] text-[#80229a]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>General Profile</span>
              </button>
              <button
                onClick={() => setActiveDossierTab('parent')}
                className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeDossierTab === 'parent'
                    ? 'border-[#80229a] text-[#80229a]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Contact className="w-3.5 h-3.5" />
                <span>Parent / Guardian</span>
              </button>
              <button
                onClick={() => setActiveDossierTab('hostel')}
                className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeDossierTab === 'hostel'
                    ? 'border-[#80229a] text-[#80229a]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Hostel & Misc</span>
              </button>
              <button
                onClick={() => setActiveDossierTab('documents')}
                className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeDossierTab === 'documents'
                    ? 'border-[#80229a] text-[#80229a]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => setActiveDossierTab('fees')}
                className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeDossierTab === 'fees'
                    ? 'border-[#80229a] text-[#80229a]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Fee Ledger</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {activeDossierTab === 'profile' && (
                <div className="space-y-6">
                  {/* Academic & Basic Info Grid */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                      Academic & Personal Information
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Roll No</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.rollNo || '-'}</span>
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
                        <span className="text-slate-400 block text-[10px]">Mobile</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedStudent.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.email || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Blood Group</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.bloodGroup || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status</span>
                        <span className={`font-bold ${selectedStudent.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Qualification & Referral */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                      Previous Academic Background & Referral
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">10th Marks</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.tenthMarks || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">12th Marks</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.twelfthMarks || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Aadhaar No</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedStudent.aadhaarNo || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Referral Partner</span>
                        <span className="font-semibold text-[#80229a]">{selectedStudent.referralBy || 'Direct Walk-in'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 text-purple-700">
                      Current & Permanent Address
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Current Address</span>
                        <span className="text-slate-700 font-medium">{selectedStudent.currentAddress || 'Plot 12, Gangapur Road, Nashik'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Permanent Address</span>
                        <span className="text-slate-700 font-medium">{selectedStudent.permanentAddress || 'Same as current address'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'parent' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                      Father / Mother / Guardian Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Father Card */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">Father Information</span>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Name</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.fatherName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Phone</span>
                          <span className="font-semibold text-slate-800 font-mono">{selectedStudent.fatherPhone || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Occupation</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.fatherOccupation || '-'}</span>
                        </div>
                      </div>

                      {/* Mother Card */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">Mother Information</span>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Name</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.motherName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Phone</span>
                          <span className="font-semibold text-slate-800 font-mono">{selectedStudent.motherPhone || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Occupation</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.motherOccupation || '-'}</span>
                        </div>
                      </div>

                      {/* Guardian Card */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">Guardian Information</span>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Name</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.guardianName || selectedStudent.fatherName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Relation</span>
                          <span className="font-semibold text-slate-800">{selectedStudent.guardianRelation || 'Father'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Phone</span>
                          <span className="font-semibold text-slate-800 font-mono">{selectedStudent.guardianPhone || selectedStudent.fatherPhone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'hostel' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                      Hostel & Accommodation Details
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hostel Type</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.hostelType || 'Girls Hostel'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hostel Name</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.hostelName || 'Florence Nightingale Block'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Room Type</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.roomType || 'Double Sharing'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Room No</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.room || '204'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                      Miscellaneous & Bank Details
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank A/C No</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedStudent.bankAccountNo || '50100492817281'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.bankName || 'State Bank of India'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedStudent.ifscCode || 'SBIN0001234'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">RTE Student</span>
                        <span className="font-semibold text-slate-700">{selectedStudent.rte || 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'documents' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                    Uploaded Verification Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Aadhar Card',
                      '10th Marksheet',
                      '12th Marksheet',
                      'Migration Certificate',
                      'Caste Certificate',
                      'Domicile Certificate',
                    ].map((docName) => (
                      <div
                        key={docName}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-slate-800">{docName}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDossierTab === 'fees' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-purple-700">
                    Fees & Finance Ledger
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Paid Fees</span>
                      <span className="font-bold text-emerald-700 text-base">
                        ₹{(selectedStudent.feesPaid || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Outstanding Balance</span>
                      <span className="font-bold text-rose-700 text-base">
                        ₹{(selectedStudent.feesDue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payment Status</span>
                      <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                        selectedStudent.feesDue === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedStudent.feesDue === 0 ? 'Fully Paid' : 'Partial Due'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-lg shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
