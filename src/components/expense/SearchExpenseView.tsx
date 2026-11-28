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
import { ExpenseItem, ExpenseHeadItem } from './AddExpenseView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/expense`;

interface Props {
  onNavigate?: (view: string) => void;
}

export default function SearchExpenseView({ onNavigate }: Props) {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [heads, setHeads] = useState<ExpenseHeadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Filters
  const [expenseHead, setExpenseHead] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchByExpense, setSearchByExpense] = useState('');

  // Table
  const [tableSearch, setTableSearch] = useState('');
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    expenseHead: true,
    invoiceNumber: true,
    expenseFrom: true,
    amount: true,
    description: true,
    date: true,
    action: true,
  });

  const [voucherItem, setVoucherItem] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    fetch(`${ENDPOINT}/heads`)
      .then((res) => res.json())
      .then((data) => setHeads(data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleCriteriaSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (expenseHead && expenseHead !== 'Select' && expenseHead.trim() !== '') {
        params.append('expenseHead', expenseHead.trim());
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCriteria = () => {
    setExpenseHead('');
    setDateFrom('');
    setDateTo('');
    setLoading(true);
    fetch(ENDPOINT)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleKeywordSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (searchByExpense.trim()) {
        params.append('search', searchByExpense.trim());
      }

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCriteriaSearch();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      item.expenseHead?.toLowerCase().includes(q) ||
      item.invoiceNo?.toLowerCase().includes(q) ||
      item.expenseFrom?.toLowerCase().includes(q) ||
      item.other?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      String(item.amount).includes(q) ||
      item.date?.includes(q)
    );
  });

  const totalAmount = filteredItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleCopy = () => {
    if (!filteredItems.length) return;
    const header = 'EXPENSE HEAD\tINVOICE NUMBER\tEXPENSE FROM\tAMOUNT\tDESCRIPTION\tDATE\n';
    const body = filteredItems
      .map(
        (i) =>
          `${i.expenseHead}\t${i.invoiceNo}\t${i.expenseFrom === 'Other' ? i.other || 'Other' : i.expenseFrom}\t₹${i.amount}\t${i.description || '-'}\t${i.date}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredItems.length) return;
    const header = 'Expense Head,Invoice Number,Expense From,Amount,Description,Date,Payment Mode\n';
    const body = filteredItems
      .map(
        (i) =>
          `"${i.expenseHead}","${i.invoiceNo}","${i.expenseFrom === 'Other' ? i.other || 'Other' : i.expenseFrom}",${i.amount},"${(i.description || '').replace(/"/g, '""')}","${i.date}","${i.paymentMode}"`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expense_Search_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-800" />
          <h1 className="text-xl font-bold text-slate-800">Expense Search</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#80229a] flex items-center gap-1">
            <span>💳</span> Expense
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Expense Search</span>
        </div>
      </div>

      {/* Select Criteria Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800">Select Criteria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
          <form onSubmit={handleCriteriaSearch} className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1.5">
                  Expense Head
                </label>
                <select
                  value={expenseHead}
                  onChange={(e) => setExpenseHead(e.target.value)}
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

              {/* Date From (Interactive Date Picker) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-600 text-xs">
                    Date From
                  </label>
                  {dateFrom && (
                    <button
                      type="button"
                      onClick={() => setDateFrom('')}
                      className="text-[10px] text-purple-600 hover:text-rose-500 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onClick={(e) => (e.currentTarget as any).showPicker?.()}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs bg-white text-slate-700 cursor-pointer shadow-sm"
                />
              </div>

              {/* Date To (Interactive Date Picker) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-600 text-xs">
                    Date To
                  </label>
                  {dateTo && (
                    <button
                      type="button"
                      onClick={() => setDateTo('')}
                      className="text-[10px] text-purple-600 hover:text-rose-500 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onClick={(e) => (e.currentTarget as any).showPicker?.()}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs bg-white text-slate-700 cursor-pointer shadow-sm"
                />
              </div>
            </div>

            {/* Criteria Search & Reset Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {(expenseHead || dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={handleResetCriteria}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition"
                >
                  Reset
                </button>
              )}
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

          <form onSubmit={handleKeywordSearch} className="md:col-span-4 md:border-l md:border-slate-100 md:pl-6 space-y-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by Expense"
                value={searchByExpense}
                onChange={(e) => setSearchByExpense(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] text-xs"
              />
            </div>

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

      {/* Results Table */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Expense List</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-bold">
                {filteredItems.length} records
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Total: ₹{totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Copy"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Excel"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[#80229a] hover:bg-purple-100 transition"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.expenseHead && <th className="py-3 px-4">EXPENSE HEAD</th>}
                  {visibleColumns.invoiceNumber && <th className="py-3 px-4">INVOICE NUMBER</th>}
                  {visibleColumns.expenseFrom && <th className="py-3 px-4">EXPENSE FROM</th>}
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
                        <span>Searching expense records...</span>
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
                      {visibleColumns.expenseHead && (
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {row.expenseHead}
                        </td>
                      )}
                      {visibleColumns.invoiceNumber && (
                        <td className="py-3 px-4 font-mono font-bold text-[#80229a]">
                          #{row.invoiceNo}
                        </td>
                      )}
                      {visibleColumns.expenseFrom && (
                        <td className="py-3 px-4 text-slate-700">
                          {row.expenseFrom === 'Other' && row.other
                            ? row.other
                            : row.expenseFrom}
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3 px-4 text-right font-bold text-rose-700">
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
        </div>
      )}
    </div>
  );
}

