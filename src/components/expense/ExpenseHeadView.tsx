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
  ArrowUpDown,
  Edit,
  Trash2,
  Check,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/expense/heads`;

export interface ExpenseHeadItem {
  _id: string;
  name: string;
  amount: number;
  description?: string;
  isActive?: boolean;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ExpenseHeadView({ onNavigate }: Props) {
  const [heads, setHeads] = useState<ExpenseHeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Column Visibility
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    amount: true,
    action: true,
  });

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const fetchHeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setHeads(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch expense heads', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeads();
  }, [fetchHeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an Expense Head.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        amount: Number(amount) || 0,
        description: description.trim(),
      };

      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save expense head');

      setEditingId(null);
      setName('');
      setAmount('');
      setDescription('');
      fetchHeads();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (head: ExpenseHeadItem) => {
    setEditingId(head._id);
    setName(head.name);
    setAmount(String(head.amount || '0'));
    setDescription(head.description || '');
    setOpenActionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setDescription('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Expense Head?')) return;
    try {
      setOpenActionId(null);
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHeads();
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const sortedAndFilteredHeads = useMemo(() => {
    let result = heads.filter(
      (h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(h.amount).includes(searchTerm) ||
        h.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

    return result;
  }, [heads, searchTerm, sortOrder]);

  const handleCopy = () => {
    if (!sortedAndFilteredHeads.length) return;
    const header = 'EXPENSE HEAD\tAMOUNT\tDESCRIPTION\n';
    const body = sortedAndFilteredHeads
      .map((h) => `${h.name}\t${h.amount}\t${h.description || ''}`)
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!sortedAndFilteredHeads.length) return;
    const header = 'Expense Head,Amount,Description\n';
    const body = sortedAndFilteredHeads
      .map((h) => `"${h.name}",${h.amount},"${(h.description || '').replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expense_Heads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl text-[#80229a] font-bold">💳</div>
          <h1 className="text-xl font-bold text-slate-800">Expense Head</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            onClick={() => onNavigate?.('add-expense')}
            className="text-[#80229a] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>💳</span> Expense
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Expense Head</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-[#80229a]" />
              <h2 className="text-sm font-bold text-slate-800">
                {editingId ? 'Edit Expense Head' : 'Add / Edit Expense Head'}
              </h2>
            </div>
            {editingId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Expense Head <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter Expense Head"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Amount
              </label>
              <input
                type="number"
                min="0"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] resize-none"
              />
            </div>

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

        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#80229a]" />
              <h2 className="text-sm font-bold text-slate-800">Expense Head List</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-bold">
              {sortedAndFilteredHeads.length} heads
            </span>
          </div>

          <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 relative">
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
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition ml-1"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility ▾</span>
                </button>
                {showColMenu && (
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 space-y-1 text-xs">
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
                        <span>{col}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] w-36 sm:w-44"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.name && (
                    <th
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="py-3 px-4 cursor-pointer hover:bg-rose-100/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>EXPENSE HEAD</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.amount && <th className="py-3 px-4">AMOUNT</th>}
                  {visibleColumns.action && <th className="py-3 px-4 text-center">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Processing...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedAndFilteredHeads.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredHeads.map((head) => (
                    <tr key={head._id} className="hover:bg-slate-50/80 transition-colors">
                      {visibleColumns.name && (
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {head.name}
                        </td>
                      )}
                      {visibleColumns.amount && (
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {head.amount}
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3.5 px-4 text-center relative">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenActionId(openActionId === head._id ? null : head._id)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#80229a] hover:bg-[#6c1c82] text-white text-[11px] font-semibold transition"
                            >
                              <span>Action</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {openActionId === head._id && (
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(head)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-slate-700 hover:text-[#80229a] flex items-center gap-2"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(head._id)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
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
        </div>
      </div>
    </div>
  );
}

