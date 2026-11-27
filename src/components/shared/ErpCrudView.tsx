'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox' | 'email' | 'url';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface RowAction<T = any> {
  label: string;
  className?: string;
  onClick: (row: T, reload: () => void, notify: (msg: string, ok?: boolean) => void) => void | Promise<void>;
}

interface ErpCrudViewProps {
  title: string;
  breadcrumb: string;
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  layout?: 'split' | 'modal' | 'report';
  filterFields?: FieldDef[];
  rowActions?: RowAction[];
  hideCreate?: boolean;
  hideDelete?: boolean;
  hideEdit?: boolean;
  headerExtra?: React.ReactNode;
  transformPayload?: (data: Record<string, any>) => Record<string, any>;
  fixedFilters?: Record<string, string>;
}

export default function ErpCrudView({
  title,
  breadcrumb,
  endpoint,
  fields,
  columns,
  layout = 'split',
  filterFields = [],
  rowActions = [],
  hideCreate = false,
  hideDelete = false,
  hideEdit = false,
  headerExtra,
  transformPayload,
  fixedFilters,
}: ErpCrudViewProps) {
  const buildDefaults = useCallback(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) init[f.name] = f.defaultValue;
      else if (f.type === 'checkbox') init[f.name] = false;
      else if (f.type === 'number') init[f.name] = '';
      else init[f.name] = '';
    });
    return init;
  }, [fields]);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Record<string, any>>(buildDefaults);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fixedFilters) {
        Object.entries(fixedFilters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });
      }
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/${endpoint}${qs}`);
      if (!res.ok) throw new Error('Failed to load records');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      notify(e?.message || 'Error loading data', false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters, fixedFilters, notify]);

  useEffect(() => {
    setForm(buildDefaults());
    setEditingId(null);
    loadRows();
  }, [endpoint, buildDefaults, loadRows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = transformPayload ? transformPayload({ ...form }) : { ...form };
      fields.forEach((f) => {
        if (f.type === 'number' && payload[f.name] !== '' && payload[f.name] !== undefined) {
          payload[f.name] = Number(payload[f.name]);
        }
      });
      const url = editingId ? `${API_BASE}/${endpoint}/${editingId}` : `${API_BASE}/${endpoint}`;
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Save failed');
      }
      notify(editingId ? 'Updated successfully' : 'Saved successfully');
      setForm(buildDefaults());
      setEditingId(null);
      setModalOpen(false);
      await loadRows();
    } catch (e: any) {
      notify(e?.message || 'Failed to save', false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: any) => {
    const next: Record<string, any> = {};
    fields.forEach((f) => {
      next[f.name] = row[f.name] ?? (f.type === 'checkbox' ? false : '');
    });
    setForm(next);
    setEditingId(row._id);
    if (layout === 'modal') setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      notify('Deleted successfully');
      await loadRows();
    } catch (e: any) {
      notify(e?.message || 'Failed to delete', false);
    }
  };

  const filteredRows = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((val) => String(val ?? '').toLowerCase().includes(q));
  });

  const exportCsv = () => {
    const headers = columns.map((c) => c.label);
    const lines = [
      headers.join(','),
      ...filteredRows.map((r) =>
        columns
          .map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = () => (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === 'checkbox' ? (
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form[f.name])}
                onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.checked }))}
                className="rounded border-slate-300 text-[#80229a] focus:ring-[#80229a]"
              />
              {f.label}
            </label>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  required={f.required}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                >
                  <option value="">Select {f.label}</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  required={f.required}
                  rows={3}
                  value={form[f.name] ?? ''}
                  placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                  onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  value={form[f.name] ?? ''}
                  placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                  onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.ok ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{breadcrumb}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {layout === 'modal' && !hideCreate && (
            <button
              onClick={() => {
                setForm(buildDefaults());
                setEditingId(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="h-4 w-4" /> Add {title}
            </button>
          )}
        </div>
      </div>

      {/* Criteria / Filters for report or filtered views */}
      {filterFields.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            {filterFields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={filters[f.name] ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, [f.name]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
                  >
                    <option value="">All</option>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={filters[f.name] ?? ''}
                    placeholder={f.placeholder || f.label}
                    onChange={(e) => setFilters((p) => ({ ...p, [f.name]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={loadRows}
                className="px-4 py-2 rounded-lg bg-[#80229a] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
              <button
                onClick={() => setFilters({})}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`grid gap-4 ${
          layout === 'split' && !hideCreate ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}
      >
        {/* Split Left Form */}
        {layout === 'split' && !hideCreate && (
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-fit">
            <h2 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">
              {editingId ? `Edit ${title}` : `Add ${title}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields()}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(buildDefaults());
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Table Card */}
        <div
          className={`${
            layout === 'split' && !hideCreate ? 'lg:col-span-8' : 'col-span-1'
          } bg-white rounded-2xl shadow-sm border border-slate-100 p-5`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="px-3 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold flex items-center gap-1"
                title="Export CSV"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold flex items-center gap-1"
                title="Print"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button
                onClick={loadRows}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1"
                title="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-3 py-2.5 border-b border-rose-100">#</th>
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-2.5 border-b border-rose-100 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  {(!hideEdit || !hideDelete || rowActions.length > 0) && (
                    <th className="px-3 py-2.5 border-b border-rose-100 text-right">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-8 text-center text-slate-400">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr key={row._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                      {columns.map((c) => (
                        <td key={c.key} className="px-3 py-2.5">
                          {c.render ? c.render(row) : String(row[c.key] ?? '-')}
                        </td>
                      ))}
                      {(!hideEdit || !hideDelete || rowActions.length > 0) && (
                        <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-1.5">
                          {rowActions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => act.onClick(row, loadRows, notify)}
                              className={
                                act.className ||
                                'px-2 py-1 rounded bg-purple-50 text-[#80229a] hover:bg-purple-100 font-semibold text-[11px]'
                              }
                            >
                              {act.label}
                            </button>
                          ))}
                          {!hideEdit && (
                            <button
                              onClick={() => handleEdit(row)}
                              className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 inline-flex"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {!hideDelete && (
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing {filteredRows.length} of {rows.length} entries
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {layout === 'modal' && modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingId ? `Edit ${title}` : `Add ${title}`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields()}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#80229a] text-white text-xs font-semibold"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

