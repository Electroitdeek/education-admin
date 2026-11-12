'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  FileEdit,
  List,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Columns,
  Check,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/student-info/categories`;

interface CategoryItem {
  _id: string;
  category: string;
  description?: string;
  createdAt?: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentCategoriesView({ onNavigate }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Table & Action Dropdowns
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    category: true,
    action: true,
  });

  // Pagination (10 per page as in the screenshot)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sorting
  const [sortAsc, setSortAsc] = useState(true);

  // Fetch Categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setSaving(true);
      if (editingId) {
        // Update existing category
        const res = await fetch(`${ENDPOINT}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: categoryName.trim() }),
        });
        if (!res.ok) throw new Error('Failed to update category');
        setEditingId(null);
      } else {
        // Create new category
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: categoryName.trim() }),
        });
        if (!res.ok) throw new Error('Failed to create category');
      }

      setCategoryName('');
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Start editing
  const handleEdit = (item: CategoryItem) => {
    setEditingId(item._id);
    setCategoryName(item.category);
    setOpenActionId(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName('');
  };

  // Delete category
  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) =>
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!sortAsc) {
      result = [...result].reverse();
    }
    return result;
  }, [categories, searchTerm, sortAsc]);

  // Paginated categories
  const totalEntries = filteredCategories.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Export functions
  const handleCopy = () => {
    if (!filteredCategories.length) return;
    const header = 'ID\tCATEGORY\n';
    const body = filteredCategories
      .map((c, idx) => `${idx + 1}\t${c.category}`)
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredCategories.length) return;
    const header = 'ID,Category\n';
    const body = filteredCategories
      .map((c, idx) => `${idx + 1},"${c.category}"`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Categories_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB (EXACT ERP LAYOUT)                  */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-800">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Category</h1>
        </div>

        {/* Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            onClick={() => onNavigate?.('student-admission')}
            className="hover:text-[#80229a] cursor-pointer"
          >
            Student info
          </span>
          <span>/</span>
          <span className="text-[#80229a] font-semibold">Student Category</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN 2-COLUMN CONTENT: ADD FORM & DIRECTORY LIST           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        {/* LEFT COLUMN: Add / Edit Student Category Form (4 to 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <FileEdit className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">
              {editingId ? 'Edit Student Category' : 'Add Student Category'}
            </h2>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Student Category List Table (7 to 8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <List className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">Student Category List</h2>
          </div>

          {/* Table Toolbar: Icons + Column Visibility + Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            {/* Left Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
                title="Copy"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
                title="Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
                title="Export Document"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-1.5 rounded bg-[#80229a] text-white hover:bg-[#6c1c82] transition shadow-xs cursor-pointer"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Column Visibility Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6c1c82] transition cursor-pointer"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility ▾</span>
                </button>
                {showColMenu && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 space-y-1 text-xs">
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

            {/* Right Search Box */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] w-36 sm:w-44"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  {visibleColumns.id && (
                    <th
                      className="py-3 px-4 w-16 cursor-pointer select-none"
                      onClick={() => setSortAsc(!sortAsc)}
                    >
                      <div className="flex items-center gap-1">
                        <span>ID</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.category && (
                    <th className="py-3 px-4">CATEGORY</th>
                  )}
                  {visibleColumns.action && (
                    <th className="py-3 px-4 text-right">ACTION</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((c, idx) => {
                    const rowId = (currentPage - 1) * pageSize + idx + 1;
                    const isActionOpen = openActionId === c._id;
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        {visibleColumns.id && (
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {rowId}
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {c.category}
                          </td>
                        )}
                        {visibleColumns.action && (
                          <td className="py-3 px-4 text-right relative">
                            <div className="inline-block text-left">
                              <button
                                type="button"
                                onClick={() => setOpenActionId(isActionOpen ? null : c._id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded text-xs font-medium transition cursor-pointer"
                              >
                                <span>Action</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {/* Action Dropdown Menu */}
                              {isActionOpen && (
                                <div className="absolute right-4 mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs text-left">
                                  <button
                                    onClick={() => handleEdit(c)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-purple-50 hover:text-[#80229a] transition cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(c._id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white">
            <div>
              Showing {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#80229a] text-white font-bold'
                      : 'border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FOOTER (EXACT COPYRIGHT NOTICE FROM SCREENSHOT)            */}
      {/* ============================================================== */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </footer>
    </div>
  );
}
