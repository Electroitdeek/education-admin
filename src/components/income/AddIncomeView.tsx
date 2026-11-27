'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileEdit,
  ListFilter,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  RefreshCw,
  PlusCircle,
  Check,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/income`;

export interface IncomeItem {
  _id: string;
  incomeHead: string;
  accountType: string;
  accountName: string;
  incomeFrom: string;
  other: string;
  invoiceNo: string;
  amount: number;
  date: string;
  paymentMode: string;
  attachDocument?: string;
  description?: string;
  createdAt?: string;
}

export interface IncomeHeadItem {
  _id: string;
  name: string;
  description?: string;
}

const ACCOUNT_TYPES = [
  'Select',
  'Bank Account',
  'Cash Counter',
  'Petty Cash',
  'Digital Wallet',
  'Trust Account',
];

const ACCOUNT_NAMES: Record<string, string[]> = {
  'Bank Account': [
    'SBI General College A/c - 4021',
    'HDFC Campus Development A/c',
    'Union Bank Endowment Fund',
  ],
  'Cash Counter': ['Main Cash Counter', 'Hostel Cash Counter', 'Hospital Reception'],
  'Petty Cash': ['Principal Office Petty Cash', 'Administration Petty Cash'],
  'Digital Wallet': ['College HDFC Merchant UPI', 'Paytm Edu Merchant QR', 'PhonePe Business'],
  'Trust Account': ['Gangapur Educational Trust Core A/c'],
  Select: ['Main Institutional Account'],
};

const INCOME_FROM_OPTIONS = [
  'Other',
  'Student',
  'Staff',
  'External Agency',
  'Government Department',
  'Vendor',
  'Affiliated Hospital',
];

const PAYMENT_MODES = [
  'Select',
  'Cash',
  'Cheque',
  'Online/UPI',
  'Demand Draft',
  'NEFT/RTGS',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function AddIncomeView({ onNavigate }: Props) {
  const [items, setItems] = useState<IncomeItem[]>([]);
  const [heads, setHeads] = useState<IncomeHeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    incomeHead: true,
    invoiceNumber: true,
    incomeFrom: true,
    amount: true,
    description: true,
    date: true,
    action: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Voucher modal state
  const [voucherItem, setVoucherItem] = useState<IncomeItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    incomeHead: '',
    accountType: 'Bank Account',
    accountName: 'SBI General College A/c - 4021',
    incomeFrom: 'Other',
    other: '',
    invoiceNo: '1',
    amount: '',
    date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY
    paymentMode: 'Cash',
    attachDocument: '',
    description: '',
  });

  // Fetch Heads
  const fetchHeads = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINT}/heads`);
      if (res.ok) {
        const data = await res.json();
        setHeads(data || []);
        if (data.length > 0 && !formData.incomeHead) {
          setFormData((prev) => ({ ...prev, incomeHead: data[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch income heads', err);
    }
  }, [formData.incomeHead]);

  // Fetch next invoice number
  const fetchNextInvoice = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINT}/next-invoice`);
      if (res.ok) {
        const data = await res.json();
        if (data.nextInvoice && !editingId) {
          setFormData((prev) => ({ ...prev, invoiceNo: data.nextInvoice }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch next invoice', err);
    }
  }, [editingId]);

  // Fetch Items
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch income records', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeads();
    fetchNextInvoice();
    fetchData();
  }, [fetchHeads, fetchNextInvoice, fetchData]);

  // Form submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.incomeHead || formData.incomeHead === 'Select') {
      alert('Please select an Income Head.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save income record');

      // Reset form
      setEditingId(null);
      setFormData({
        incomeHead: heads[0]?.name || '',
        accountType: 'Bank Account',
        accountName: 'SBI General College A/c - 4021',
        incomeFrom: 'Other',
        other: '',
        invoiceNo: '',
        amount: '',
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        paymentMode: 'Cash',
        attachDocument: '',
        description: '',
      });

      await fetchData();
      await fetchNextInvoice();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Start edit
  const handleEdit = (item: IncomeItem) => {
    setEditingId(item._id);
    setFormData({
      incomeHead: item.incomeHead,
      accountType: item.accountType || 'Bank Account',
      accountName: item.accountName || 'SBI General College A/c - 4021',
      incomeFrom: item.incomeFrom || 'Other',
      other: item.other || '',
      invoiceNo: item.invoiceNo,
      amount: String(item.amount),
      date: item.date,
      paymentMode: item.paymentMode,
      attachDocument: item.attachDocument || '',
      description: item.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      incomeHead: heads[0]?.name || '',
      accountType: 'Bank Account',
      accountName: 'SBI General College A/c - 4021',
      incomeFrom: 'Other',
      other: '',
      invoiceNo: '',
      amount: '',
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      paymentMode: 'Cash',
      attachDocument: '',
      description: '',
    });
    fetchNextInvoice();
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        fetchNextInvoice();
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  // Filtered list
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.incomeHead?.toLowerCase().includes(q) ||
        item.invoiceNo?.toLowerCase().includes(q) ||
        item.incomeFrom?.toLowerCase().includes(q) ||
        item.other?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.paymentMode?.toLowerCase().includes(q) ||
        String(item.amount).includes(q) ||
        item.date?.includes(q)
    );
  }, [items, searchTerm]);

  // Export handlers
  const handleCopy = () => {
    if (!filteredItems.length) return;
    const header = 'INCOME HEAD\tINVOICE NUMBER\tINCOME FROM\tAMOUNT\tDESCRIPTION\tDATE\n';
    const body = filteredItems
      .map(
        (i) =>
          `${i.incomeHead}\t${i.invoiceNo}\t${i.incomeFrom === 'Other' ? i.other || 'Other' : i.incomeFrom}\t₹${i.amount}\t${i.description || '-'}\t${i.date}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredItems.length) return;
    const header = 'Income Head,Invoice Number,Income From,Amount,Description,Date,Payment Mode\n';
    const body = filteredItems
      .map(
        (i) =>
          `"${i.incomeHead}","${i.invoiceNo}","${i.incomeFrom === 'Other' ? i.other || 'Other' : i.incomeFrom}",${i.amount},"${(i.description || '').replace(/"/g, '""')}","${i.date}","${i.paymentMode}"`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Income_List_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic account names
  const currentAccountNames =
    ACCOUNT_NAMES[formData.accountType] || ACCOUNT_NAMES['Bank Account'];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header matching Reference Screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span
              onClick={() => onNavigate?.('dashboard')}
              className="hover:text-[#80229a] cursor-pointer"
            >
              Income
            </span>
            <span>/</span>
            <span className="text-[#80229a] font-semibold">Add Income</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#80229a]">
              <FileEdit className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Add Income</h1>
          </div>
        </div>

        {/* Quick Tabs to other Income sub-modules */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('search-income')}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#80229a] rounded-xl text-xs font-semibold transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Income</span>
          </button>
          <button
            onClick={() => onNavigate?.('income-head')}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-[#80229a] rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Income Head</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add / Edit Income Form (4 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-[#80229a]" />
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? 'Edit Income' : 'Add / Edit Income'}
              </h2>
            </div>
            {editingId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Updating #{formData.invoiceNo}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Income Head * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Income Head <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.incomeHead}
                onChange={(e) => setFormData({ ...formData, incomeHead: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
              >
                <option value="">Select</option>
                {heads.map((h) => (
                  <option key={h._id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Type
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => {
                  const newType = e.target.value;
                  const firstAcc = ACCOUNT_NAMES[newType]?.[0] || '';
                  setFormData({ ...formData, accountType: newType, accountName: firstAcc });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Name
              </label>
              <select
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
              >
                {currentAccountNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Income From * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Income From <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.incomeFrom}
                onChange={(e) => setFormData({ ...formData, incomeFrom: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
              >
                {INCOME_FROM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional 'Other' field as shown in Screenshot media_1793693619301_033864c4.jpg */}
            {formData.incomeFrom === 'Other' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Other <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Other"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                />
              </div>
            )}

            {/* Invoice No. * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Invoice No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="1"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-slate-50 font-mono"
              />
            </div>

            {/* Amount * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Date * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="DD-MM-YYYY"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
              />
            </div>

            {/* Payment Mode * */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Mode <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            {/* Attach Document */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Attach Document
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-[#80229a] text-white rounded-lg hover:bg-[#6c1c82] transition text-xs font-semibold shadow-sm inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, attachDocument: file.name });
                      }
                    }}
                  />
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[160px]">
                  {formData.attachDocument || 'No file chosen'}
                </span>
                {formData.attachDocument && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attachDocument: '' })}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] resize-none"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Income List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#80229a]" />
              <h2 className="text-sm font-bold text-slate-800">Income List</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-bold">
              {filteredItems.length} records
            </span>
          </div>

          {/* Action Toolbar matching Reference Screenshot */}
          <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* Export Icons Toolbar */}
            <div className="flex items-center gap-1 relative">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Copy to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Export as Excel"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Print List"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Column Visibility */}
              <div className="relative">
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition ml-1"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility</span>
                </button>
                {showColMenu && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 space-y-1 text-xs">
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

            {/* Search Input */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Search:</span>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] w-40 sm:w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>
          </div>

          {/* Table matching Screenshot columns */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.incomeHead && <th className="py-3 px-3">INCOME HEAD</th>}
                  {visibleColumns.invoiceNumber && <th className="py-3 px-3">INVOICE NUMBER</th>}
                  {visibleColumns.incomeFrom && <th className="py-3 px-3">INCOME FROM</th>}
                  {visibleColumns.amount && <th className="py-3 px-3 text-right">AMOUNT</th>}
                  {visibleColumns.description && <th className="py-3 px-3">DESCRIPTION</th>}
                  {visibleColumns.date && <th className="py-3 px-3">DATE</th>}
                  {visibleColumns.action && <th className="py-3 px-3 text-center">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Processing...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/80 transition-colors">
                      {visibleColumns.incomeHead && (
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {row.incomeHead}
                        </td>
                      )}
                      {visibleColumns.invoiceNumber && (
                        <td className="py-3 px-3 font-mono font-bold text-[#80229a]">
                          #{row.invoiceNo}
                        </td>
                      )}
                      {visibleColumns.incomeFrom && (
                        <td className="py-3 px-3 text-slate-700">
                          {row.incomeFrom === 'Other' && row.other
                            ? row.other
                            : row.incomeFrom}
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3 px-3 text-right font-bold text-emerald-700">
                          ₹{row.amount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td className="py-3 px-3 text-slate-500 max-w-[180px] truncate" title={row.description}>
                          {row.description || '-'}
                        </td>
                      )}
                      {visibleColumns.date && (
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {row.date}
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setVoucherItem(row)}
                              className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              title="View Voucher"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(row)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Table Footer */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredItems.length ? 1 : 0} to {filteredItems.length} of {filteredItems.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button disabled className="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                Previous
              </button>
              <button className="px-2.5 py-1 rounded bg-[#80229a] text-white font-bold">
                1
              </button>
              <button disabled className="px-2.5 py-1 rounded border border-slate-200 text-slate-300 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Income Receipt / Voucher Modal */}
      {voucherItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#80229a]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Official Income Voucher
                </h3>
              </div>
              <button
                onClick={() => setVoucherItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div className="p-6 space-y-4">
              <div className="text-center pb-3 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#80229a] uppercase tracking-wide">
                  Gangapur Institute of Nursing and Paramedical Sciences
                </h2>
                <p className="text-[10px] text-slate-500">
                  Campus Institutional Revenue & Accounts Division
                </p>
                <span className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                  OFFICIAL CREDIT VOUCHER
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Invoice Number</span>
                  <span className="font-mono font-bold text-[#80229a]">#{voucherItem.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Transaction Date</span>
                  <span className="font-medium text-slate-700">{voucherItem.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Income Head</span>
                  <span className="font-semibold text-slate-800">{voucherItem.incomeHead}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Mode</span>
                  <span className="font-medium text-slate-700">{voucherItem.paymentMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Received From</span>
                  <span className="font-medium text-slate-800">
                    {voucherItem.incomeFrom === 'Other' && voucherItem.other
                      ? voucherItem.other
                      : voucherItem.incomeFrom}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Deposited Into</span>
                  <span className="font-medium text-slate-700">{voucherItem.accountName || 'College Account'}</span>
                </div>
              </div>

              {voucherItem.description && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Description / Remarks</span>
                  <p className="text-slate-700 mt-0.5">{voucherItem.description}</p>
                </div>
              )}

              {/* Amount Highlight */}
              <div className="bg-purple-50 rounded-xl p-3 flex items-center justify-between border border-purple-100">
                <span className="text-xs font-semibold text-slate-600">Total Credited Amount</span>
                <span className="text-lg font-bold text-[#80229a]">
                  ₹{voucherItem.amount.toLocaleString()}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Accountant Signatory</span>
                <span>Principal / Admin Stamp</span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setVoucherItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

