'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
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
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/fees-collection/fee-group`;

export interface FeeGroupRecord {
  _id?: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function FeeGroupView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Form State matching screenshot
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Table State
  const [groups, setGroups] = useState<FeeGroupRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Action Dropdown open ID
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Column Visibility
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    action: true,
  });

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenActionId(null);
      }
      if (!target.closest('.column-visibility-container')) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch Fee Groups from API
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tableSearch) params.append('search', tableSearch);
      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      } else {
        showAlert('Failed to load fee groups', 'error');
      }
    } catch {
      showAlert('Could not connect to API server on port 5000', 'error');
    } finally {
      setLoading(false);
    }
  }, [tableSearch]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Please enter Fee Group Name', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
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
            ? `Fee Group "${name}" updated successfully!`
            : `Fee Group "${name}" created successfully!`
        );
        resetForm();
        fetchGroups();
      } else {
        showAlert('Failed to save fee group', 'error');
      }
    } catch {
      showAlert('Network error saving fee group', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rec: FeeGroupRecord) => {
    if (!rec._id) return;
    setEditingId(rec._id);
    setName(rec.name);
    setDescription(rec.description || '');
    setOpenActionId(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id: string, groupName: string) => {
    setOpenActionId(null);
    if (!confirm(`Are you sure you want to delete Fee Group "${groupName}"?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted Fee Group "${groupName}"`);
        if (editingId === id) resetForm();
        fetchGroups();
      } else {
        showAlert('Failed to delete fee group', 'error');
      }
    } catch {
      showAlert('Error deleting fee group', 'error');
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['#', 'Name', 'Description'];
    const rows = groups.map((g, i) => [
      i + 1,
      `"${g.name}"`,
      `"${g.description || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_groups_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Fee group list copied to clipboard!');
  };

  // Filtered & Sorted
  const filtered = groups
    .filter((g) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        g.name.toLowerCase().includes(s) ||
        (g.description && g.description.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
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

      {/* Top Header matching reference screenshot: 👥 Fee Group & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Group Icon matching screenshot */}
          <div className="text-slate-800">
            <Users className="h-5 w-5 text-slate-800" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fee Group</h1>
        </div>

        {/* Breadcrumb matching screenshot: 👛 Fees Collection / Fee Group */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Fee Group</span>
        </div>
      </div>

      {/* 2-Column Split Layout matching Reference Screenshot Exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Add / Edit Fee Group (approx 4.5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📝</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                {editingId ? 'Edit Fee Group' : 'Add / Edit Fee Group'}
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
            {/* Field 1: Name * matching screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
              />
            </div>

            {/* Field 2: Description matching screenshot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={5}
                placeholder=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition resize-y"
              />
            </div>

            {/* Save Button matching screenshot */}
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

        {/* Right Column: Fee Group List (approx 7.5 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          {/* Top Bar of List: Title matching screenshot */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">📋</span>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                Fee Group List
              </h2>
            </div>
            <span className="bg-purple-100 text-[#80229a] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Groups
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
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 text-xs">
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
                        checked={visibleColumns.action}
                        onChange={(e) =>
                          setVisibleColumns({ ...visibleColumns, action: e.target.checked })
                        }
                        className="rounded text-[#80229a] mr-2"
                      />
                      <span>Action</span>
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

          {/* Data Table matching screenshot soft pink headers & purple Action buttons */}
          <div className="border border-slate-100 rounded-xl overflow-visible shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                  {visibleColumns.name && (
                    <th
                      onClick={() => setSortAsc(!sortAsc)}
                      className="py-3 px-4 cursor-pointer hover:text-[#80229a] transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>NAME</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.action && (
                    <th className="py-3 px-4 text-right w-36">ACTION</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                      <div>Loading fee groups...</div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-400 font-medium">
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
                      {visibleColumns.name && (
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div>
                            <span className="text-slate-800 hover:text-[#80229a] transition">
                              {rec.name}
                            </span>
                            {rec.description && (
                              <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                                {rec.description}
                              </p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="py-3.5 px-4 text-right">
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
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1.5 animate-scale-up">
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
                                  onClick={() => handleDelete(rec._id || '', rec.name)}
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

          {/* Table Footer: Showing 1 to 10 of 22 entries matching screenshot */}
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

