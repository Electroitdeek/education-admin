'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Banknote,
  Search,
  ChevronRight,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const DISCOUNT_ENDPOINT = `${API}/fees-collection/fee-discount`;
const REASONS_ENDPOINT = `${API}/fees-collection/fee-discount/waived-reasons`;

export interface FeeDiscountRecord {
  _id?: string;
  feeType: string;
  name: string;
  discountType: string; // 'Percentage (%)' | 'Fix Amount (₹)'
  amount: number;
  description?: string;
  code?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WaivedOffReasonRecord {
  _id?: string;
  reason: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

const FEES_TYPES = [
  'Caution Money',
  'Tuition Fee',
  'Admission Fee',
  'Exam Fee',
  'Library Fee',
  'Hostel Fee',
  'Laboratory Fee',
  'Transportation Fee',
  'Development Fee',
];

const DISCOUNT_TYPES = ['Percentage (%)', 'Fix Amount (₹)'];

export default function FeeDiscountView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State (Add / Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feeType, setFeeType] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [discountType, setDiscountType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Table State
  const [discounts, setDiscounts] = useState<FeeDiscountRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof FeeDiscountRecord>('feeType');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Waived Off Reasons Modal State
  const [showReasonsModal, setShowReasonsModal] = useState<boolean>(false);
  const [reasons, setReasons] = useState<WaivedOffReasonRecord[]>([]);
  const [newReason, setNewReason] = useState<string>('');
  const [newReasonDesc, setNewReasonDesc] = useState<string>('');
  const [reasonsLoading, setReasonsLoading] = useState<boolean>(false);

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState({
    feeType: true,
    name: true,
    discountType: true,
    amount: true,
    action: true,
  });

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Fetch Discounts
  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(DISCOUNT_ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      } else {
        showAlert('Failed to load discounts', 'error');
      }
    } catch {
      showAlert('Could not connect to API server', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Waived Off Reasons
  const fetchReasons = useCallback(async () => {
    setReasonsLoading(true);
    try {
      const res = await fetch(REASONS_ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setReasons(data);
      }
    } catch {
      console.error('Failed to load waived off reasons');
    } finally {
      setReasonsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
    fetchReasons();
  }, [fetchDiscounts, fetchReasons]);

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeType) {
      showAlert('Please select Fees Type', 'error');
      return;
    }
    if (!name.trim()) {
      showAlert('Please enter Name', 'error');
      return;
    }
    if (!discountType) {
      showAlert('Please select Discount Type', 'error');
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      showAlert('Please enter a valid numeric Amount', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      feeType,
      name: name.trim(),
      discountType,
      amount: Number(amount),
      description: description.trim(),
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`${DISCOUNT_ENDPOINT}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(DISCOUNT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showAlert(
          editingId
            ? `Fee discount "${name}" updated successfully!`
            : `Fee discount "${name}" created successfully!`
        );
        resetForm();
        fetchDiscounts();
      } else {
        showAlert('Failed to save fee discount', 'error');
      }
    } catch {
      showAlert('Network error saving fee discount', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate Form for Editing
  const handleEdit = (rec: FeeDiscountRecord) => {
    if (!rec._id) return;
    setEditingId(rec._id);
    setFeeType(rec.feeType);
    setName(rec.name);
    setDiscountType(rec.discountType);
    setAmount(String(rec.amount));
    setDescription(rec.description || '');
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFeeType('');
    setName('');
    setDiscountType('');
    setAmount('');
    setDescription('');
  };

  // Delete Discount
  const handleDelete = async (id: string, discountName: string) => {
    if (!confirm(`Are you sure you want to delete discount "${discountName}"?`)) return;
    try {
      const res = await fetch(`${DISCOUNT_ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Discount "${discountName}" deleted successfully`);
        if (editingId === id) resetForm();
        fetchDiscounts();
      } else {
        showAlert('Failed to delete discount', 'error');
      }
    } catch {
      showAlert('Error deleting discount', 'error');
    }
  };

  // Add Waived Off Reason
  const handleAddReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;
    try {
      const res = await fetch(REASONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: newReason.trim(),
          description: newReasonDesc.trim(),
        }),
      });
      if (res.ok) {
        showAlert('Waived Off Reason added successfully!');
        setNewReason('');
        setNewReasonDesc('');
        fetchReasons();
      } else {
        showAlert('Failed to add reason', 'error');
      }
    } catch {
      showAlert('Error adding waived off reason', 'error');
    }
  };

  // Delete Waived Off Reason
  const handleDeleteReason = async (id: string, reasonText: string) => {
    if (!confirm(`Delete reason "${reasonText}"?`)) return;
    try {
      const res = await fetch(`${REASONS_ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert('Reason deleted');
        fetchReasons();
      }
    } catch {
      showAlert('Error deleting reason', 'error');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['Fee Type', 'Name', 'Discount Type', 'Amount', 'Description'];
    const rows = discounts.map((d) => [
      `"${d.feeType}"`,
      `"${d.name}"`,
      `"${d.discountType}"`,
      d.amount,
      `"${d.description || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_discounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = discounts
      .map(
        (d, i) =>
          `${i + 1}. [${d.feeType}] ${d.name} - ${
            d.discountType === 'Percentage (%)' ? `${d.amount}%` : `₹${d.amount}`
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Fee discounts copied to clipboard!');
  };

  // Filter & Sort
  const filtered = discounts
    .filter((d) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        d.name.toLowerCase().includes(s) ||
        d.feeType.toLowerCase().includes(s) ||
        d.discountType.toLowerCase().includes(s) ||
        (d.description && d.description.toLowerCase().includes(s))
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

      {/* Top Header matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Bill / Discount Icon matching screenshot */}
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fee Discount</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Fee Discount */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Fee Discount</span>
        </div>
      </div>

      {/* Main 2-Column Split Layout matching Reference Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Add / Edit Fee Discount (approx 4.5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📝</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                {editingId ? 'Edit Fee Discount' : 'Add / Edit Fee Discount'}
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
            {/* Field 1: Fees Type * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fees Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                required
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">select</option>
                {FEES_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Name * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter discount name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
            </div>

            {/* Field 3: Discount Type * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Discount Type<span className="text-rose-500">*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                required
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">Select</option>
                {DISCOUNT_TYPES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Amount * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
            </div>

            {/* Field 5: Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                placeholder=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition resize-y"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3">
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

        {/* Right Column: Fees Discount List (approx 7.5 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          {/* Top Bar of List: Title & "Waived Off Reasons" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📋</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                Fees Discount List
              </h2>
            </div>

            {/* Purple "Waived Off Reasons" Button matching screenshot */}
            <button
              onClick={() => setShowReasonsModal(true)}
              className="px-4 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <span>Waived Off Reasons</span>
            </button>
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

              {/* Column Visibility Dropdown */}
              <div className="relative">
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
                        checked={visibleColumns.feeType}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, feeType: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Fee Type</span>
                    </label>
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.name}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, name: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Name</span>
                    </label>
                    <label className="flex items-center px-3 py-1.5 hover:bg-purple-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.discountType}
                        onChange={(e) =>
                          setVisibleColumns({
                            ...visibleColumns,
                            discountType: e.target.checked,
                          })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Discount Type</span>
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
          <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                  {visibleColumns.feeType && (
                    <th
                      onClick={() => {
                        setSortField('feeType');
                        setSortAsc(!sortAsc);
                      }}
                      className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>FEE TYPE</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th
                      onClick={() => {
                        setSortField('name');
                        setSortAsc(!sortAsc);
                      }}
                      className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>NAME</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.discountType && (
                    <th className="py-3 px-3">DISCOUNT TYPE</th>
                  )}
                  {visibleColumns.amount && <th className="py-3 px-3">AMOUNT</th>}
                  {visibleColumns.action && (
                    <th className="py-3 px-3 text-right">ACTION</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                      <div>Loading fee discounts...</div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
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
                      {visibleColumns.feeType && (
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {rec.feeType}
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="py-3 px-3">
                          <span className="text-[#80229a] font-bold">{rec.name}</span>
                          {rec.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {rec.description}
                            </p>
                          )}
                        </td>
                      )}
                      {visibleColumns.discountType && (
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rec.discountType.includes('Percentage')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {rec.discountType}
                          </span>
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {rec.discountType.includes('Percentage')
                            ? `${rec.amount}%`
                            : `₹${rec.amount.toLocaleString('en-IN')}`}
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(rec)}
                              title="Edit Discount"
                              className="p-1.5 hover:bg-purple-100 text-[#80229a] rounded-md transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rec._id || '', rec.name)}
                              title="Delete Discount"
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Waived Off Reasons Modal */}
      {showReasonsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <h3 className="font-bold text-sm tracking-wide">Waived Off Reasons</h3>
              </div>
              <button
                onClick={() => setShowReasonsModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Add New Reason Form */}
              <form
                onSubmit={handleAddReason}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3"
              >
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                  Add New Waived Off Reason
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reason *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Financial Hardship, Merit"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Optional notes or eligibility criteria"
                      value={newReasonDesc}
                      onChange={(e) => setNewReasonDesc(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Reason</span>
                  </button>
                </div>
              </form>

              {/* Reasons List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700">Existing Waived Off Reasons</h4>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {reasonsLoading ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading reasons...</div>
                  ) : reasons.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No waived off reasons configured yet.
                    </div>
                  ) : (
                    reasons.map((r, i) => (
                      <div
                        key={r._id || i}
                        className="p-3 flex items-center justify-between hover:bg-purple-50/20 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{r.reason}</p>
                          {r.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteReason(r._id || '', r.reason)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition"
                          title="Delete Reason"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReasonsModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Close
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

