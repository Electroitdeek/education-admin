'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ChevronRight,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/fees-collection/fee-follow-up`;

export interface FeeFollowUpRecord {
  _id?: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  phone: string;
  fatherName?: string;
  course: string;
  semester: string;
  balanceDue: number;
  followUpDate: string;
  nextFollowUpDate?: string;
  responseType: string;
  remarks?: string;
  followedBy?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
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

const RESPONSE_TYPES = [
  'Promised to Pay',
  'Call Not Picked',
  'Requested Extension',
  'Switched Off / Out of Reach',
  'Wrong Number',
  'Paid',
  'Disputed Fees',
];

export default function FeeFollowUpView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Criteria State matching screenshot
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<FeeFollowUpRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof FeeFollowUpRecord>('followUpDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal State for Add / Edit Call Follow-Up
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FeeFollowUpRecord | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formAdmissionNo, setFormAdmissionNo] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCourse, setFormCourse] = useState<string>(COURSES[0]);
  const [formSemester, setFormSemester] = useState<string>(SEMESTERS[0]);
  const [formBalanceDue, setFormBalanceDue] = useState<string>('');
  const [formFollowUpDate, setFormFollowUpDate] = useState<string>('');
  const [formNextFollowUpDate, setFormNextFollowUpDate] = useState<string>('');
  const [formResponseType, setFormResponseType] = useState<string>(RESPONSE_TYPES[0]);
  const [formRemarks, setFormRemarks] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('Pending');

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Fetch Follow-Ups
  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (course && course !== 'Select Option') params.append('course', course);
      if (semester && semester !== 'Select Option') params.append('semester', semester);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (tableSearch) params.append('search', tableSearch);

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        showAlert('Failed to load follow-up records', 'error');
      }
    } catch {
      showAlert('Could not connect to API server on port 5000', 'error');
    } finally {
      setLoading(false);
    }
  }, [course, semester, startDate, endDate, tableSearch]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // Criteria search click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFollowUps();
    showAlert('Filter criteria applied successfully');
  };

  // Reset Search Filters
  const handleResetFilters = () => {
    setCourse('');
    setSemester('');
    setStartDate('');
    setEndDate('');
    setTableSearch('');
    fetchFollowUps();
  };

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormName('');
    setFormAdmissionNo(`ADM-2025-${Math.floor(10 + Math.random() * 90)}`);
    setFormPhone('98' + Math.floor(10000000 + Math.random() * 90000000));
    setFormCourse(course && course !== 'Select Option' ? course : COURSES[0]);
    setFormSemester(semester && semester !== 'Select Option' ? semester : SEMESTERS[0]);
    setFormBalanceDue('25000');
    const today = new Date().toISOString().split('T')[0];
    setFormFollowUpDate(today);
    setFormNextFollowUpDate('');
    setFormResponseType(RESPONSE_TYPES[0]);
    setFormRemarks('');
    setFormStatus('Pending');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: FeeFollowUpRecord) => {
    setEditingRecord(rec);
    setFormName(rec.studentName);
    setFormAdmissionNo(rec.admissionNo);
    setFormPhone(rec.phone);
    setFormCourse(rec.course);
    setFormSemester(rec.semester);
    setFormBalanceDue(String(rec.balanceDue));
    setFormFollowUpDate(rec.followUpDate);
    setFormNextFollowUpDate(rec.nextFollowUpDate || '');
    setFormResponseType(rec.responseType || RESPONSE_TYPES[0]);
    setFormRemarks(rec.remarks || '');
    setFormStatus(rec.status || 'Pending');
    setShowModal(true);
  };

  // Save Modal (Add or Edit)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAdmissionNo.trim() || !formPhone.trim()) {
      showAlert('Please enter Student Name, Admission No, and Phone', 'error');
      return;
    }

    const payload = {
      studentName: formName.trim(),
      admissionNo: formAdmissionNo.trim(),
      phone: formPhone.trim(),
      course: formCourse,
      semester: formSemester,
      balanceDue: Number(formBalanceDue) || 0,
      followUpDate: formFollowUpDate,
      nextFollowUpDate: formNextFollowUpDate,
      responseType: formResponseType,
      remarks: formRemarks.trim(),
      status: formStatus,
    };

    try {
      let res;
      if (editingRecord && editingRecord._id) {
        res = await fetch(`${ENDPOINT}/${editingRecord._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showAlert(
          editingRecord
            ? `Follow-up for ${formName} updated!`
            : `New follow-up for ${formName} logged!`
        );
        setShowModal(false);
        fetchFollowUps();
      } else {
        showAlert('Failed to save follow-up record', 'error');
      }
    } catch {
      showAlert('Network error saving follow-up', 'error');
    }
  };

  // Delete Follow-Up
  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete follow-up entry for ${studentName}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted follow-up for ${studentName}`);
        fetchFollowUps();
      } else {
        showAlert('Failed to delete follow-up', 'error');
      }
    } catch {
      showAlert('Error deleting record', 'error');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Student Name',
      'Admission No',
      'Phone',
      'Course',
      'Semester',
      'Balance Due',
      'Follow Up Date',
      'Next Follow Up Date',
      'Response',
      'Remarks',
      'Status',
    ];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.studentName}"`,
      `"${r.admissionNo}"`,
      `"${r.phone}"`,
      `"${r.course}"`,
      `"${r.semester}"`,
      r.balanceDue,
      `"${r.followUpDate}"`,
      `"${r.nextFollowUpDate || ''}"`,
      `"${r.responseType}"`,
      `"${r.remarks || ''}"`,
      `"${r.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_follow_ups_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = records
      .map(
        (r, i) =>
          `${i + 1}. ${r.studentName} (${r.phone}) - Due: ₹${r.balanceDue} [${r.responseType}] Remarks: ${r.remarks || '-'}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Follow-up list copied to clipboard!');
  };

  // Filtered & Sorted
  const filtered = records
    .filter((r) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(s) ||
        r.admissionNo.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        r.responseType.toLowerCase().includes(s) ||
        (r.remarks && r.remarks.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalDueSum = filtered.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Notification */}
      {alertMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-slide-in ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Top Header matching reference screenshot: 💸 Fee Follow Up & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Hand with cash / coin icon matching screenshot */}
          <div className="text-slate-800">
            <svg
              className="h-5 w-5 fill-slate-800"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-1.5H9v-2h4v-1H9.5C8.67 12 8 11.33 8 10.5V9c0-.83.67-1.5 1.5-1.5H11V6h2v1.5h2v2h-4v1h3.5c.83 0 1.5.67 1.5 1.5V15c0 .83-.67 1.5-1.5 1.5H13v1.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fee Follow Up</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Fee Follow Up */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Fee Follow Up</span>
        </div>
      </div>

      {/* Select Criteria Card matching Reference Screenshot Exactly */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Search className="h-4 w-4 text-[#80229a]" />
          <h2 className="text-sm font-bold text-slate-700 tracking-wide">Select Criteria</h2>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Field 1: Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">Select Option</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">Select Option</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Start Date 📅 */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Start Date 📅
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>
            </div>

            {/* Field 4: End Date 📅 */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                End Date 📅
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>
            </div>
          </div>

          {/* Search Button matching screenshot */}
          <div className="flex justify-end mt-5 pt-3 border-t border-slate-100/70">
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

      {/* Follow-Up List & Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800">
              Fee Follow-Up Records
            </h3>
            <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Follow-Ups
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Total Outstanding: ₹{totalDueSum.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add New Follow-Up Button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>+ Log Follow-Up</span>
            </button>

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
                title="Print List"
                className="p-1.5 hover:bg-white/20 rounded transition"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Reset Filter Button */}
            <button
              onClick={handleResetFilters}
              title="Reset Criteria"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Search & Table Search Bar */}
        <div className="flex justify-end pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Search:</span>
            <input
              type="text"
              placeholder="Search by student, phone, response..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th
                  onClick={() => {
                    setSortField('studentName');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                >
                  <div className="flex items-center gap-1">
                    <span>STUDENT NAME</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">ADMISSION NO</th>
                <th className="py-3 px-3">PHONE</th>
                <th className="py-3 px-3">COURSE & SEM</th>
                <th className="py-3 px-3">BALANCE DUE</th>
                <th className="py-3 px-3">FOLLOW UP DATE</th>
                <th className="py-3 px-3">NEXT DATE</th>
                <th className="py-3 px-3">RESPONSE / REMARKS</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                    <div>Loading fee follow-up records...</div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    No follow-up records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((rec, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={rec._id || idx} className="hover:bg-purple-50/30 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-semibold">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div>
                          <span className="text-[#80229a] font-bold">{rec.studentName}</span>
                          {rec.fatherName && (
                            <p className="text-[10px] text-slate-400 font-normal">
                              S/O {rec.fatherName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">
                        {rec.admissionNo}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                        {rec.phone}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {rec.course} • {rec.semester}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600">
                        ₹{rec.balanceDue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {rec.followUpDate}
                      </td>
                      <td className="py-3 px-3 text-amber-700 font-semibold">
                        {rec.nextFollowUpDate || '-'}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {rec.responseType}
                          </span>
                          {rec.remarks && (
                            <span className="text-[10px] text-slate-400 italic line-clamp-1">
                              {rec.remarks}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rec.status === 'Resolved' || rec.responseType === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            title="Update Follow-Up Call"
                            className="p-1.5 hover:bg-purple-100 text-[#80229a] rounded-md transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec._id || '', rec.studentName)}
                            title="Delete Entry"
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
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

      {/* Log Follow-Up Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4" />
                <h3 className="font-bold text-sm tracking-wide">
                  {editingRecord ? 'Update Fee Follow-Up Call' : 'Log New Fee Follow-Up Call'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Admission No *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAdmissionNo}
                    onChange={(e) => setFormAdmissionNo(e.target.value)}
                    placeholder="e.g. ADM-2025-01"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Parent mobile number"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Balance Due (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formBalanceDue}
                    onChange={(e) => setFormBalanceDue(e.target.value)}
                    placeholder="Pending amount"
                    className="w-full text-xs font-bold text-rose-600 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Course *
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Follow-Up Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formFollowUpDate}
                    onChange={(e) => setFormFollowUpDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={formNextFollowUpDate}
                    onChange={(e) => setFormNextFollowUpDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Response Type *
                  </label>
                  <select
                    value={formResponseType}
                    onChange={(e) => setFormResponseType(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {RESPONSE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Call Remarks & Parent Response
                </label>
                <textarea
                  rows={3}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Record summary of conversation, commitment dates, etc."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {editingRecord ? 'Update Record' : 'Save Follow-Up'}
                </button>
              </div>
            </form>
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

