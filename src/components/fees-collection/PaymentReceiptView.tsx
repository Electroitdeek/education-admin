'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  Copy,
  Printer,
  Download,
  Eye,
  ChevronDown,
  ArrowUpDown,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/fees-collection/payment-receipt`;

export interface PaymentReceiptRecord {
  _id?: string;
  receiptNo: string;
  name: string;
  duration?: string;
  collectedBy?: string;
  status: string; // 'Paid' | 'Cancel'
  cancelReason?: string;
  canceledBy?: string;
  canceledOn?: string;
  date: string;
  amount: number;
  discount?: number;
  additionDiscount?: number;
  paymentMode?: string;
  note?: string;
  createdAt?: string;
}

const ALL_COLUMNS = [
  { key: 'receiptNo', label: 'RECEIPT NO' },
  { key: 'name', label: 'NAME' },
  { key: 'duration', label: 'DURATION' },
  { key: 'collectedBy', label: 'COLLECTED BY' },
  { key: 'status', label: 'STATUS' },
  { key: 'date', label: 'DATE' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'discount', label: 'DISCOUNT' },
  { key: 'additionDiscount', label: 'ADDITION DISCOUNT' },
];

export default function PaymentReceiptView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Select Criteria Form State
  const [receiptNoQuery, setReceiptNoQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Table State
  const [records, setRecords] = useState<PaymentReceiptRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof PaymentReceiptRecord>('receiptNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Column Visibility
  const [visibleCols, setVisibleCols] = useState<string[]>([
    'receiptNo',
    'name',
    'duration',
    'collectedBy',
    'status',
    'date',
    'amount',
    'discount',
    'additionDiscount',
  ]);
  const [showColMenu, setShowColMenu] = useState<boolean>(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [cancelModalItem, setCancelModalItem] = useState<PaymentReceiptRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('wrong details');
  const [printReceiptItem, setPrintReceiptItem] = useState<PaymentReceiptRecord | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // New Receipt Form
  const [newReceipt, setNewReceipt] = useState<{
    receiptNo: string;
    name: string;
    duration: string;
    collectedBy: string;
    date: string;
    amount: number;
    discount: number;
    additionDiscount: number;
    paymentMode: string;
    note: string;
  }>({
    receiptNo: '',
    name: '',
    duration: 'March',
    collectedBy: 'KULDEEP',
    date: '12-10-2026',
    amount: 25000,
    discount: 0,
    additionDiscount: 0,
    paymentMode: 'Cash',
    note: '',
  });

  // Fetch Payment Receipts from API
  const fetchRecords = useCallback(async (params?: { receiptNo?: string; search?: string }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (params?.receiptNo?.trim()) q.append('receiptNo', params.receiptNo.trim());
      if (params?.search?.trim()) q.append('search', params.search.trim());

      const res = await fetch(`${ENDPOINT}?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch {
      // API error or offline
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Criteria Search
  const handleCriteriaSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords({ receiptNo: receiptNoQuery });
  };

  // Reset Criteria
  const handleReset = () => {
    setReceiptNoQuery('');
    setStartDate('');
    setEndDate('');
    fetchRecords();
  };

  // Close column menu on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Submit New Receipt
  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt.name.trim()) {
      alert('Please enter student name');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReceipt),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSuccessMsg('Payment receipt created successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchRecords();
      }
    } catch {
      alert('Failed to create receipt');
    }
  };

  // Cancel Receipt
  const handleConfirmCancel = async () => {
    if (!cancelModalItem?._id) return;

    try {
      const res = await fetch(`${ENDPOINT}/${cancelModalItem._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelReason,
          canceledBy: 'KULDEEP SHARMA',
        }),
      });

      if (res.ok) {
        setCancelModalItem(null);
        setSuccessMsg(`Receipt #${cancelModalItem.receiptNo} marked as Cancelled.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchRecords();
      }
    } catch {
      alert('Failed to cancel receipt');
    }
  };

  // Sort
  const handleSort = (field: keyof PaymentReceiptRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort
  const filteredRecords = records
    .filter((r) => {
      const q = tableSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        r.receiptNo?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.duration?.toLowerCase().includes(q) ||
        r.collectedBy?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.date?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';
      if (sortField === 'receiptNo' || sortField === 'amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  const toggleCol = (key: string) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Export Tools
  const copyToClipboard = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof PaymentReceiptRecord] as string) || '';
      });
      return [i + 1, ...vals].join('\t');
    });
    navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n'));
    alert('Copied to clipboard!');
  };

  const exportCSV = () => {
    const headers = ['#', ...ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => c.label)];
    const rows = filteredRecords.map((r, i) => {
      const vals = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key)).map((c) => {
        return (r[c.key as keyof PaymentReceiptRecord] as string) || '';
      });
      return [i + 1, ...vals];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'payment-receipts.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#80229a] text-white flex items-center justify-center shadow-sm">
            <FileText className="h-4 w-4" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Payment Receipt
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
          <span className="font-semibold text-slate-800">Payment Receipt</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CARD 1: SELECT CRITERIA (MATCHING SCREENSHOT 1)            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-7 space-y-5">
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
              Add Receipt
            </button>
            {(receiptNoQuery || startDate || endDate) && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleCriteriaSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Receipt No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Receipt No
              </label>
              <input
                type="text"
                placeholder=""
                value={receiptNoQuery}
                onChange={(e) => setReceiptNoQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none transition"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date 📅
              </label>
              <input
                type="text"
                placeholder="Enter Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 placeholder-slate-400 outline-none transition"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date 📅
              </label>
              <input
                type="text"
                placeholder="Enter End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#eef2f8] text-slate-700 placeholder-slate-400 outline-none transition"
              />
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
      {/* CARD 2: PAYMENT RECEIPT LIST (SCREENSHOT 1 & 2)             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 text-sm">📑</span>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
              Payment Receipt List
            </h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
          {/* Left Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={copyToClipboard}
              title="Copy to clipboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={exportCSV}
              title="Export to CSV"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              onClick={handlePrint}
              title="Print"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>

            {/* Column Visibility dropdown */}
            <div className="relative" ref={colMenuRef}>
              <button
                onClick={() => setShowColMenu(!showColMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#80229a] hover:bg-[#68167f] rounded-lg shadow-sm transition cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Column visibility
                <ChevronDown className="h-3 w-3" />
              </button>

              {showColMenu && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Toggle Columns
                  </p>
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-purple-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols.includes(col.key)}
                        onChange={() => toggleCol(col.key)}
                        className="rounded text-[#80229a] h-3.5 w-3.5"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Page Size & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs focus:outline-none focus:border-[#80229a]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

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

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
              <tr>
                <th className="px-3 py-3 w-10 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-1">
                    #
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>

                {visibleCols.includes('receiptNo') && (
                  <th
                    onClick={() => handleSort('receiptNo')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      RECEIPT NO
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('name') && (
                  <th
                    onClick={() => handleSort('name')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      NAME
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('duration') && (
                  <th
                    onClick={() => handleSort('duration')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      DURATION
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('collectedBy') && (
                  <th
                    onClick={() => handleSort('collectedBy')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      COLLECTED BY
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('status') && (
                  <th
                    onClick={() => handleSort('status')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      STATUS
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('date') && (
                  <th
                    onClick={() => handleSort('date')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      DATE
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('amount') && (
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      AMOUNT
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('discount') && (
                  <th
                    onClick={() => handleSort('discount')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      DISCOUNT
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                {visibleCols.includes('additionDiscount') && (
                  <th
                    onClick={() => handleSort('additionDiscount')}
                    className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      ADDITION DISCOUNT
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                )}

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right pr-6">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 2}
                    className="py-12 text-center text-slate-400 text-xs font-medium"
                  >
                    {loading ? 'Loading...' : 'No payment receipts found'}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => {
                  const isCancelled = r.status === 'Cancel';

                  return (
                    <tr
                      key={r._id || idx}
                      className={`hover:bg-purple-50/30 transition ${
                        isCancelled ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* # */}
                      <td className="px-3 py-3 text-slate-500 font-mono text-xs">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* RECEIPT NO */}
                      {visibleCols.includes('receiptNo') && (
                        <td
                          className={`px-3 py-3 font-semibold ${
                            isCancelled ? 'text-red-500 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {r.receiptNo}
                        </td>
                      )}

                      {/* NAME */}
                      {visibleCols.includes('name') && (
                        <td className="px-3 py-3 font-medium text-[#80229a]">
                          {r.name}
                        </td>
                      )}

                      {/* DURATION */}
                      {visibleCols.includes('duration') && (
                        <td className={`px-3 py-3 ${isCancelled ? 'text-red-500' : 'text-slate-600'}`}>
                          {r.duration || '—'}
                        </td>
                      )}

                      {/* COLLECTED BY */}
                      {visibleCols.includes('collectedBy') && (
                        <td className={`px-3 py-3 font-semibold ${isCancelled ? 'text-red-500' : 'text-slate-700'}`}>
                          {r.collectedBy}
                        </td>
                      )}

                      {/* STATUS */}
                      {visibleCols.includes('status') && (
                        <td className="px-3 py-3">
                          {isCancelled ? (
                            <div className="text-[11px] leading-tight text-red-500 font-semibold space-y-0.5">
                              <div>Status : Cancel</div>
                              <div>By : {r.canceledBy || 'KULDEEP SHARMA'}</div>
                              <div>ON : {r.canceledOn || r.date}</div>
                              <div>Reason : {r.cancelReason || 'wrong details'}</div>
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-700 text-xs">
                              {r.status}
                            </span>
                          )}
                        </td>
                      )}

                      {/* DATE */}
                      {visibleCols.includes('date') && (
                        <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                          {r.date}
                        </td>
                      )}

                      {/* AMOUNT */}
                      {visibleCols.includes('amount') && (
                        <td className="px-3 py-3 text-right font-medium text-slate-800">
                          {r.amount}
                        </td>
                      )}

                      {/* DISCOUNT */}
                      {visibleCols.includes('discount') && (
                        <td className="px-3 py-3 text-right text-slate-600">
                          {r.discount ?? 0}
                        </td>
                      )}

                      {/* ADDITION DISCOUNT */}
                      {visibleCols.includes('additionDiscount') && (
                        <td className="px-3 py-3 text-right text-slate-600">
                          {r.additionDiscount ?? 0}
                        </td>
                      )}

                      {/* ACTION */}
                      <td className="px-3 py-3 text-right pr-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setPrintReceiptItem(r)}
                            title="Print / View Receipt"
                            className="p-1 text-slate-600 hover:text-[#80229a] hover:bg-purple-50 rounded transition cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => setCancelModalItem(r)}
                              title="Cancel Receipt"
                              className="px-2 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CANCEL RECEIPT MODAL                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {cancelModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-red-600 text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                Cancel Receipt #{cancelModalItem.receiptNo}
              </div>
              <button
                onClick={() => setCancelModalItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel the payment receipt for{' '}
                <span className="font-bold text-slate-800">{cancelModalItem.name}</span>?
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. wrong details, bounced cheque"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRINT RECEIPT PREVIEW MODAL                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {printReceiptItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#80229a] text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Printer className="h-4 w-4" />
                Payment Receipt #{printReceiptItem.receiptNo}
              </div>
              <button
                onClick={() => setPrintReceiptItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700" id="receipt-print-area">
              <div className="text-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm uppercase text-[#80229a]">
                  ELECTRO INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
                </h3>
                <p className="text-[11px] text-slate-400">Official Student Fee Payment Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-semibold text-slate-500">Receipt No:</span> #{printReceiptItem.receiptNo}</div>
                <div><span className="font-semibold text-slate-500">Date:</span> {printReceiptItem.date}</div>
                <div><span className="font-semibold text-slate-500">Student Name:</span> {printReceiptItem.name}</div>
                <div><span className="font-semibold text-slate-500">Collected By:</span> {printReceiptItem.collectedBy}</div>
                <div><span className="font-semibold text-slate-500">Duration:</span> {printReceiptItem.duration || '—'}</div>
                <div><span className="font-semibold text-slate-500">Payment Mode:</span> {printReceiptItem.paymentMode || 'Cash'}</div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl flex items-center justify-between font-bold text-sm">
                <span>Amount Paid:</span>
                <span className="text-[#80229a]">₹{printReceiptItem.amount.toLocaleString()}</span>
              </div>

              {printReceiptItem.status === 'Cancel' && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200 text-xs">
                  ⚠️ This receipt was cancelled by {printReceiptItem.canceledBy} on {printReceiptItem.canceledOn} (Reason: {printReceiptItem.cancelReason})
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPrintReceiptItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ADD RECEIPT MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#80229a] text-white">
              <h3 className="font-bold text-sm md:text-base">Create Payment Receipt</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student name"
                    value={newReceipt.name}
                    onChange={(e) => setNewReceipt({ ...newReceipt, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receipt No (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={newReceipt.receiptNo}
                    onChange={(e) => setNewReceipt({ ...newReceipt, receiptNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. March, April"
                    value={newReceipt.duration}
                    onChange={(e) => setNewReceipt({ ...newReceipt, duration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collected By
                  </label>
                  <input
                    type="text"
                    value={newReceipt.collectedBy}
                    onChange={(e) => setNewReceipt({ ...newReceipt, collectedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newReceipt.amount}
                    onChange={(e) => setNewReceipt({ ...newReceipt, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newReceipt.date}
                    onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })}
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
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

