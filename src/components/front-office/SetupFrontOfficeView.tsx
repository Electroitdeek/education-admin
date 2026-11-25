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
  Edit2,
  Trash2,
  ChevronRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/front-office/front-office-setup`;

export interface SetupItem {
  _id?: string;
  type: string;
  name: string;
  description?: string;
  key?: string;
  isActive?: boolean;
  createdAt?: string;
}

const TABS = [
  { id: 'purpose', label: 'Purpose', singular: 'Purpose' },
  { id: 'complain_type', label: 'Complain Type', singular: 'Complain Type' },
  { id: 'source', label: 'Source', singular: 'Source' },
  { id: 'reference', label: 'Reference', singular: 'Reference' },
  { id: 'enquiry_status', label: 'Enquiry Status', singular: 'Enquiry Status' },
];

export default function SetupFrontOfficeView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState<string>('purpose');
  const [items, setItems] = useState<SetupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Table State
  const [search, setSearch] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Column Visibility
  const [showColMenu, setShowColMenu] = useState<boolean>(false);
  const [visibleCols, setVisibleCols] = useState<{ name: boolean; description: boolean }>({
    name: true,
    description: false,
  });

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  // Fetch Items for active tab
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}?type=${activeTab}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => []);
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch {
      // API error or offline
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
    setEditingId(null);
    setName('');
    setDescription('');
    setFormError('');
    setSuccessMsg('');
    setPage(1);
    setSearch('');
    setOpenActionId(null);
  }, [activeTab, fetchItems]);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenActionId(null);
      setShowColMenu(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(`Please enter ${currentTab.singular}`);
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${ENDPOINT}/${editingId}` : ENDPOINT;
      const method = editingId ? 'PATCH' : 'POST';

      const payload = {
        type: activeTab,
        name: name.trim(),
        description: description.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res) {
        throw new Error('Backend API server on port 5000 is not reachable.');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to save ${currentTab.singular}`);
      }

      setSuccessMsg(`${currentTab.singular} ${editingId ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setName('');
      setDescription('');
      setEditingId(null);
      fetchItems();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
    setSaving(false);
  };

  // Edit item
  const handleEdit = (item: SetupItem) => {
    setEditingId(item._id || null);
    setName(item.name || '');
    setDescription(item.description || '');
    setFormError('');
    setSuccessMsg('');
    setOpenActionId(null);
  };

  // Cancel Edit
  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFormError('');
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${currentTab.singular}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' }).catch(() => null);
      if (res && res.ok) {
        fetchItems();
        if (editingId === id) handleCancel();
      }
    } catch {
      alert('Failed to delete item');
    }
  };

  // Filter & Sort
  const filteredItems = items
    .filter((item) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const valA = (a.name || '').toLowerCase();
      const valB = (b.name || '').toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  // Export Tools
  const copyToClipboard = () => {
    const text = filteredItems.map((i, idx) => `${idx + 1}\t${i.name}\t${i.description || ''}`).join('\n');
    navigator.clipboard.writeText(`${currentTab.singular.toUpperCase()}\tDESCRIPTION\n${text}`);
    alert('Copied to clipboard!');
  };

  const exportCSV = () => {
    const header = [currentTab.singular.toUpperCase(), 'DESCRIPTION'];
    const rows = filteredItems.map((i) => [`"${i.name}"`, `"${i.description || ''}"`]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-list.csv`;
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* ─── Breadcrumb & Title Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            Setup Front Office
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-[#80229a] transition cursor-pointer"
          >
            💼 Front Office
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Setup Front Office</span>
        </div>
      </div>

      {/* ─── Top Setup Navigation Tabs ───────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 pt-3 flex items-center gap-6 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#80229a] text-[#80229a]'
                  : 'border-transparent text-slate-500 hover:text-[#80229a]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* ─── 2-Column Main Workspace ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ─── Left Column: Add / Edit Form (~40%) ──────────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-slate-700 stroke-current"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <h2 className="font-bold text-slate-800 text-sm">
                {editingId ? `Edit ${currentTab.singular}` : `Add ${currentTab.singular}`}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {formError && (
            <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {currentTab.singular} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={`Enter ${currentTab.singular}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 placeholder-slate-400 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:border-[#80229a] focus:ring-1 focus:ring-[#80229a]/20 rounded-xl bg-white text-slate-700 outline-none resize-y transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Right Column: List Table (~60%) ─────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📑</span>
              <h2 className="font-bold text-slate-800 text-sm">
                {currentTab.singular} List
              </h2>
            </div>
          </div>

          {/* Table Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
            {/* Left Action Buttons: Copy, CSV, Print, Column Visibility */}
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
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#80229a] hover:bg-[#68167f] rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Column visibility
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showColMenu && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1">
                    <label className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-purple-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleCols.description}
                        onChange={() =>
                          setVisibleCols((c) => ({ ...c, description: !c.description }))
                        }
                        className="rounded text-[#80229a] h-3.5 w-3.5"
                      />
                      Description
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Search:</span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#80229a] bg-white w-32 md:w-44"
                placeholder=""
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fef2f2] text-slate-700 border-b border-pink-100">
                <tr>
                  <th
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {currentTab.singular.toUpperCase()}
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  {visibleCols.description && (
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      DESCRIPTION
                    </th>
                  )}
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 text-right pr-6">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.description ? 3 : 2}
                      className="py-10 text-center text-slate-400 text-xs"
                    >
                      {loading ? 'Loading...' : 'No data available in table'}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item._id} className="hover:bg-purple-50/30 transition">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.name}
                      </td>
                      {visibleCols.description && (
                        <td className="px-4 py-3 text-slate-500">
                          {item.description || '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right pr-6 relative">
                        <div
                          className="inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() =>
                              setOpenActionId(openActionId === item._id ? null : item._id!)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                          >
                            Action
                            <ChevronDown className="h-3 w-3" />
                          </button>

                          {openActionId === item._id && (
                            <div className="absolute right-6 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left">
                              <button
                                onClick={() => handleEdit(item)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#80229a] transition cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3 text-blue-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id!)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
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
              Showing {filteredItems.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredItems.length)} of {filteredItems.length} entries
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
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
                className="px-2 py-1 text-slate-600 hover:text-[#80229a] disabled:opacity-40 disabled:hover:text-slate-600 font-medium transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

