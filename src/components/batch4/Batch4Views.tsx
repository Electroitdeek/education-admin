'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Tv,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  KeyRound,
} from 'lucide-react';
import ErpCrudView, { API_BASE, FieldDef, ColumnDef, RowAction } from '@/components/shared/ErpCrudView';

export const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
];

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

export const BATCH4_VIEW_IDS = [
  // 1. Certificate
  'cert-student',
  'cert-staff',
  'cert-student-id',
  'cert-staff-id',
  'cert-id-config',
  // 2. Consent Letter
  'cl-letter',
  'cl-assign',
  'cl-report',
  // 3. Digital Notice Board
  'dnb-board',
  // 4. Student Wallet
  'wallet-main',
  'wallet-history',
  // 5. Bank Info
  'bank-list',
  'bank-account-type',
  'bank-account-list',
  'bank-passbook',
  'bank-passbook-report',
  // 6. Report
  'rep-transaction',
  'rep-activity',
  'rep-tally',
  'rep-document',
  'rep-app-login',
] as const;

export type Batch4ViewId = (typeof BATCH4_VIEW_IDS)[number];

function StatusBadge({ value }: { value?: string }) {
  const v = String(value || 'Pending');
  const lower = v.toLowerCase();
  let cls = 'bg-amber-50 text-amber-700 border-amber-200';
  if (
    ['active', 'approved', 'credit', 'completed', 'verified', 'available', 'logged in', 'online', 'published'].includes(
      lower,
    )
  ) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['draft', 'synced', 'exported'].includes(lower)) {
    cls = 'bg-purple-50 text-[#80229a] border-purple-200';
  } else if (['inactive', 'declined', 'debit', 'failed', 'missing', 'offline', 'archived'].includes(lower)) {
    cls = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {v}
    </span>
  );
}

function createPatchAction(
  label: string,
  endpointPrefix: string,
  payload: Record<string, any>,
  successMessage: string,
  className?: string,
): RowAction {
  return {
    label,
    className,
    onClick: async (row, reload, notify) => {
      try {
        const res = await fetch(`${API_BASE}/${endpointPrefix}/${row._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to ${label.toLowerCase()}`);
        }
        notify(successMessage);
        reload();
      } catch (e: any) {
        notify(e?.message || `Action "${label}" failed`, false);
      }
    },
  };
}

const approveConsentAction = createPatchAction(
  'Approve',
  'consent-letter/assignments',
  { status: 'Approved' },
  'Consent letter approved',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const declineConsentAction = createPatchAction(
  'Decline',
  'consent-letter/assignments',
  { status: 'Declined' },
  'Consent letter declined',
  'px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]',
);

/* -------------------------------------------------------------------------- */
/* Certificate Template Shared Config                                         */
/* -------------------------------------------------------------------------- */

const CERTIFICATE_TEMPLATE_META: Record<
  string,
  { title: string; breadcrumb: string; targetType: string }
> = {
  'cert-student': {
    title: 'Student Certificate Templates',
    breadcrumb: 'Certificate / Student Certificate',
    targetType: 'Student Certificate',
  },
  'cert-staff': {
    title: 'Staff Certificate Templates',
    breadcrumb: 'Certificate / Staff Certificate',
    targetType: 'Staff Certificate',
  },
  'cert-student-id': {
    title: 'Student ID Card Templates',
    breadcrumb: 'Certificate / Student ID Card',
    targetType: 'Student Id Card',
  },
  'cert-staff-id': {
    title: 'Staff ID Card Templates',
    breadcrumb: 'Certificate / Staff ID Card',
    targetType: 'Staff Id Card',
  },
};

const CERTIFICATE_TEMPLATE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Template Name', required: true },
  { name: 'headerLeft', label: 'Header Left Text' },
  { name: 'headerCenter', label: 'Header Center Title' },
  { name: 'headerRight', label: 'Header Right Text' },
  { name: 'bodyText', label: 'Body Content / Placeholders', type: 'textarea' },
  { name: 'footerText', label: 'Footer / Signature Text' },
  { name: 'backgroundUrl', label: 'Background Image URL', type: 'url' },
  {
    name: 'layoutOrientation',
    label: 'Orientation',
    type: 'select',
    options: ['Landscape', 'Portrait'],
    defaultValue: 'Landscape',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: ['Active', 'Inactive'],
    defaultValue: 'Active',
  },
];

