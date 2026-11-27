'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ChevronRight,
  HandCoins,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Download,
  Copy,
  Plus,
  X,
  ArrowUpDown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/fees-collection/collect-fee`;

export interface FeeRecord {
  _id?: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  course: string;
  semester: string;
  fatherName?: string;
  phone?: string;
  totalFees: number;
  paidFees: number;
  discount?: number;
  fine?: number;
  balance: number;
  paymentMode?: string;
  paymentDate?: string;
  receiptNo?: string;
  status: string; // 'Paid' | 'Partial' | 'Unpaid'
  note?: string;
  createdAt?: string;
}

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT (Medical Lab)',
  'DRT (Radiology)',
  'DOT (Operation Theatre)',
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

const PAYMENT_MODES = [
  'Cash',
  'Online / UPI',
  'Cheque',
  'Bank Transfer',
  'Demand Draft (DD)',
];

export default function CollectFeeView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Search Criteria State matching Screenshot
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  // Records & Loading
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Collect Payment Modal
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [collectDiscount, setCollectDiscount] = useState<number>(0);
  const [collectFine, setCollectFine] = useState<number>(0);
  const [collectNote, setCollectNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  // Add Student Fee Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newFee, setNewFee] = useState<{
    studentName: string;
    admissionNo: string;
    rollNo: string;
    course: string;
    semester: string;
    fatherName: string;
    phone: string;
    totalFees: number;
    paidFees: number;
    discount: number;
    fine: number;
    note: string;
  }>({
    studentName: '',
    admissionNo: '',
    rollNo: '',
    course: COURSES[0],
    semester: SEMESTERS[0],
    fatherName: '',
    phone: '',
    totalFees: 75000,
    paidFees: 0,
    discount: 0,
    fine: 0,
    note: '',
  });

  // Table Sorting & Pagination
  const [sortField, setSortField] = useState<'studentName' | 'admissionNo' | 'totalFees' | 'balance'>('studentName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Initialize payment date
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setPaymentDate(today);
  }, []);

  // Fetch fees records from API
  const fetchRecords = useCallback(async (params?: { course?: string; semester?: string; keyword?: string }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (params?.course && params.course !== 'Select Course') q.append('course', params.course);
      if (params?.semester && params.semester !== 'Select Semester') q.append('semester', params.semester);
      if (params?.keyword?.trim()) q.append('keyword', params.keyword.trim());

      const res = await fetch(`${ENDPOINT}?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch {
      // offline / api error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search by Course & Semester
  const handleCourseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords({ course: selectedCourse, semester: selectedSemester });
  };

  // Handle Search by Keyword
  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords({ keyword });
  };

  // Reset Filters
  const handleReset = () => {
    setSelectedCourse('');
    setSelectedSemester('');
    setKeyword('');
    fetchRecords();
  };

  // Open Collect Modal
  const openCollect = (record: FeeRecord) => {
    setSelectedRecord(record);
    setCollectAmount(record.balance);
    setCollectDiscount(0);
    setCollectFine(0);
    setPaymentMode('Cash');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setCollectNote('');
    setModalError('');
    setShowCollectModal(true);
  };

  // Submit Fee Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord?._id) return;

    if (collectAmount <= 0) {
      setModalError('Please enter a valid amount greater than 0');
      return;
    }

    if (collectAmount > selectedRecord.balance) {
      setModalError(`Amount cannot exceed the remaining balance of ₹${selectedRecord.balance.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const res = await fetch(`${ENDPOINT}/${selectedRecord._id}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: collectAmount,
          paymentMode,
          paymentDate,
          discount: collectDiscount,
          fine: collectFine,
          note: collectNote,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Payment submission failed');
      }

      const updated = await res.json();
      setSuccessToast(`₹${collectAmount.toLocaleString()} collected successfully for ${selectedRecord.studentName}! Receipt: ${updated.receiptNo}`);
      setTimeout(() => setSuccessToast(''), 5000);
      setShowCollectModal(false);
      fetchRecords({ course: selectedCourse, semester: selectedSemester, keyword });
    } catch (err: unknown) {
      setModalError((err as Error).message);
    }
    setIsSubmitting(false);
  };

  // Add New Student Fee Record
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.studentName.trim() || !newFee.admissionNo.trim()) {
      alert('Please fill student name and admission number');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFee),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSuccessToast(`Student fee record created for ${newFee.studentName}!`);
        setTimeout(() => setSuccessToast(''), 4000);
        fetchRecords();
      }
    } catch {
      alert('Failed to create fee record');
    }
  };

  // Sort & Filter
  const sortedRecords = [...records].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

  // Status Badge
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" /> Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="h-3 w-3" /> Unpaid
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#80229a] text-white flex items-center justify-center shadow-sm">
            <HandCoins className="h-4 w-4" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Collect Fee
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            👛 Fees Collection
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Collect Fee</span>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successToast}</span>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SELECT CRITERIA CARD (MATCHING USER SCREENSHOT EXACTLY)    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-600" />
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
              Select Criteria
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Student Fee
            </button>
            {(selectedCourse || selectedSemester || keyword) && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 2-Part Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Part: Course * + Semester (~60%) */}
          <form onSubmit={handleCourseSearch} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
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
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
          </form>

          {/* Right Part: Search by Keyword (~40%) */}
          <form onSubmit={handleKeywordSearch} className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-4 lg:pt-0">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Search by Keyword
              </label>
              <input
                type="text"
                placeholder="Search by Admission no , Student Nam"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STUDENT FEES LIST TABLE                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 text-sm">📋</span>
            <h2 className="font-bold text-slate-800 text-sm">
              Student Fee Records ({records.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
              <tr>
                <th
                  onClick={() => {
                    setSortField('admissionNo');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    ADMISSION NO
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('studentName');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    STUDENT NAME
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  ROLL NO
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  COURSE & SEM
                </th>
                <th
                  onClick={() => {
                    setSortField('totalFees');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    TOTAL (₹)
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right">
                  PAID (₹)
                </th>
                <th
                  onClick={() => {
                    setSortField('balance');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    BALANCE (₹)
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-center">
                  STATUS
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right pr-6">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs font-medium">
                    {loading ? 'Loading...' : 'No fee records found for current criteria'}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-purple-50/30 transition">
                    <td className="px-4 py-3 font-semibold text-[#80229a]">
                      {r.admissionNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{r.studentName}</div>
                      <div className="text-[11px] text-slate-400">{r.fatherName || r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {r.rollNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-700">{r.course}</div>
                      <div className="text-[11px] text-slate-400">{r.semester}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      ₹{Number(r.totalFees).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      ₹{Number(r.paidFees).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      ₹{Number(r.balance).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {renderStatus(r.status)}
                    </td>
                    <td className="px-4 py-3 text-right pr-6 whitespace-nowrap">
                      {r.balance > 0 ? (
                        <button
                          onClick={() => openCollect(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <HandCoins className="h-3.5 w-3.5" />
                          Collect Fees
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-lg">
                          ✓ Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
          <p className="text-xs text-slate-500">
            Showing {sortedRecords.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, sortedRecords.length)} of {sortedRecords.length} entries
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                  pg === page
                    ? 'bg-[#80229a] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-purple-50'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer Branding Matching Screenshot ──────────────────── */}
      <div className="text-center text-xs text-slate-400 py-3">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COLLECT PAYMENT MODAL                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showCollectModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#80229a] text-white">
              <div className="flex items-center gap-2">
                <HandCoins className="h-5 w-5" />
                <h3 className="font-bold text-sm md:text-base">Collect Fee Payment</h3>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Student Summary Card */}
            <div className="p-5 bg-purple-50/40 border-b border-purple-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedRecord.studentName}</p>
                <p className="text-slate-500 font-mono mt-0.5">{selectedRecord.admissionNo} • {selectedRecord.course}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Remaining Balance</p>
                <p className="text-rose-600 font-extrabold text-base">₹{selectedRecord.balance.toLocaleString()}</p>
              </div>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                ⚠️ {modalError}
              </div>
            )}

            {/* Payment Form */}
            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount to Collect (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedRecord.balance}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-purple-300 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-800 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] rounded-xl bg-white text-slate-700 outline-none"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={collectDiscount}
                    onChange={(e) => setCollectDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid by father via GooglePay"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Pay & Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ADD STUDENT FEE MODAL                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#80229a] text-white">
              <h3 className="font-bold text-sm md:text-base">Add Student Fee Structure</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student name"
                    value={newFee.studentName}
                    onChange={(e) => setNewFee({ ...newFee, studentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM-2025-05"
                    value={newFee.admissionNo}
                    onChange={(e) => setNewFee({ ...newFee, admissionNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFee.course}
                    onChange={(e) => setNewFee({ ...newFee, course: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFee.semester}
                    onChange={(e) => setNewFee({ ...newFee, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Fees (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newFee.totalFees}
                    onChange={(e) => setNewFee({ ...newFee, totalFees: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newFee.phone}
                    onChange={(e) => setNewFee({ ...newFee, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

