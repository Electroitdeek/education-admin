'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FastForward,
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
  RotateCcw,
  Receipt,
  ArrowRightLeft,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/fees-collection/advance-payment`;

export interface AdvancePaymentRecord {
  _id?: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  course: string;
  semester: string;
  phone?: string;
  advanceAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
  status: string; // 'Available' | 'Partially Adjusted' | 'Adjusted' | 'Refunded'
  note?: string;
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

const PAYMENT_MODES = ['Online/UPI', 'Cash', 'Cheque', 'Bank Transfer'];

export default function AdvancePaymentView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Criteria State matching screenshot
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<AdvancePaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof AdvancePaymentRecord>('paymentDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modals State
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AdvancePaymentRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<AdvancePaymentRecord | null>(null);

  // Form Fields for Collect Advance
  const [formName, setFormName] = useState<string>('');
  const [formAdmissionNo, setFormAdmissionNo] = useState<string>('');
  const [formRollNo, setFormRollNo] = useState<string>('');
  const [formCourse, setFormCourse] = useState<string>(COURSES[0]);
  const [formSemester, setFormSemester] = useState<string>(SEMESTERS[0]);
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formPaymentMode, setFormPaymentMode] = useState<string>(PAYMENT_MODES[0]);
  const [formReferenceNo, setFormReferenceNo] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');

  // Form Fields for Adjust Advance
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('Tuition Fee Installment');

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Fetch Advance Payments from API
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (course && course !== 'Select Course') params.append('course', course);
      if (semester && semester !== 'Select Semester') params.append('semester', semester);
      if (tableSearch) params.append('search', tableSearch);

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        showAlert('Failed to load advance payment records', 'error');
      }
    } catch {
      showAlert('Could not connect to API server on port 3045', 'error');
    } finally {
      setLoading(false);
    }
  }, [course, semester, tableSearch]);

  useEffect(() => {
    fetchRecords();
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
  }, [fetchRecords]);

  // Criteria search click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
    showAlert('Filter criteria applied successfully');
  };

  // Open Collect Advance Modal
  const handleOpenCollect = () => {
    setSelectedRecord(null);
    setFormName('');
    setFormAdmissionNo(`ADM-2025-${Math.floor(10 + Math.random() * 90)}`);
    setFormRollNo(`RN-${Math.floor(100 + Math.random() * 900)}`);
    setFormCourse(course && course !== 'Select Course' ? course : COURSES[0]);
    setFormSemester(semester && semester !== 'Select Semester' ? semester : SEMESTERS[0]);
    setFormPhone('98' + Math.floor(10000000 + Math.random() * 90000000));
    setFormAmount('');
    setFormPaymentMode(PAYMENT_MODES[0]);
    setFormReferenceNo(`ADV-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNote('');
    setShowCollectModal(true);
  };

  // Open Adjust Modal
  const handleOpenAdjust = (rec: AdvancePaymentRecord) => {
    setSelectedRecord(rec);
    setAdjustAmount(String(rec.remainingAmount));
    setAdjustReason('Semester Tuition Fee');
    setShowAdjustModal(true);
  };

  // Save Advance Payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAdmissionNo.trim() || !formAmount || Number(formAmount) <= 0) {
      showAlert('Please enter valid Student Name, Admission No, and Amount', 'error');
      return;
    }

    const payload = {
      studentName: formName.trim(),
      admissionNo: formAdmissionNo.trim(),
      rollNo: formRollNo.trim(),
      course: formCourse,
      semester: formSemester,
      phone: formPhone.trim(),
      advanceAmount: Number(formAmount),
      remainingAmount: Number(formAmount),
      paymentDate: formDate,
      paymentMode: formPaymentMode,
      referenceNo: formReferenceNo.trim(),
      status: 'Available',
      note: formNote.trim(),
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert(`Advance payment of ₹${Number(formAmount).toLocaleString('en-IN')} recorded for ${formName}!`);
        setShowCollectModal(false);
        fetchRecords();
      } else {
        showAlert('Failed to save advance payment', 'error');
      }
    } catch {
      showAlert('Network error saving advance payment', 'error');
    }
  };

  // Submit Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !selectedRecord._id) return;
    const amt = Number(adjustAmount);
    if (isNaN(amt) || amt <= 0 || amt > selectedRecord.remainingAmount) {
      showAlert(`Please enter an adjustment amount between 1 and ₹${selectedRecord.remainingAmount.toLocaleString('en-IN')}`, 'error');
      return;
    }

    try {
      const res = await fetch(`${ENDPOINT}/${selectedRecord._id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustAmount: amt,
          adjustedFor: adjustReason,
        }),
      });

      if (res.ok) {
        showAlert(`Successfully adjusted ₹${amt.toLocaleString('en-IN')} for ${selectedRecord.studentName}!`);
        setShowAdjustModal(false);
        fetchRecords();
      } else {
        showAlert('Failed to adjust advance payment', 'error');
      }
    } catch {
      showAlert('Error adjusting advance balance', 'error');
    }
  };

  // Delete Record
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete advance payment record for ${name}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted advance payment for ${name}`);
        fetchRecords();
      } else {
        showAlert('Failed to delete record', 'error');
      }
    } catch {
      showAlert('Error deleting record', 'error');
    }
  };

  // Print Receipt
  const handlePrint = (rec: AdvancePaymentRecord) => {
    setPrintRecord(rec);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Student Name',
      'Admission No',
      'Course',
      'Semester',
      'Advance Amount (₹)',
      'Remaining (₹)',
      'Date',
      'Payment Mode',
      'Reference No',
      'Status',
    ];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.studentName}"`,
      `"${r.admissionNo}"`,
      `"${r.course}"`,
      `"${r.semester}"`,
      r.advanceAmount,
      r.remainingAmount,
      `"${r.paymentDate}"`,
      `"${r.paymentMode}"`,
      `"${r.referenceNo || ''}"`,
      `"${r.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `advance_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = records
      .map(
        (r, i) =>
          `${i + 1}. ${r.studentName} (${r.admissionNo}) - Advance: ₹${r.advanceAmount} | Remaining: ₹${r.remainingAmount} [${r.status}]`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Advance payments copied to clipboard!');
  };

  // Filtered & Sorted
  const filtered = records
    .filter((r) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(s) ||
        r.admissionNo.toLowerCase().includes(s) ||
        (r.phone && r.phone.toLowerCase().includes(s)) ||
        (r.referenceNo && r.referenceNo.toLowerCase().includes(s)) ||
        r.paymentMode.toLowerCase().includes(s)
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

  const totalAdvanceSum = filtered.reduce((acc, curr) => acc + (curr.advanceAmount || 0), 0);
  const totalRemainingSum = filtered.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Notification */}
      {alertMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-slide-in ${alertMsg.type === 'success'
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

      {/* Top Header matching reference screenshot: ⏩ Advance Payment & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Double Right Arrow icon matching screenshot */}
          <div className="text-[#80229a]">
            <FastForward className="h-5 w-5 fill-[#80229a]" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Advance Payment</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Advance Payment */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Advance Payment</span>
        </div>
      </div>

      {/* Select Criteria Card matching Reference Screenshot Exactly */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Search className="h-4 w-4 text-[#80229a]" />
          <h2 className="text-sm font-bold text-slate-700 tracking-wide">Select Criteria</h2>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Course matching screenshot */}
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

            {/* Field 2: Semester matching screenshot */}
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

      {/* Advance Payment List & Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800">
              Advance Payments & Deposits
            </h3>
            <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Students
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Available Balance: ₹{totalRemainingSum.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Collect Advance Button */}
            <button
              onClick={handleOpenCollect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Collect Advance</span>
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

            {/* Reset Filters */}
            <button
              onClick={() => {
                setCourse('');
                setSemester('');
                setTableSearch('');
                fetchRecords();
              }}
              title="Reset Filters"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="flex justify-end pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Search:</span>
            <input
              type="text"
              placeholder="Search by student, admission, ref no..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-64"
            />
          </div>
        </div>

        {/* Data Table */}
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
                <th className="py-3 px-3">COURSE & SEM</th>
                <th className="py-3 px-3">ADVANCE (₹)</th>
                <th className="py-3 px-3">AVAILABLE (₹)</th>
                <th className="py-3 px-3">PAYMENT DATE</th>
                <th className="py-3 px-3">MODE</th>
                <th className="py-3 px-3">REF / RECEIPT NO</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                    <div>Loading advance payments...</div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    No advance payments found for selected criteria.
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
                        <span className="text-[#80229a] font-bold">{rec.studentName}</span>
                        {rec.note && (
                          <p className="text-[10px] text-slate-400 font-normal line-clamp-1">
                            {rec.note}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">
                        {rec.admissionNo}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {rec.course} • {rec.semester}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        ₹{rec.advanceAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700">
                        ₹{rec.remainingAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {rec.paymentDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-purple-50 text-[#80229a] px-2 py-0.5 rounded text-[10px] font-semibold">
                          {rec.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {rec.referenceNo || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : rec.status === 'Partially Adjusted'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rec.remainingAmount > 0 && (
                            <button
                              onClick={() => handleOpenAdjust(rec)}
                              title="Adjust Towards Fees"
                              className="p-1.5 hover:bg-emerald-100 text-emerald-700 rounded-md transition"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(rec)}
                            title="Print Advance Receipt"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec._id || '', rec.studentName)}
                            title="Delete Record"
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
                className={`px-3 py-1 rounded font-semibold text-xs transition ${currentPage === i + 1
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

      {/* Collect Advance Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FastForward className="h-4 w-4 fill-white" />
                <h3 className="font-bold text-sm tracking-wide">Collect Advance Payment</h3>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
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
                    placeholder="e.g. ADM-2025-10"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Advance Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Enter advance deposit"
                    className="w-full text-xs font-bold text-[#80229a] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
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
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Reference / Receipt No
                  </label>
                  <input
                    type="text"
                    value={formReferenceNo}
                    onChange={(e) => setFormReferenceNo(e.target.value)}
                    placeholder="e.g. ADV-2026-008"
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Note / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Advance deposit for upcoming session hostel and lab"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Save Advance Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Advance Modal */}
      {showAdjustModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                <h3 className="font-bold text-sm tracking-wide">Adjust Advance Balance</h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                <div className="font-bold text-slate-800">{selectedRecord.studentName}</div>
                <div className="text-slate-500 font-mono">{selectedRecord.admissionNo} • {selectedRecord.course}</div>
                <div className="flex justify-between items-center pt-1 font-semibold text-slate-700">
                  <span>Available Advance Balance:</span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    ₹{selectedRecord.remainingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount to Deduct / Adjust (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedRecord.remainingAmount}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full text-xs font-bold text-rose-600 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjust Towards (Fee Component) *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. 2nd Semester Tuition Fee, Examination Fee"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Advance Receipt */}
      {printRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Advance Deposit Receipt</h3>
              <button
                onClick={() => setPrintRecord(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-[#80229a] uppercase">
                  Electro Institute of Nursing and Paramedical Sciences
                </h4>
                <p className="text-[10px] text-slate-500">Official Advance Fees Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="font-semibold text-slate-500">Student Name:</span> {printRecord.studentName}</div>
                <div><span className="font-semibold text-slate-500">Admission No:</span> {printRecord.admissionNo}</div>
                <div><span className="font-semibold text-slate-500">Course:</span> {printRecord.course}</div>
                <div><span className="font-semibold text-slate-500">Semester:</span> {printRecord.semester}</div>
                <div><span className="font-semibold text-slate-500">Payment Date:</span> {printRecord.paymentDate}</div>
                <div><span className="font-semibold text-slate-500">Mode:</span> {printRecord.paymentMode}</div>
                <div><span className="font-semibold text-slate-500">Receipt No:</span> {printRecord.referenceNo || '-'}</div>
                <div><span className="font-semibold text-slate-500">Status:</span> {printRecord.status}</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 font-medium text-[11px]">Advance Amount Paid</div>
                  <div className="text-base font-extrabold text-[#80229a]">
                    ₹{printRecord.advanceAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium text-[11px]">Available Remaining</div>
                  <div className="text-base font-extrabold text-emerald-700">
                    ₹{printRecord.remainingAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {printRecord.note && (
                <div className="text-[11px] text-slate-500 italic">
                  Note: {printRecord.note}
                </div>
              )}

              <div className="flex justify-between items-end pt-6 text-[10px] text-slate-400">
                <span>Printed on: {new Date().toLocaleDateString('en-GB')}</span>
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mb-1"></div>
                  <span>Authorized Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintRecord(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document</span>
              </button>
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