const CERTIFICATE_TEMPLATE_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Template Name' },
  { key: 'targetType', label: 'Target Type' },
  { key: 'headerCenter', label: 'Header Title' },
  { key: 'layoutOrientation', label: 'Orientation' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge value={row.status} />,
  },
];

/* -------------------------------------------------------------------------- */
/* Reports Shared Config                                                      */
/* -------------------------------------------------------------------------- */

interface ReportViewConfig {
  title: string;
  breadcrumb: string;
  reportCategory: string;
  includeDateFilter: boolean;
  statusOptions: string[];
}

const REPORT_VIEW_CONFIGS: Record<string, ReportViewConfig> = {
  'rep-transaction': {
    title: 'Transaction Report',
    breadcrumb: 'Report / Transaction Report',
    reportCategory: 'Transaction Report',
    includeDateFilter: true,
    statusOptions: ['Completed', 'Pending', 'Failed'],
  },
  'rep-activity': {
    title: 'Activity Log Report',
    breadcrumb: 'Report / Activity Log',
    reportCategory: 'Activity Log',
    includeDateFilter: true,
    statusOptions: ['Completed', 'Pending', 'Archived'],
  },
  'rep-tally': {
    title: 'Tally Report',
    breadcrumb: 'Report / Tally Report',
    reportCategory: 'Tally Report',
    includeDateFilter: true,
    statusOptions: ['Synced', 'Pending', 'Failed'],
  },
  'rep-document': {
    title: 'Document Availability Report',
    breadcrumb: 'Report / Document Availability',
    reportCategory: 'Document Availability',
    includeDateFilter: false,
    statusOptions: ['Available', 'Pending', 'Missing'],
  },
  'rep-app-login': {
    title: 'App Login Status Report',
    breadcrumb: 'Report / App Login Status',
    reportCategory: 'App Login Status',
    includeDateFilter: false,
    statusOptions: ['Logged In', 'Offline', 'Inactive'],
  },
};

/* -------------------------------------------------------------------------- */
/* 3. Digital Notice Board Custom View                                        */
/* -------------------------------------------------------------------------- */

interface NoticeTheme {
  id: string;
  name: string;
  subtitle: string;
  bannerGradient: string;
  accentText: string;
  badgeCls: string;
  cardBorder: string;
}

const NOTICE_THEMES: NoticeTheme[] = [
  {
    id: 'Theme 1',
    name: 'Theme 1 · Royal Purple',
    subtitle: 'Classic institutional display',
    bannerGradient: 'from-[#80229a] via-purple-700 to-indigo-800',
    accentText: 'text-purple-100',
    badgeCls: 'bg-white/20 text-white border-white/30',
    cardBorder: 'border-[#80229a] bg-purple-50/70',
  },
  {
    id: 'Theme 2',
    name: 'Theme 2 · Emerald Clinical',
    subtitle: 'Clean medical & nursing board',
    bannerGradient: 'from-emerald-700 via-teal-700 to-cyan-800',
    accentText: 'text-emerald-100',
    badgeCls: 'bg-white/20 text-white border-white/30',
    cardBorder: 'border-emerald-600 bg-emerald-50/70',
  },
  {
    id: 'Theme 3',
    name: 'Theme 3 · Midnight Slate',
    subtitle: 'High-contrast lobby screen',
    bannerGradient: 'from-slate-900 via-slate-800 to-zinc-900',
    accentText: 'text-slate-300',
    badgeCls: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
    cardBorder: 'border-slate-800 bg-slate-100/80',
  },
  {
    id: 'Theme 4',
    name: 'Theme 4 · Crimson Alert',
    subtitle: 'Urgent announcements & exams',
    bannerGradient: 'from-rose-700 via-red-700 to-orange-700',
    accentText: 'text-rose-100',
    badgeCls: 'bg-white/20 text-white border-white/30',
    cardBorder: 'border-rose-600 bg-rose-50/70',
  },
];

function generateDisplayCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function DigitalNoticeBoardView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    theme: 'Theme 1',
    displayCode: generateDisplayCode(),
    targetAudience: 'All Students & Staff',
    publishDate: new Date().toISOString().slice(0, 10),
    status: 'Published',
  });

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/digital-notice-board`);
      if (!res.ok) throw new Error('Failed to load digital notices');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      notify(e?.message || 'Error loading digital notice board', false);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      message: '',
      theme: 'Theme 1',
      displayCode: generateDisplayCode(),
      targetAudience: 'All Students & Staff',
      publishDate: new Date().toISOString().slice(0, 10),
      status: 'Published',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/digital-notice-board/${editingId}`
        : `${API_BASE}/digital-notice-board`;
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save notice');
      }
      notify(editingId ? 'Notice updated' : 'Notice published to board');
      resetForm();
      await loadRows();
    } catch (e: any) {
      notify(e?.message || 'Failed to save notice', false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row._id);
    setForm({
      title: row.title || '',
      message: row.message || '',
      theme: row.theme || 'Theme 1',
      displayCode: row.displayCode || generateDisplayCode(),
      targetAudience: row.targetAudience || 'All Students & Staff',
      publishDate: row.publishDate || new Date().toISOString().slice(0, 10),
      status: row.status || 'Published',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      const res = await fetch(`${API_BASE}/digital-notice-board/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      notify('Notice deleted');
      await loadRows();
    } catch (e: any) {
      notify(e?.message || 'Failed to delete', false);
    }
  };

  const activeTheme = NOTICE_THEMES.find((t) => t.id === form.theme) || NOTICE_THEMES[0];
  const filteredRows = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.ok ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">Digital Notice Board / Display Manager</p>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Digital Notice Board</h2>
        </div>
        <button
          onClick={loadRows}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Live Preview Banner */}
      <div className={`rounded-xl bg-gradient-to-r ${activeTheme.bannerGradient} p-5 text-white shadow-md`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-2">
            <Tv className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Live Display Preview · {activeTheme.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeTheme.badgeCls}`}>
              Code: {form.displayCode}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeTheme.badgeCls}`}>
              {form.targetAudience || 'All'}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-bold tracking-tight">
          {form.title.trim() || 'Institutional Announcement Title Preview'}
        </h3>
        <p className={`text-sm mt-1 ${activeTheme.accentText}`}>
          {form.message.trim() || 'Your live digital notice board message will appear here across campus display screens.'}
        </p>
      </div>

      {/* Theme 1-4 Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {NOTICE_THEMES.map((theme) => {
          const selected = form.theme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setForm((p) => ({ ...p, theme: theme.id }))}
              className={`text-left p-3.5 rounded-xl border-2 transition ${
                selected ? theme.cardBorder : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${theme.bannerGradient} mb-2.5`} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{theme.name}</span>
                {selected && <Sparkles className="h-3.5 w-3.5 text-[#80229a]" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{theme.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Form */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">
            {editingId ? 'Edit Digital Notice' : 'Publish Digital Notice'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Notice Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Semester Exam Timetable Released"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Display Code (6-char) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={form.displayCode}
                  onChange={(e) => setForm((p) => ({ ...p, displayCode: e.target.value.toUpperCase() }))}
                  className="flex-1 px-3 py-2 text-sm font-mono uppercase border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, displayCode: generateDisplayCode() }))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-50 text-[#80229a] hover:bg-purple-100 text-xs font-semibold border border-purple-200"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                placeholder="All Students & Staff"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Notice Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Enter notice message for digital display..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6d1b84] disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update Notice' : 'Publish Notice'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CRUD Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">Active & Saved Board Notices ({filteredRows.length})</h3>
            <div className="relative w-56">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Theme</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading notices...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No digital notices found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate">{row.title}</td>
                      <td className="py-2.5 px-3">{row.theme || 'Theme 1'}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#80229a]">{row.displayCode}</td>
                      <td className="py-2.5 px-3">{row.publishDate || '-'}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge value={row.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            title="Delete"
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
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
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Student Wallet Custom View                                              */
/* -------------------------------------------------------------------------- */

function StudentWalletView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [txForm, setTxForm] = useState({
    admissionNo: '',
    studentName: '',
    type: 'Credit' as 'Credit' | 'Debit',
    amount: '',
    referenceNo: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const openTxModal = (type: 'Credit' | 'Debit', row?: any) => {
    setTxForm({
      admissionNo: row?.admissionNo || '',
      studentName: row?.studentName || '',
      type,
      amount: '',
      referenceNo: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setTxModalOpen(true);
  };

  const handleTransact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/student-wallet/transact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...txForm,
          amount: Number(txForm.amount),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Transaction failed');
      }
      notify(`Wallet ${txForm.type.toLowerCase()} completed`);
      setTxModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      notify(e?.message || 'Transaction failed', false);
    } finally {
      setSubmitting(false);
    }
  };

  const walletRowActions: RowAction[] = [
    {
      label: 'Credit',
      className: 'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
      onClick: (row) => openTxModal('Credit', row),
    },
    {
      label: 'Debit',
      className: 'px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]',
      onClick: (row) => openTxModal('Debit', row),
    },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.ok ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <ErpCrudView
        key={`wallet-accounts-${refreshKey}`}
        title="Student Wallet Accounts"
        breadcrumb="Student Wallet / Accounts"
        endpoint="student-wallet/accounts"
        layout="modal"
        rowActions={walletRowActions}
        headerExtra={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openTxModal('Credit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              <ArrowDownLeft className="h-3.5 w-3.5" /> Quick Credit
            </button>
            <button
              type="button"
              onClick={() => openTxModal('Debit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Quick Debit
            </button>
          </div>
        }
        fields={[
          { name: 'admissionNo', label: 'Admission No', required: true },
          { name: 'studentName', label: 'Student Name', required: true },
          { name: 'course', label: 'Course', type: 'select', options: COURSES },
          { name: 'balance', label: 'Opening / Current Balance', type: 'number', defaultValue: 0 },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['Active', 'Inactive'],
            defaultValue: 'Active',
          },
        ]}
        columns={[
          { key: 'admissionNo', label: 'Admission No' },
          { key: 'studentName', label: 'Student Name' },
          { key: 'course', label: 'Course' },
          {
            key: 'balance',
            label: 'Balance',
            render: (row) => (
              <span className="font-semibold text-slate-800">₹{Number(row.balance || 0).toLocaleString()}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />

      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#80229a]" />
                <h3 className="text-sm font-bold text-slate-800">Quick Wallet {txForm.type}</h3>
              </div>
              <button
                type="button"
                onClick={() => setTxModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransact} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(['Credit', 'Debit'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxForm((p) => ({ ...p, type: t }))}
                    className={`py-2 rounded-lg text-xs font-semibold border transition ${
                      txForm.type === t
                        ? t === 'Credit'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Admission No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={txForm.admissionNo}
                    onChange={(e) => setTxForm((p) => ({ ...p, admissionNo: e.target.value }))}
                    placeholder="e.g. ADM-2026-001"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={txForm.studentName}
                    onChange={(e) => setTxForm((p) => ({ ...p, studentName: e.target.value }))}
                    placeholder="Student name"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={txForm.date}
                    onChange={(e) => setTxForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reference No</label>
                <input
                  type="text"
                  value={txForm.referenceNo}
                  onChange={(e) => setTxForm((p) => ({ ...p, referenceNo: e.target.value }))}
                  placeholder="Receipt / Transaction reference"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Remarks</label>
                <textarea
                  rows={2}
                  value={txForm.description}
                  onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Reason for wallet credit or debit..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#80229a] text-white text-xs font-semibold hover:bg-[#6d1b84] disabled:opacity-60"
                >
                  {submitting ? 'Processing...' : `Submit ${txForm.type}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Batch 4 View Renderer                                                      */
/* -------------------------------------------------------------------------- */

export function Batch4ViewRenderer({ activeView }: { activeView: string }) {
  // 1. Certificate templates (4 views sharing the same template schema)
  const certMeta = CERTIFICATE_TEMPLATE_META[activeView];
  if (certMeta) {
    return (
      <ErpCrudView
        key={activeView}
        title={certMeta.title}
        breadcrumb={certMeta.breadcrumb}
        endpoint="certificate/templates"
        layout="split"
        fixedFilters={{ targetType: certMeta.targetType }}
        transformPayload={(data) => ({ ...data, targetType: certMeta.targetType })}
        fields={CERTIFICATE_TEMPLATE_FIELDS}
        columns={CERTIFICATE_TEMPLATE_COLUMNS}
      />
    );
  }

  // 6. Report records (5 views sharing reports/records)
  const reportCfg = REPORT_VIEW_CONFIGS[activeView];
  if (reportCfg) {
    const filterFields: FieldDef[] = [
      { name: 'status', label: 'Status', type: 'select', options: reportCfg.statusOptions },
    ];
    if (reportCfg.includeDateFilter) {
      filterFields.push({ name: 'date', label: 'Date', type: 'date' });
    }
    return (
      <ErpCrudView
        key={activeView}
        title={reportCfg.title}
        breadcrumb={reportCfg.breadcrumb}
        endpoint="reports/records"
        layout="modal"
        fixedFilters={{ reportCategory: reportCfg.reportCategory }}
        transformPayload={(data) => ({ ...data, reportCategory: reportCfg.reportCategory })}
        filterFields={filterFields}
        fields={[
          { name: 'title', label: 'Record Title', required: true },
          { name: 'referenceCode', label: 'Reference Code' },
          { name: 'userOrEntity', label: 'Student / Staff / Entity' },
          { name: 'amount', label: 'Amount', type: 'number' },
          { name: 'date', label: 'Date', type: 'date', required: true },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: reportCfg.statusOptions,
            defaultValue: reportCfg.statusOptions[0],
          },
          { name: 'remarks', label: 'Details / Remarks', type: 'textarea' },
        ]}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'referenceCode', label: 'Reference' },
          { key: 'userOrEntity', label: 'Entity' },
          { key: 'amount', label: 'Amount' },
          { key: 'date', label: 'Date' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    );
  }

  switch (activeView) {
    /* 1. Certificate */
    case 'cert-id-config':
      return (
        <ErpCrudView
          key={activeView}
          title="ID Card Configuration"
          breadcrumb="Certificate / ID Card Config"
          endpoint="certificate/id-card-config"
          layout="split"
          fields={[
            { name: 'configName', label: 'Configuration Name', required: true },
            {
              name: 'targetType',
              label: 'Target Type',
              type: 'select',
              options: ['Student Id Card', 'Staff Id Card'],
              required: true,
              defaultValue: 'Student Id Card',
            },
            { name: 'schoolName', label: 'Institution Name', required: true },
            { name: 'primaryColor', label: 'Primary Color', defaultValue: '#80229a' },
            { name: 'showPhoto', label: 'Show Photo', type: 'checkbox', defaultValue: true },
            { name: 'showBarcode', label: 'Show Barcode / QR', type: 'checkbox', defaultValue: true },
            { name: 'showBloodGroup', label: 'Show Blood Group', type: 'checkbox', defaultValue: true },
            { name: 'showValidUpto', label: 'Show Valid Upto', type: 'checkbox', defaultValue: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'configName', label: 'Config Name' },
            { key: 'targetType', label: 'Target' },
            { key: 'schoolName', label: 'Institution' },
            {
              key: 'showPhoto',
              label: 'Photo',
              render: (row) => (row.showPhoto ? 'Yes' : 'No'),
            },
            {
              key: 'showBarcode',
              label: 'Barcode',
              render: (row) => (row.showBarcode ? 'Yes' : 'No'),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    /* 2. Consent Letter */
    case 'cl-letter':
      return (
        <ErpCrudView
          key={activeView}
          title="Consent Letter Templates"
          breadcrumb="Consent Letter / Letters"
          endpoint="consent-letter/templates"
          layout="split"
          fields={[
            { name: 'title', label: 'Letter Title', required: true },
            { name: 'subject', label: 'Subject', required: true },
            { name: 'course', label: 'Course', type: 'select', options: COURSES },
            { name: 'dueDate', label: 'Due Date', type: 'date' },
            { name: 'body', label: 'Letter Content', type: 'textarea', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Draft', 'Archived'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'subject', label: 'Subject' },
            { key: 'course', label: 'Course' },
            { key: 'dueDate', label: 'Due Date' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'cl-assign':
      return (
        <ErpCrudView
          key={activeView}
          title="Assign Consent Letter"
          breadcrumb="Consent Letter / Assign"
          endpoint="consent-letter/assignments"
          layout="modal"
          fields={[
            { name: 'letterTitle', label: 'Consent Letter Title', required: true },
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No', required: true },
            { name: 'course', label: 'Course', type: 'select', options: COURSES, required: true },
            { name: 'semester', label: 'Semester', type: 'select', options: SEMESTERS },
            { name: 'parentName', label: 'Parent / Guardian Name' },
            { name: 'parentPhone', label: 'Parent Phone' },
            { name: 'assignedDate', label: 'Assigned Date', type: 'date' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Declined'],
              defaultValue: 'Pending',
            },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'letterTitle', label: 'Letter Title' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'course', label: 'Course' },
            { key: 'parentName', label: 'Parent Name' },
            { key: 'assignedDate', label: 'Assigned Date' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'cl-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Consent Letter Report"
          breadcrumb="Consent Letter / Report"
          endpoint="consent-letter/assignments"
          layout="report"
          hideCreate
          hideEdit
          filterFields={[
            { name: 'course', label: 'Course', type: 'select', options: COURSES },
            { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Declined'] },
          ]}
          rowActions={[approveConsentAction, declineConsentAction]}
          fields={[]}
          columns={[
            { key: 'letterTitle', label: 'Letter Title' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'course', label: 'Course' },
            { key: 'parentName', label: 'Parent Name' },
            { key: 'assignedDate', label: 'Assigned Date' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    /* 3. Digital Notice Board */
    case 'dnb-board':
      return <DigitalNoticeBoardView />;

    /* 4. Student Wallet */
    case 'wallet-main':
      return <StudentWalletView />;

    case 'wallet-history':
      return (
        <ErpCrudView
          key={activeView}
          title="Wallet Transaction History"
          breadcrumb="Student Wallet / Transaction History"
          endpoint="student-wallet/transactions"
          layout="report"
          hideCreate
          hideEdit
          filterFields={[
            { name: 'type', label: 'Type', type: 'select', options: ['Credit', 'Debit'] },
            { name: 'admissionNo', label: 'Admission No' },
          ]}
          fields={[]}
          columns={[
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'studentName', label: 'Student Name' },
            {
              key: 'type',
              label: 'Type',
              render: (row) => <StatusBadge value={row.type} />,
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (row) => (
                <span className="font-semibold text-slate-800">₹{Number(row.amount || 0).toLocaleString()}</span>
              ),
            },
            { key: 'referenceNo', label: 'Reference No' },
            { key: 'description', label: 'Description' },
            { key: 'date', label: 'Date' },
          ]}
        />
      );

    /* 5. Bank Info */
    case 'bank-list':
      return (
        <ErpCrudView
          key={activeView}
          title="Banks"
          breadcrumb="Bank Info / Bank List"
          endpoint="bank-info/banks"
          layout="split"
          fields={[
            { name: 'bankName', label: 'Bank Name', required: true },
            { name: 'bankCode', label: 'Bank Code' },
            { name: 'branchName', label: 'Branch Name' },
            { name: 'ifscCode', label: 'IFSC / Swift Code' },
            { name: 'phone', label: 'Contact Phone' },
            { name: 'address', label: 'Address', type: 'textarea' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'bankName', label: 'Bank Name' },
            { key: 'bankCode', label: 'Code' },
            { key: 'branchName', label: 'Branch' },
            { key: 'ifscCode', label: 'IFSC Code' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'bank-account-type':
      return (
        <ErpCrudView
          key={activeView}
          title="Bank Account Types"
          breadcrumb="Bank Info / Account Type"
          endpoint="bank-info/account-types"
          layout="split"
          fields={[
            { name: 'name', label: 'Account Type Name', required: true },
            { name: 'code', label: 'Type Code' },
            { name: 'description', label: 'Description', type: 'textarea' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'name', label: 'Account Type' },
            { key: 'code', label: 'Code' },
            { key: 'description', label: 'Description' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'bank-account-list':
      return (
        <ErpCrudView
          key={activeView}
          title="Bank Accounts"
          breadcrumb="Bank Info / Account List"
          endpoint="bank-info/accounts"
          layout="modal"
          fields={[
            { name: 'accountTitle', label: 'Account Title', required: true },
            { name: 'accountNumber', label: 'Account Number', required: true },
            { name: 'bankName', label: 'Bank Name', required: true },
            { name: 'accountType', label: 'Account Type', required: true },
            { name: 'ifscCode', label: 'IFSC Code' },
            { name: 'branchName', label: 'Branch Name' },
            { name: 'openingBalance', label: 'Opening Balance', type: 'number', defaultValue: 0 },
            { name: 'currentBalance', label: 'Current Balance', type: 'number', defaultValue: 0 },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Inactive'],
              defaultValue: 'Active',
            },
          ]}
          columns={[
            { key: 'accountTitle', label: 'Account Title' },
            { key: 'accountNumber', label: 'Account No' },
            { key: 'bankName', label: 'Bank' },
            { key: 'accountType', label: 'Type' },
            {
              key: 'currentBalance',
              label: 'Balance',
              render: (row) => (
                <span className="font-semibold text-slate-800">
                  ₹{Number(row.currentBalance || 0).toLocaleString()}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'bank-passbook':
      return (
        <ErpCrudView
          key={activeView}
          title="Bank Passbook Entries"
          breadcrumb="Bank Info / Passbook"
          endpoint="bank-info/passbook"
          layout="modal"
          fields={[
            { name: 'accountNumber', label: 'Account Number', required: true },
            { name: 'bankName', label: 'Bank Name' },
            { name: 'date', label: 'Transaction Date', type: 'date', required: true },
            {
              name: 'type',
              label: 'Type',
              type: 'select',
              options: ['Credit', 'Debit'],
              required: true,
              defaultValue: 'Credit',
            },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            { name: 'balanceAfter', label: 'Balance After', type: 'number' },
            { name: 'referenceNo', label: 'Reference / Cheque No' },
            { name: 'particulars', label: 'Particulars', type: 'textarea' },
          ]}
          columns={[
            { key: 'accountNumber', label: 'Account No' },
            { key: 'bankName', label: 'Bank' },
            { key: 'date', label: 'Date' },
            {
              key: 'type',
              label: 'Type',
              render: (row) => <StatusBadge value={row.type} />,
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (row) => (
                <span className="font-semibold text-slate-800">₹{Number(row.amount || 0).toLocaleString()}</span>
              ),
            },
            { key: 'referenceNo', label: 'Reference No' },
            { key: 'particulars', label: 'Particulars' },
          ]}
        />
      );

    case 'bank-passbook-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Bank Passbook Report"
          breadcrumb="Bank Info / Passbook Report"
          endpoint="bank-info/passbook"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            { name: 'accountNumber', label: 'Account Number' },
            { name: 'type', label: 'Type', type: 'select', options: ['Credit', 'Debit'] },
          ]}
          fields={[]}
          columns={[
            { key: 'accountNumber', label: 'Account No' },
            { key: 'bankName', label: 'Bank' },
            { key: 'date', label: 'Date' },
            {
              key: 'type',
              label: 'Type',
              render: (row) => <StatusBadge value={row.type} />,
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (row) => (
                <span className="font-semibold text-slate-800">₹{Number(row.amount || 0).toLocaleString()}</span>
              ),
            },
            { key: 'balanceAfter', label: 'Balance After' },
            { key: 'referenceNo', label: 'Reference No' },
            { key: 'particulars', label: 'Particulars' },
          ]}
        />
      );

    default:
      return null;
  }
}
