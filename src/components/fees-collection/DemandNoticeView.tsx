'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail,
  Search,
  ChevronRight,
  Send,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ArrowUpDown,
  Plus,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/fees-collection/demand-notice`;

export interface DemandNoticeRecord {
  _id?: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  course: string;
  semester: string;
  fatherName?: string;
  phone?: string;
  totalFees?: number;
  paidFees?: number;
  balanceDue: number;
  noticeType?: string;
  noticeDate?: string;
  dueDate?: string;
  status: string; // 'Sent' | 'Pending' | 'Delivered'
  message?: string;
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

const NOTICE_TYPES = [
  '1st Demand Notice',
  '2nd Demand Notice',
  'Final Notice / Defaulter Notice',
  'Hostel Fee Demand Notice',
  'Exam Fee Notice',
  'Custom Demand Notice',
];

export default function DemandNoticeView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Search Criteria State matching Screenshot
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<DemandNoticeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Notifications
  const [printItem, setPrintItem] = useState<DemandNoticeRecord | null>(null);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchNoticeType, setBatchNoticeType] = useState<string>(NOTICE_TYPES[0]);
  const [batchDueDate, setBatchDueDate] = useState<string>('30-10-2026');
  const [batchMessage, setBatchMessage] = useState<string>(
    'Please deposit your pending tuition fees to avoid de-registration and examination hold.'
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch Demand Notices from API
  const fetchRecords = useCallback(
    async (params?: { course?: string; semester?: string; notice?: string; search?: string }) => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (params?.course && params.course !== 'Select Course') q.append('course', params.course);
        if (params?.semester && params.semester !== 'Select Semester') q.append('semester', params.semester);
        if (params?.notice && params.notice !== 'Select') q.append('notice', params.notice);
        if (params?.search?.trim()) q.append('search', params.search.trim());

        const res = await fetch(`${ENDPOINT}?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(Array.isArray(data) ? data : []);
        }
      } catch {
        // API offline
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search Criteria
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords({ course, semester, notice });
  };

  const handleReset = () => {
    setCourse('');
    setSemester('');
    setNotice('');
    fetchRecords();
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r._id!).filter(Boolean));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Send Demand Notice in Batch
  const handleSendBatch = async () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);

    try {
      const res = await fetch(`${ENDPOINT}/send-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          noticeType: batchNoticeType,
          dueDate: batchDueDate,
          message: batchMessage,
        }),
      });

      if (res.ok) {
        setShowBatchModal(false);
        setSuccessToast(`Demand notices successfully dispatched to ${selectedIds.length} students!`);
        setTimeout(() => setSuccessToast(''), 5000);
        setSelectedIds([]);
        fetchRecords({ course, semester, notice });
      }
    } catch {
      alert('Failed to dispatch notices');
    }
    setIsSending(false);
  };

  // Quick Send single notice
  const handleQuickSend = async (record: DemandNoticeRecord) => {
    if (!record._id) return;
    try {
      await fetch(`${ENDPOINT}/send-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [record._id],
          noticeType: record.noticeType || '1st Demand Notice',
          dueDate: record.dueDate || '28-10-2026',
        }),
      });
      setSuccessToast(`Notice sent to ${record.studentName}!`);
      setTimeout(() => setSuccessToast(''), 4000);
      fetchRecords({ course, semester, notice });
    } catch {
      alert('Failed to send notice');
    }
  };

  // Filter
  const filteredRecords = records.filter((r) => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.admissionNo?.toLowerCase().includes(q) ||
      r.fatherName?.toLowerCase().includes(q) ||
      r.course?.toLowerCase().includes(q) ||
      r.noticeType?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Status Badge
  const renderStatus = (status: string) => {
    if (status === 'Sent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Sent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#80229a] text-white flex items-center justify-center shadow-sm">
            <Mail className="h-4 w-4" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Demand Notice
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
          <span className="font-semibold text-slate-800">Demand Notice</span>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successToast}</span>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SELECT CRITERIA CARD (MATCHING USER SCREENSHOT)            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-600" />
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
              Select Criteria
            </h2>
          </div>
          {(course || semester || notice) && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Course * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
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

            {/* Semester * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
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

            {/* Notice * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notice <span className="text-red-500">*</span>
              </label>
              <select
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition appearance-none cursor-pointer"
              >
                <option value="">Select</option>
                {NOTICE_TYPES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STUDENT BALANCE LIST & DISPATCH WORKSPACE                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 text-sm">📋</span>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
              Fee Defaulters List ({records.length})
            </h2>
          </div>

          {/* Mass Action Button */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBatchModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Dispatch Notice ({selectedIds.length})
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] bg-white w-32 md:w-44"
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={records.length > 0 && selectedIds.length === records.length}
                    onChange={toggleSelectAll}
                    className="rounded text-[#80229a] h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 w-10 text-[11px] font-bold text-slate-700">#</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  ADMISSION NO
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  STUDENT NAME
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  FATHER NAME
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  COURSE & SEM
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right">
                  BALANCE DUE (₹)
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  NOTICE TYPE
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
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-medium">
                    {loading ? 'Loading...' : 'No fee defaulter records found'}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => (
                  <tr key={r._id || idx} className="hover:bg-purple-50/30 transition">
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id!)}
                        onChange={() => toggleSelectOne(r._id!)}
                        className="rounded text-[#80229a] h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 text-slate-500 font-mono text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#80229a]">
                      {r.admissionNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{r.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.fatherName || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-700">{r.course}</div>
                      <div className="text-[11px] text-slate-400">{r.semester}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      ₹{Number(r.balanceDue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold text-xs">{r.noticeType || '1st Demand Notice'}</div>
                      {r.dueDate && <div className="text-[11px] text-slate-400">Due: {r.dueDate}</div>}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {renderStatus(r.status)}
                    </td>
                    <td className="px-4 py-3 text-right pr-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickSend(r)}
                          title="Dispatch Demand Notice"
                          className="px-2 py-1 bg-purple-50 text-[#80229a] hover:bg-purple-100 rounded text-xs font-semibold transition cursor-pointer"
                        >
                          Send Notice
                        </button>
                        <button
                          onClick={() => setPrintItem(r)}
                          title="Print Official Notice"
                          className="p-1 text-slate-600 hover:text-[#80229a] hover:bg-purple-50 rounded transition cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
          <p className="text-xs text-slate-500">
            Showing {filteredRecords.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
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
      {/* BATCH SEND DEMAND NOTICE MODAL                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-[#80229a] text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Send className="h-4 w-4" />
                Dispatch Notice to {selectedIds.length} Student(s)
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Demand Notice Type
                </label>
                <select
                  value={batchNoticeType}
                  onChange={(e) => setBatchNoticeType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                >
                  {NOTICE_TYPES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="text"
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Message / Note
                </label>
                <textarea
                  rows={3}
                  value={batchMessage}
                  onChange={(e) => setBatchMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendBatch}
                  className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {isSending ? 'Sending...' : 'Dispatch Notices'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRINT OFFICIAL DEMAND NOTICE PREVIEW                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {printItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#80229a] text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Printer className="h-4 w-4" />
                Official Fee Demand Notice
              </div>
              <button
                onClick={() => setPrintItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="text-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm uppercase text-[#80229a]">
                  GANGAPUR INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
                </h3>
                <p className="text-[11px] text-slate-400">Accounts & Fee Collection Department</p>
                <div className="mt-2 inline-block px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
                  {printItem.noticeType || 'DEMAND NOTICE'}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p><span className="font-semibold text-slate-500">Student Name:</span> {printItem.studentName}</p>
                <p><span className="font-semibold text-slate-500">Father Name:</span> {printItem.fatherName || '—'}</p>
                <p><span className="font-semibold text-slate-500">Admission No:</span> {printItem.admissionNo}</p>
                <p><span className="font-semibold text-slate-500">Course & Semester:</span> {printItem.course} ({printItem.semester})</p>
                <p><span className="font-semibold text-slate-500">Notice Date:</span> {printItem.noticeDate || '17-10-2026'}</p>
                <p><span className="font-semibold text-slate-500">Due Date to Clear:</span> <span className="font-bold text-rose-600">{printItem.dueDate || '25-10-2026'}</span></p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center justify-between font-bold text-sm">
                <span>Total Balance Outstanding:</span>
                <span className="text-rose-600 text-base">₹{Number(printItem.balanceDue).toLocaleString()}</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {printItem.message || 'Please deposit the outstanding tuition and lab fees in the institute accounts office before the due date to ensure uninterrupted academic services and exam eligibility.'}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPrintItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Print Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

