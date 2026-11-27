'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const MASTER_ENDPOINT = `${API}/fees-collection/fee-master`;
const TYPES_ENDPOINT = `${API}/fees-collection/fee-master/fee-types`;

export interface FeeMasterRecord {
  _id?: string;
  feesGroup: string;
  batch: string;
  feesType: string;
  amount: number;
  dateOfMonth: number;
  month: string;
  fineType?: string;
  fineAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeTypeItem {
  _id?: string;
  name: string;
  code?: string;
  description?: string;
}

const DEFAULT_FEES_GROUPS = [
  'B.Sc. Nursing 2025-26',
  'GNM 1st Year Group',
  'ANM 1st Year Group',
  'Post Basic B.Sc. Group',
  'DMLT Paramedical Group',
  'DRT Radiology Group',
  'Campus Hostel Group',
  'Transport Services Group',
];

const DEFAULT_BATCHES = [
  '2025-2026',
  '2024-2025',
  '2023-2024',
  '2022-2023',
];

const MONTHS = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'Annual',
  'Quarterly',
  'Semester 1',
  'Semester 2',
];

export default function FeeMasterView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Active Tab: 'create' | 'structure'
  const [activeTab, setActiveTab] = useState<'create' | 'structure'>('create');

  // Form State matching screenshot
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feesGroup, setFeesGroup] = useState<string>('');
  const [batch, setBatch] = useState<string>('');
  const [feesType, setFeesType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dateOfMonth, setDateOfMonth] = useState<string>('10');
  const [month, setMonth] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic Fee Types from API
  const [feeTypesList, setFeeTypesList] = useState<FeeTypeItem[]>([]);
  const [showAddTypeModal, setShowAddTypeModal] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState<string>('');
  const [newTypeCode, setNewTypeCode] = useState<string>('');
  const [newTypeDesc, setNewTypeDesc] = useState<string>('');

  // Fee Structure List State
  const [masterList, setMasterList] = useState<FeeMasterRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');
  const [sortField, setSortField] = useState<keyof FeeMasterRecord>('feesGroup');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Fetch Fee Types
  const fetchFeeTypes = useCallback(async () => {
    try {
      const res = await fetch(TYPES_ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setFeeTypesList(data);
      }
    } catch {
      console.error('Failed to load fee types');
    }
  }, []);

  // Fetch Fee Master Records
  const fetchMasters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterGroup && filterGroup !== 'Select') params.append('feesGroup', filterGroup);
      if (filterBatch && filterBatch !== 'Select') params.append('batch', filterBatch);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${MASTER_ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMasterList(data);
      } else {
        showAlert('Failed to load fee masters', 'error');
      }
    } catch {
      showAlert('Could not connect to API server on port 3045', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterBatch, searchQuery]);

  useEffect(() => {
    fetchFeeTypes();
    fetchMasters();
  }, [fetchFeeTypes, fetchMasters]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feesGroup || feesGroup === 'Select') {
      showAlert('Please select Fees Group', 'error');
      return;
    }
    if (!batch || batch === 'Select') {
      showAlert('Please select Batch', 'error');
      return;
    }
    if (!feesType || feesType === 'Select') {
      showAlert('Please select Fees Type', 'error');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showAlert('Please enter a valid Amount', 'error');
      return;
    }
    if (!dateOfMonth || isNaN(Number(dateOfMonth))) {
      showAlert('Please enter Date Of Month (1 to 31)', 'error');
      return;
    }
    if (!month || month === 'Select') {
      showAlert('Please select Month', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      feesGroup,
      batch,
      feesType,
      amount: Number(amount),
      dateOfMonth: Number(dateOfMonth),
      month,
      status: 'Active',
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`${MASTER_ENDPOINT}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(MASTER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showAlert(
          editingId
            ? `Fee Master for "${feesType}" updated successfully!`
            : `Fee Master entry for "${feesType}" created successfully!`
        );
        resetForm();
        fetchMasters();
        setActiveTab('structure');
      } else {
        showAlert('Failed to save Fee Master record', 'error');
      }
    } catch {
      showAlert('Network error saving record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rec: FeeMasterRecord) => {
    if (!rec._id) return;
    setEditingId(rec._id);
    setFeesGroup(rec.feesGroup);
    setBatch(rec.batch);
    setFeesType(rec.feesType);
    setAmount(String(rec.amount));
    setDateOfMonth(String(rec.dateOfMonth));
    setMonth(rec.month);
    setActiveTab('create');
  };

  const resetForm = () => {
    setEditingId(null);
    setFeesGroup('');
    setBatch('');
    setFeesType('');
    setAmount('');
    setDateOfMonth('10');
    setMonth('');
  };

  const handleDelete = async (id: string, typeName: string) => {
    if (!confirm(`Are you sure you want to delete Fee Master entry for "${typeName}"?`)) return;
    try {
      const res = await fetch(`${MASTER_ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted Fee Master entry for ${typeName}`);
        if (editingId === id) resetForm();
        fetchMasters();
      } else {
        showAlert('Failed to delete', 'error');
      }
    } catch {
      showAlert('Error deleting record', 'error');
    }
  };

  // Add New Fee Type Modal Handler
  const handleCreateNewType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      const res = await fetch(TYPES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTypeName.trim(),
          code: newTypeCode.trim().toUpperCase(),
          description: newTypeDesc.trim(),
        }),
      });
      if (res.ok) {
        const created = await res.json();
        showAlert(`New Fee Type "${created.name}" added successfully!`);
        await fetchFeeTypes();
        setFeesType(created.name);
        setShowAddTypeModal(false);
        setNewTypeName('');
        setNewTypeCode('');
        setNewTypeDesc('');
      } else {
        showAlert('Failed to add fee type', 'error');
      }
    } catch {
      showAlert('Error saving new fee type', 'error');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['#', 'Fees Group', 'Batch', 'Fees Type', 'Amount (₹)', 'Date of Month', 'Month', 'Status'];
    const rows = masterList.map((m, i) => [
      i + 1,
      `"${m.feesGroup}"`,
      `"${m.batch}"`,
      `"${m.feesType}"`,
      m.amount,
      m.dateOfMonth,
      `"${m.month}"`,
      `"${m.status || 'Active'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_master_structure_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = masterList
      .map(
        (m, i) =>
          `${i + 1}. [${m.feesGroup} | ${m.batch}] ${m.feesType}: ₹${m.amount} (Due: Day ${m.dateOfMonth}, ${m.month})`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Fee structure copied to clipboard!');
  };

  // Filtered & Sorted Master List
  const filtered = masterList
    .filter((m) => {
      if (!searchQuery) return true;
      const s = searchQuery.toLowerCase();
      return (
        m.feesGroup.toLowerCase().includes(s) ||
        m.batch.toLowerCase().includes(s) ||
        m.feesType.toLowerCase().includes(s) ||
        m.month.toLowerCase().includes(s)
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

  const totalFeeSum = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);

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

      {/* Header matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Bill / Currency Icon */}
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fee Master</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Fee Master */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Fee Master</span>
        </div>
      </div>

      {/* Main Container Card matching screenshot */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {/* Top Tabs: "Create Fee" & "Fee Structure" matching screenshot */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`text-xs font-bold pb-2 transition relative ${
              activeTab === 'create'
                ? 'text-[#80229a] border-b-2 border-[#80229a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Fee
          </button>
          <button
            onClick={() => {
              setActiveTab('structure');
              fetchMasters();
            }}
            className={`text-xs font-bold pb-2 transition relative ${
              activeTab === 'structure'
                ? 'text-[#80229a] border-b-2 border-[#80229a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Fee Structure ({masterList.length})
          </button>
        </div>

        {/* TAB 1: CREATE FEE matching Reference Screenshot */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Fees Group *, Batch *, + Add New Fee Type */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              {/* Fees Group * (approx 5 cols) */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fees Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={feesGroup}
                  onChange={(e) => setFeesGroup(e.target.value)}
                  required
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                >
                  <option value="">Select</option>
                  {DEFAULT_FEES_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch * (approx 4 cols) */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  required
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                >
                  <option value="">Select</option>
                  {DEFAULT_BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* + Add New Fee Type Button matching screenshot (approx 3 cols) */}
              <div className="md:col-span-3 flex justify-start md:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add New Fee Type</span>
                </button>
              </div>
            </div>

            {/* Row 2: Fees Type *, Amount *, Date Of Month *, Month * matching screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {/* Fees Type * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fees Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={feesType}
                  onChange={(e) => setFeesType(e.target.value)}
                  required
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                >
                  <option value="">Select</option>
                  {feeTypesList.map((t) => (
                    <option key={t._id || t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="Amount.."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>

              {/* Date Of Month * (Day 1-31) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date Of Month <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dateOfMonth}
                  onChange={(e) => setDateOfMonth(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                />
              </div>

              {/* Month * */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Month <span className="text-rose-500">*</span>
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
                >
                  <option value="">Select</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Action Bar matching screenshot */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FEE STRUCTURE TABLE */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            {/* Filter and Export Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-600">Filter Group:</span>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#80229a]"
                >
                  <option value="">All Groups</option>
                  {DEFAULT_FEES_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#80229a]"
                >
                  <option value="">All Batches</option>
                  {DEFAULT_BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-2.5 py-1 rounded-full">
                  Total Fee Configured: ₹{totalFeeSum.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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
                    title="Print Table"
                    className="p-1.5 hover:bg-white/20 rounded transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Search Box */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Search:</span>
                  <input
                    type="text"
                    placeholder="Search structure..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-48"
                  />
                </div>
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
                        setSortField('feesGroup');
                        setSortAsc(!sortAsc);
                      }}
                      className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>FEES GROUP</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3">BATCH</th>
                    <th className="py-3 px-3">FEES TYPE</th>
                    <th className="py-3 px-3">AMOUNT (₹)</th>
                    <th className="py-3 px-3 text-center">DATE OF MONTH</th>
                    <th className="py-3 px-3">MONTH</th>
                    <th className="py-3 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                        <div>Loading fee master structure...</div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                        No fee master structure configured yet. Switch to &ldquo;Create Fee&rdquo; to add entries.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m, idx) => (
                      <tr key={m._id || idx} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-3 text-center text-slate-400 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {m.feesGroup}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {m.batch}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[#80229a] font-bold">{m.feesType}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          ₹{m.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-600">
                          Day {m.dateOfMonth}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            {m.month}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(m)}
                              title="Edit Entry"
                              className="p-1.5 hover:bg-purple-100 text-[#80229a] rounded-md transition"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m._id || '', m.feesType)}
                              title="Delete Entry"
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <div>
                Showing {filtered.length} of {masterList.length} fee master entries
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="text-[#80229a] font-semibold hover:underline"
              >
                + Add Another Fee Component
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add New Fee Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <h3 className="font-bold text-sm tracking-wide">Add New Fee Type</h3>
              </div>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fee Type Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Training Fee, Lab Kit Fee"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CTF, LKF"
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value)}
                  className="w-full text-xs font-mono uppercase border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the fee component"
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Save Fee Type
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

