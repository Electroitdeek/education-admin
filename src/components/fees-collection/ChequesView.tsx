'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  ChevronRight,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/fees-collection/cheques`;

export interface ChequeRecord {
  _id?: string;
  student: string;
  admissionNo?: string;
  chequeNo: string;
  bankName: string;
  amount: number;
  chequeDate: string;
  status: string; // 'Pending' | 'Deposited' | 'Cleared' | 'Bounced'
  depositDate?: string;
  clearDate?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COMMON_BANKS = [
  'State Bank of India',
  'Punjab National Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Bank of Baroda',
  'Axis Bank',
  'Canara Bank',
  'Union Bank of India',
];

const PREDEFINED_STUDENTS = [
  'Pooja Verma (ADM-2025-01)',
  'Rahul Sharma (ADM-2025-02)',
  'Deepak Meena (ADM-2025-03)',
  'Anjali Soni (ADM-2025-04)',
  'Surendra Singh Kushwah (ADM-2025-05)',
  'Hemant Kumar Bairwa (ADM-2025-06)',
  'Rekha Gurjar (ADM-2025-07)',
  'Vikas Jangid (ADM-2025-08)',
];

export default function ChequesView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State matching screenshot
  const [editingId, setEditingId] = useState<string | null>(null);
  const [student, setStudent] = useState<string>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [showStudentDropdown, setShowStudentDropdown] = useState<boolean>(false);
  const [chequeNo, setChequeNo] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>('');
  const [status, setStatus] = useState<string>('Pending');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Table State
  const [cheques, setCheques] = useState<ChequeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof ChequeRecord>('chequeDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Action Dropdown open ID
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Column Visibility
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState({
    student: true,
    chequeNo: true,
    bankName: true,
    amount: true,
    date: true,
    status: true,
    action: true,
  });

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Close dropdowns when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenActionId(null);
      }
      if (!target.closest('.column-visibility-container')) {
        setShowColumnDropdown(false);
      }
      if (!target.closest('.student-select-container')) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch Cheques from API
  const fetchCheques = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (tableSearch) params.append('search', tableSearch);

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCheques(data);
      } else {
        showAlert('Failed to load cheques', 'error');
      }
    } catch {
      showAlert('Could not connect to API server on port 5000', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tableSearch]);

  useEffect(() => {
    fetchCheques();
    const today = new Date().toISOString().split('T')[0];
    setChequeDate(today);
  }, [fetchCheques]);

  // Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim()) {
      showAlert('Please enter or select a Student', 'error');
      return;
    }
    if (!chequeNo.trim()) {
      showAlert('Please enter Cheque No', 'error');
      return;
    }
    if (!bankName.trim()) {
      showAlert('Please enter Bank Name', 'error');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showAlert('Please enter a valid Amount', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      student: student.trim(),
      chequeNo: chequeNo.trim(),
      bankName: bankName.trim(),
      amount: Number(amount),
      chequeDate: chequeDate || new Date().toISOString().split('T')[0],
      status,
      note: note.trim(),
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`${ENDPOINT}/${editingId}`, {
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
          editingId
            ? `Cheque "${chequeNo}" updated successfully!`
            : `Cheque "${chequeNo}" logged successfully!`
        );
        resetForm();
        fetchCheques();
      } else {
        showAlert('Failed to save cheque record', 'error');
      }
    } catch {
      showAlert('Network error saving cheque', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rec: ChequeRecord) => {
    if (!rec._id) return;
    setEditingId(rec._id);
    setStudent(rec.student);
    setChequeNo(rec.chequeNo);
    setBankName(rec.bankName);
    setAmount(String(rec.amount));
    setChequeDate(rec.chequeDate);
    setStatus(rec.status);
    setNote(rec.note || '');
    setOpenActionId(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setStudent('');
    setChequeNo('');
    setBankName('');
    setAmount('');
    setChequeDate(new Date().toISOString().split('T')[0]);
    setStatus('Pending');
    setNote('');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setOpenActionId(null);
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showAlert(`Status changed to "${newStatus}"`);
        fetchCheques();
      } else {
        showAlert('Failed to update status', 'error');
      }
    } catch {
      showAlert('Network error updating status', 'error');
    }
  };

  const handleDelete = async (id: string, chqNo: string) => {
    setOpenActionId(null);
    if (!confirm(`Are you sure you want to delete Cheque "${chqNo}"?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted Cheque "${chqNo}"`);
        if (editingId === id) resetForm();
        fetchCheques();
      } else {
        showAlert('Failed to delete cheque', 'error');
      }
    } catch {
      showAlert('Error deleting cheque', 'error');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['#', 'Student', 'Cheque No', 'Bank Name', 'Amount (₹)', 'Date', 'Status', 'Note'];
    const rows = cheques.map((c, i) => [
      i + 1,
      `"${c.student}"`,
      `"${c.chequeNo}"`,
      `"${c.bankName}"`,
      c.amount,
      `"${c.chequeDate}"`,
      `"${c.status}"`,
      `"${c.note || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cheques_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = cheques
      .map(
        (c, i) =>
          `${i + 1}. ${c.student} - ${c.chequeNo} (${c.bankName}): ₹${c.amount} [${c.status}] Date: ${c.chequeDate}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Cheque list copied to clipboard!');
  };

  // Filter & Sort
  const filtered = cheques
    .filter((c) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        c.student.toLowerCase().includes(s) ||
        c.chequeNo.toLowerCase().includes(s) ||
        c.bankName.toLowerCase().includes(s) ||
        c.status.toLowerCase().includes(s)
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

  const totalChequeAmount = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const filteredStudents = PREDEFINED_STUDENTS.filter((s) =>
    s.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

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

      {/* Top Header matching reference screenshot: 💵 Cheques & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Bill / Card / Cheque Icon */}
          <div className="text-slate-800">
            <svg
              className="h-5 w-5 fill-slate-800"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12zm-9-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cheques</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Cheques */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Cheques</span>
        </div>
      </div>

      {/* 2-Column Split Layout matching Reference Screenshot Exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Add / Edit Cheque (approx 4.5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📝</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                {editingId ? 'Edit Cheque' : 'Add / Edit Cheque'}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-[#80229a] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Student * matching screenshot */}
            <div className="relative student-select-container">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Search"
                  value={student}
                  onFocus={() => setShowStudentDropdown(true)}
                  onChange={(e) => {
                    setStudent(e.target.value);
                    setStudentSearchTerm(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>

              {/* Student Dropdown / Search list */}
              {showStudentDropdown && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-xs">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-2 text-slate-400">No student matches found</div>
                  ) : (
                    filteredStudents.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setStudent(s);
                          setShowStudentDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-purple-50 hover:text-[#80229a] cursor-pointer transition font-medium text-slate-700"
                      >
                        {s}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Field 2: Cheque No * matching screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cheque No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter Cheque No"
                value={chequeNo}
                onChange={(e) => setChequeNo(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
            </div>

            {/* Field 3: Bank Name * matching screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="bank-options"
                placeholder="Enter Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
              <datalist id="bank-options">
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            {/* Field 4: Amount * matching screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs font-bold text-[#80229a] bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
            </div>

            {/* Additional Field: Cheque Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cheque Date
                </label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                >
                  <option value="Pending">Pending</option>
                  <option value="Deposited">Deposited</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
            </div>

            {/* Field: Description / Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Note
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or installment details"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition resize-y"
              />
            </div>

            {/* Save Button matching screenshot */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Cheque List (approx 7.5 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          {/* Top Bar of List: Title matching screenshot */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📋</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                Cheque List
              </h2>
            </div>
            <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-2.5 py-0.5 rounded-full">
              Total Cheques: ₹{totalChequeAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Export Toolbar & Search Bar matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Export Icons & Column Visibility */}
            <div className="flex items-center gap-2 flex-wrap">
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#80229a]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Deposited">Deposited</option>
                <option value="Cleared">Cleared</option>
                <option value="Bounced">Bounced</option>
              </select>

              {/* Column Visibility Dropdown */}
              <div className="relative column-visibility-container">
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#80229a] text-white text-xs font-semibold rounded-lg hover:bg-[#68167f] transition shadow-sm"
                >
                  <span>Column visibility</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {showColumnDropdown && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 text-xs">
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.student}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, student: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Student</span>
                    </label>
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.chequeNo}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, chequeNo: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Cheque No</span>
                    </label>
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.bankName}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, bankName: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Bank Name</span>
                    </label>
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.amount}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, amount: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Amount</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Search Input matching screenshot */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Search:</span>
              <input
                type="text"
                placeholder=""
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-48 sm:w-56"
              />
            </div>
          </div>

          {/* Data Table matching screenshot soft pink headers */}
          <div className="border border-slate-100 rounded-xl overflow-visible shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                  {visibleColumns.student && (
                    <th
                      onClick={() => {
                        setSortField('student');
                        setSortAsc(!sortAsc);
                      }}
                      className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>STUDENT</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.chequeNo && (
                    <th className="py-3 px-3">CHEQUE NO</th>
                  )}
                  {visibleColumns.bankName && (
                    <th className="py-3 px-3">BANK NAME</th>
                  )}
                  {visibleColumns.amount && (
                    <th className="py-3 px-3">AMOUNT</th>
                  )}
                  {visibleColumns.date && (
                    <th className="py-3 px-3">DATE</th>
                  )}
                  {visibleColumns.status && (
                    <th className="py-3 px-3 text-center">STATUS</th>
                  )}
                  {visibleColumns.action && (
                    <th className="py-3 px-3 text-right">ACTION</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                      <div>Loading cheque records...</div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginated.map((rec) => (
                    <tr
                      key={rec._id}
                      className={`hover:bg-purple-50/30 transition ${
                        editingId === rec._id ? 'bg-purple-50/60' : ''
                      }`}
                    >
                      {visibleColumns.student && (
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div>
                            <span className="text-[#80229a] font-bold">{rec.student}</span>
                            {rec.note && (
                              <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                                {rec.note}
                              </p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.chequeNo && (
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {rec.chequeNo}
                        </td>
                      )}
                      {visibleColumns.bankName && (
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {rec.bankName}
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3 px-3 font-bold text-slate-800">
                          ₹{rec.amount.toLocaleString('en-IN')}
                        </td>
                      )}
                      {visibleColumns.date && (
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {rec.chequeDate}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              rec.status === 'Cleared'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : rec.status === 'Deposited'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : rec.status === 'Bounced'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3 px-3 text-right">
                          <div className="relative inline-block text-left action-dropdown-container">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(openActionId === rec._id ? null : rec._id || '')
                              }
                              className="px-3 py-1 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-md shadow-sm transition inline-flex items-center gap-1.5"
                            >
                              <span>Action</span>
                              <span className="text-[9px]">▾</span>
                            </button>

                            {openActionId === rec._id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1.5 animate-scale-up">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(rec)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#80229a] flex items-center gap-2 font-medium"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-[#80229a]" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(rec._id || '', 'Cleared')}
                                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Mark Cleared</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(rec._id || '', 'Bounced')}
                                  className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Mark Bounced</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(rec._id || '', rec.chequeNo)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Showing X to Y entries & Pagination matching screenshot */}
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
      </div>

      {/* Footer matching screenshot */}
      <div className="text-center pt-8 pb-4 text-xs text-white/90 drop-shadow-sm font-medium">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </div>
    </div>
  );
}

