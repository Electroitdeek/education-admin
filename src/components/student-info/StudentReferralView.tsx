'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlus,
  User,
  List,
  Plus,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns,
  Check,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  FileEdit,
  ArrowLeft,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/student-info/referrals`;
const STUDENTS_ENDPOINT = `${API}/student-info/students`;

export interface ReferralItem {
  _id: string;
  referralBy?: string;
  name?: string;
  studentName?: string;
  studentCourse?: string;
  studentSemester?: string;
  course?: string;
  email?: string;
  mobileNumber?: string;
  contact?: string;
  note?: string;
  role?: string;
  createdAt?: string;
}

interface StudentOption {
  _id: string;
  admissionNo: string;
  firstName: string;
  lastName?: string;
  course: string;
  semester: string;
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

const REFERRER_COURSES = [
  'B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'Medical Doctor',
  'Hospital Staff',
  'Nursing Alumni',
  'Education Consultant',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentReferralView({ onNavigate }: Props) {
  // Navigation between Directory List and addUpdate screen (matches /admin/student-referral and /admin/student-referral/addUpdate)
  const [viewMode, setViewMode] = useState<'list' | 'addUpdate'>('list');

  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields (Exact fields from media_1793861603611_2ed1fbc2.jpg)
  // Row 1: Student selection
  const [studentCourse, setStudentCourse] = useState('');
  const [studentSemester, setStudentSemester] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // Row 2: Referrer details
  const [referrerCourse, setReferrerCourse] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referrerNumber, setReferrerNumber] = useState('');

  // Row 3: Note
  const [note, setNote] = useState('');

  // Table & Action Dropdowns
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    serial: true,
    referralBy: true,
    studentName: true,
    email: true,
    mobileNumber: true,
    note: true,
    action: true,
  });

  // Pagination (10 per page default matching ERP)
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        const normalized = (data || []).map((r: any) => ({
          ...r,
          referralBy: r.referralBy || r.name || 'Referral Partner',
          mobileNumber: r.mobileNumber || r.contact || '',
          studentName: r.studentName || '-',
        }));
        setReferrals(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch referrals', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch student roster for student dropdown
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(STUDENTS_ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
    fetchStudents();
  }, [fetchReferrals, fetchStudents]);

  // Filter students based on selected course and semester
  const availableStudents = useMemo(() => {
    return students.filter((s) => {
      if (studentCourse && s.course !== studentCourse) return false;
      if (studentSemester && s.semester !== studentSemester) return false;
      return true;
    });
  }, [students, studentCourse, studentSemester]);

  // Open addUpdate form for new referral
  const handleOpenAdd = () => {
    setEditingId(null);
    setStudentCourse('');
    setStudentSemester('');
    setSelectedStudent('');
    setReferrerCourse('');
    setReferrerName('');
    setReferrerEmail('');
    setReferrerNumber('');
    setNote('');
    setViewMode('addUpdate');
  };

  // Open addUpdate form for editing
  const handleOpenEdit = (item: ReferralItem) => {
    setEditingId(item._id);
    setStudentCourse(item.studentCourse || '');
    setStudentSemester(item.studentSemester || '');
    setSelectedStudent(item.studentName !== '-' ? item.studentName || '' : '');
    setReferrerCourse(item.course || '');
    setReferrerName(item.referralBy || item.name || '');
    setReferrerEmail(item.email || '');
    setReferrerNumber(item.mobileNumber || item.contact || '');
    setNote(item.note || '');
    setOpenActionId(null);
    setViewMode('addUpdate');
  };

  // Save referral
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerName.trim()) {
      alert('Please enter Referrer Name');
      return;
    }
    if (!selectedStudent.trim()) {
      alert('Please select or enter Student Name');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        referralBy: referrerName.trim(),
        name: referrerName.trim(),
        studentName: selectedStudent.trim(),
        studentCourse: studentCourse.trim(),
        studentSemester: studentSemester.trim(),
        course: referrerCourse.trim(),
        email: referrerEmail.trim(),
        mobileNumber: referrerNumber.trim(),
        contact: referrerNumber.trim(),
        note: note.trim(),
      };

      if (editingId) {
        const res = await fetch(`${ENDPOINT}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update referral');
      } else {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create referral');
      }

      setViewMode('list');
      fetchReferrals();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving referral');
    } finally {
      setSaving(false);
    }
  };

  // Delete referral
  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    if (!confirm('Are you sure you want to delete this referral record?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReferrals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered & sorted referrals
  const filteredReferrals = useMemo(() => {
    let result = referrals.filter(
      (r) =>
        r.referralBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!sortAsc) {
      result = [...result].reverse();
    }
    return result;
  }, [referrals, searchTerm, sortAsc]);

  // Paginated items
  const totalEntries = filteredReferrals.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedReferrals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReferrals.slice(start, start + pageSize);
  }, [filteredReferrals, currentPage, pageSize]);

  // Exports
  const handleCopy = () => {
    if (!filteredReferrals.length) return;
    const header = '#\tREFERRAL BY\tSTUDENT NAME\tEMAIL\tMOBILE NUMBER\tNOTE\n';
    const body = filteredReferrals
      .map(
        (r, idx) =>
          `${idx + 1}\t${r.referralBy || '-'}\t${r.studentName || '-'}\t${r.email || '-'}\t${r.mobileNumber || '-'}\t${r.note || '-'}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredReferrals.length) return;
    const header = '#,Referral By,Student Name,Email,Mobile Number,Note\n';
    const body = filteredReferrals
      .map(
        (r, idx) =>
          `${idx + 1},"${r.referralBy || ''}","${r.studentName || ''}","${r.email || ''}","${r.mobileNumber || ''}","${r.note || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Referrals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                                    */}
      {/* ============================================================== */}
      {viewMode === 'list' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-slate-800">
              <UserPlus className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Referral</h1>
          </div>

          {/* Right Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div
              className="flex items-center gap-1 hover:text-[#80229a] cursor-pointer"
              onClick={() => onNavigate?.('student-admission')}
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Student</span>
            </div>
            <span>/</span>
            <span className="text-[#80229a] font-semibold">Student Referral</span>
          </div>
        </div>
      ) : (
        /* Add Referral Header (Exact from media_1793861603611_2ed1fbc2.jpg) */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-slate-800">
              <UserPlus className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {editingId ? 'Edit Referral' : 'Add Referral'}
            </h1>
          </div>

          {/* Right Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div
              className="flex items-center gap-1 hover:text-[#80229a] cursor-pointer"
              onClick={() => setViewMode('list')}
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Referral</span>
            </div>
            <span>/</span>
            <span className="text-[#80229a] font-semibold">
              {editingId ? 'Edit Referral' : 'Add Referral'}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. VIEW 1: DIRECTORY LIST TABLE                                */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
          {/* Card Header with Title and + Add Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">Student Referral</h2>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
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
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 space-y-1 text-xs">
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
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
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
                  {visibleColumns.serial && (
                    <th
                      className="py-3 px-4 w-14 cursor-pointer select-none"
                      onClick={() => setSortAsc(!sortAsc)}
                    >
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.referralBy && (
                    <th className="py-3 px-4">REFERRAL BY</th>
                  )}
                  {visibleColumns.studentName && (
                    <th className="py-3 px-4">STUDENT NAME</th>
                  )}
                  {visibleColumns.email && (
                    <th className="py-3 px-4">EMAIL</th>
                  )}
                  {visibleColumns.mobileNumber && (
                    <th className="py-3 px-4">MOBILE NUMBER</th>
                  )}
                  {visibleColumns.note && (
                    <th className="py-3 px-4">NOTE</th>
                  )}
                  {visibleColumns.action && (
                    <th className="py-3 px-4 text-center w-24">ACTION</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Loading referral records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedReferrals.map((r, idx) => {
                    const rowId = (currentPage - 1) * pageSize + idx + 1;
                    const isActionOpen = openActionId === r._id;
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        {visibleColumns.serial && (
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {rowId}
                          </td>
                        )}
                        {visibleColumns.referralBy && (
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {r.referralBy || r.name || '-'}
                          </td>
                        )}
                        {visibleColumns.studentName && (
                          <td className="py-3 px-4 text-slate-700">
                            {r.studentName || '-'}
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="py-3 px-4 text-slate-600">
                            {r.email || '-'}
                          </td>
                        )}
                        {visibleColumns.mobileNumber && (
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {r.mobileNumber || r.contact || '-'}
                          </td>
                        )}
                        {visibleColumns.note && (
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {r.note || '-'}
                          </td>
                        )}
                        {visibleColumns.action && (
                          <td className="py-3 px-4 text-center relative">
                            <div className="inline-block text-left">
                              <button
                                type="button"
                                onClick={() => setOpenActionId(isActionOpen ? null : r._id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded text-xs font-medium transition cursor-pointer"
                              >
                                <span>Action</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {/* Dropdown Menu */}
                              {isActionOpen && (
                                <div className="absolute right-4 mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs text-left">
                                  <button
                                    onClick={() => handleOpenEdit(r)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-purple-50 hover:text-[#80229a] transition cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r._id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
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
      )}

      {/* ============================================================== */}
      {/* 3. VIEW 2: ADD / EDIT REFERRAL FULL-PAGE FORM (EXACT MATCH)   */}
      {/* ============================================================== */}
      {viewMode === 'addUpdate' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
          {/* Card Header with Title and Back Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                {editingId ? 'Edit Referral' : 'Add Referral'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to List</span>
            </button>
          </div>

          {/* Form Body matching media_1793861603611_2ed1fbc2.jpg */}
          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* ROW 1: Student Selection (Course, Semester, Student) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={studentCourse}
                  onChange={(e) => {
                    setStudentCourse(e.target.value);
                    setSelectedStudent('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
                >
                  <option value="">Select</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={studentSemester}
                  onChange={(e) => {
                    setStudentSemester(e.target.value);
                    setSelectedStudent('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
                >
                  <option value="">Select</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white text-xs text-slate-700 font-medium"
                >
                  <option value="">Select</option>
                  {availableStudents.length > 0 ? (
                    availableStudents.map((s) => (
                      <option key={s._id} value={`${s.firstName} ${s.lastName || ''}`.trim()}>
                        {s.firstName} {s.lastName || ''} ({s.admissionNo})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Aarav Sharma">Aarav Sharma (ADM-2026-101)</option>
                      <option value="Priya Verma">Priya Verma (ADM-2026-102)</option>
                      <option value="Rohan Deshmukh">Rohan Deshmukh (ADM-2026-103)</option>
                      <option value="Sneha Patil">Sneha Patil (ADM-2026-104)</option>
                      <option value="Vikram Joshi">Vikram Joshi (ADM-2026-105)</option>
                      <option value="Ananya Roy">Ananya Roy (ADM-2026-106)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* ROW 2: Referrer Details (Course, Name, Email, Number) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={referrerCourse}
                  onChange={(e) => setReferrerCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
                >
                  <option value="">Select</option>
                  {REFERRER_COURSES.map((rc) => (
                    <option key={rc} value={rc}>
                      {rc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="name"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="email"
                  value={referrerEmail}
                  onChange={(e) => setReferrerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="number"
                  value={referrerNumber}
                  onChange={(e) => setReferrerNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            {/* ROW 3: Note */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Note
              </label>
              <textarea
                rows={4}
                placeholder=""
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FOOTER (EXACT COPYRIGHT NOTICE FROM SCREENSHOT)            */}
      {/* ============================================================== */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </footer>
    </div>
  );
}
