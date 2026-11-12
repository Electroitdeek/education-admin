'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Copy,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Columns,
  Eye,
  X,
  Building,
  Check,
  RefreshCw,
} from 'lucide-react';
import { IncomeItem, IncomeHeadItem } from './AddIncomeView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/income`;

interface Props {
  onNavigate?: (view: string) => void;
}

export default function SearchIncomeView({ onNavigate }: Props) {
  const [items, setItems] = useState<IncomeItem[]>([]);
  const [heads, setHeads] = useState<IncomeHeadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Criteria Filters matching Screenshot media_1793694746346_89c14c8e.jpg
  const [incomeHead, setIncomeHead] = useState('');
  const [dateFrom, setDateFrom] = useState('17-10-2026');
  const [dateTo, setDateTo] = useState('17-10-2026');
  const [searchByIncome, setSearchByIncome] = useState('');

  // Table search & column visibility
  const [tableSearch, setTableSearch] = useState('');
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    incomeHead: true,
    invoiceNumber: true,
    incomeFrom: true,
    amount: true,
    description: true,
    date: true,
    action: true,
  });

  // Voucher Modal
  const [voucherItem, setVoucherItem] = useState<IncomeItem | null>(null);

  // Fetch Heads on mount
  useEffect(() => {
    fetch(`${ENDPOINT}/heads`)
      .then((res) => res.json())
      .then((data) => setHeads(data || []))
      .catch((err) => console.error(err));
  }, []);

  // Search by Criteria (Income Head + Date Form + Date To)
  const handleCriteriaSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (incomeHead && incomeHead !== 'Select' && incomeHead.trim() !== '') {
        params.append('incomeHead', incomeHead.trim());
      }
      if (dateFrom.trim()) {
        params.append('startDate', dateFrom.trim());
      }
      if (dateTo.trim()) {
        params.append('endDate', dateTo.trim());
      }

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Criteria search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Search by Keyword (Search by Income)
  const handleKeywordSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (searchByIncome.trim()) {
        params.append('search', searchByIncome.trim());
      }

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Keyword search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleCriteriaSearch();
  }, []);

  // Filter items in table by quick search
  const filteredItems = items.filter((item) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      item.incomeHead?.toLowerCase().includes(q) ||
      item.invoiceNo?.toLowerCase().includes(q) ||
      item.incomeFrom?.toLowerCase().includes(q) ||
      item.other?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      String(item.amount).includes(q) ||
      item.date?.includes(q)
    );
  });

  const totalAmount = filteredItems.reduce((sum, item) => sum + (item.amount || 0), 0);

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
    a.download = `Income_Search_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb strictly matching Screenshot media_1793694746346_89c14c8e.jpg */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-800" />
          <h1 className="text-xl font-bold text-slate-800">Income Search</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#80229a] flex items-center gap-1">
            <span>💵</span> Income
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Income Search</span>
        </div>
      </div>

      {/* Select Criteria Box matching Reference Screenshot Exact Form Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800">Select Criteria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
          {/* Left Form: Income Head, Date Form, Date To with Search Button (8 Cols) */}
          <form onSubmit={handleCriteriaSearch} className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Income Head */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">
                  Income Head
                </label>
                <select
                  value={incomeHead}
                  onChange={(e) => setIncomeHead(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white text-xs"
                >
                  <option value="">Select</option>
                  {heads.map((h) => (
                    <option key={h._id} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Form (Exact label from Reference Screenshot) */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">
                  Date Form
                </label>
                <input
                  type="text"
                  placeholder="17-10-2026"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs bg-slate-50 font-mono"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">
                  Date To
                </label>
                <input
                  type="text"
                  placeholder="17-10-2026"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs bg-slate-50 font-mono"
                />
              </div>
            </div>

            {/* Criteria Search Button - placed right-aligned under Date To */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Right Form: Search by Keyword with its own Search Button (4 Cols) */}
          <form onSubmit={handleKeywordSearch} className="md:col-span-4 md:border-l md:border-slate-100 md:pl-6 space-y-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by Income"
                value={searchByIncome}
                onChange={(e) => setSearchByIncome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs"
              />
            </div>

            {/* Keyword Search Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Income Search Results Table */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header & Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Income List</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-bold">
                {filteredItems.length} records
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Total: ₹{totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export Toolbar */}
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
                onClick={() => window.print()}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Print List"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Column Visibility Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility</span>
                </button>
                {showColMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 space-y-1 text-xs">
                    {Object.entries(visibleColumns).map(([col, val]) => (
                      <label
                        key={col}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer capitalize"
                      >
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

              {/* Quick Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in table..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] w-36 sm:w-44"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.incomeHead && <th className="py-3 px-4">INCOME HEAD</th>}
                  {visibleColumns.invoiceNumber && <th className="py-3 px-4">INVOICE NUMBER</th>}
                  {visibleColumns.incomeFrom && <th className="py-3 px-4">INCOME FROM</th>}
                  {visibleColumns.amount && <th className="py-3 px-4 text-right">AMOUNT</th>}
                  {visibleColumns.description && <th className="py-3 px-4">DESCRIPTION</th>}
                  {visibleColumns.date && <th className="py-3 px-4">DATE</th>}
                  {visibleColumns.action && <th className="py-3 px-4 text-center">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Searching income records...</span>
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
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {row.incomeHead}
                        </td>
                      )}
                      {visibleColumns.invoiceNumber && (
                        <td className="py-3 px-4 font-mono font-bold text-[#80229a]">
                          #{row.invoiceNo}
                        </td>
                      )}
                      {visibleColumns.incomeFrom && (
                        <td className="py-3 px-4 text-slate-700">
                          {row.incomeFrom === 'Other' && row.other
                            ? row.other
                            : row.incomeFrom}
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          ₹{row.amount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={row.description}>
                          {row.description || '-'}
                        </td>
                      )}
                      {visibleColumns.date && (
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {row.date}
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setVoucherItem(row)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="View Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
      )}

      {/* Official Income Voucher Modal */}
      {voucherItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#80229a]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Official Income Credit Voucher
                </h3>
              </div>
              <button
                onClick={() => setVoucherItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-3 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#80229a] uppercase tracking-wide">
                  Gangapur Institute of Nursing and Paramedical Sciences
                </h2>
                <p className="text-[10px] text-slate-500">
                  Accounts & Finance Directorate
                </p>
                <span className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                  CREDIT VOUCHER #{voucherItem.invoiceNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Invoice No</span>
                  <span className="font-mono font-bold text-[#80229a]">#{voucherItem.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date</span>
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
                  <span className="text-slate-400 block text-[10px] uppercase">Account</span>
                  <span className="font-medium text-slate-700">{voucherItem.accountName || 'SBI College A/c'}</span>
                </div>
              </div>

              {voucherItem.description && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Description</span>
                  <p className="text-slate-700 mt-0.5">{voucherItem.description}</p>
                </div>
              )}

              <div className="bg-purple-50 rounded-xl p-3 flex items-center justify-between border border-purple-100">
                <span className="text-xs font-semibold text-slate-600">Total Credited Amount</span>
                <span className="text-lg font-bold text-[#80229a]">
                  ₹{voucherItem.amount.toLocaleString()}
                </span>
              </div>
            </div>

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
