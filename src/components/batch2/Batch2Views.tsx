'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  Mail,
  MessageSquare,
} from 'lucide-react';
import ErpCrudView, { API_BASE, FieldDef, ColumnDef, RowAction } from '@/components/shared/ErpCrudView';

export const MONTHS = [
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
];

export const BATCH2_VIEW_IDS = [
  // 1. Communicate
  'comm-notice',
  'comm-send',
  'comm-log',
  // 2. Human Resource
  'hr-staff',
  'hr-recruitment',
  'hr-attendance',
  'hr-apply-leave',
  'hr-approve-leave',
  'hr-leave-type',
  'hr-payroll',
  'hr-advance',
  'hr-department',
  'hr-designation',
  'hr-inactive-staff',
  'hr-reports',
] as const;

export type Batch2ViewId = (typeof BATCH2_VIEW_IDS)[number];

function StatusBadge({ value }: { value?: string }) {
  const v = String(value || 'Pending');
  const lower = v.toLowerCase();
  let cls = 'bg-amber-50 text-amber-700 border-amber-200';
  if (
    ['active', 'published', 'sent', 'delivered', 'present', 'approved', 'paid', 'settled', 'hired'].includes(lower)
  ) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['generated', 'open', 'shortlisted', 'interviewed', 'half day', 'late'].includes(lower)) {
    cls = 'bg-purple-50 text-[#80229a] border-purple-200';
  } else if (['inactive', 'failed', 'absent', 'rejected', 'closed', 'archived'].includes(lower)) {
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

const deactivateStaffAction = createPatchAction(
  'Deactivate',
  'human-resource/staff',
  { status: 'Inactive' },
  'Staff member deactivated',
  'px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]',
);

const activateStaffAction = createPatchAction(
  'Activate',
  'human-resource/staff',
  { status: 'Active' },
  'Staff member activated',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const approveLeaveAction = createPatchAction(
  'Approve',
  'human-resource/leaves',
  { status: 'Approved' },
  'Leave request approved',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

const rejectLeaveAction = createPatchAction(
  'Reject',
  'human-resource/leaves',
  { status: 'Rejected' },
  'Leave request rejected',
  'px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]',
);

const markPayrollPaidAction = createPatchAction(
  'Mark Paid',
  'human-resource/payroll',
  { status: 'Paid' },
  'Payroll marked as Paid',
  'px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]',
);

// ============================================================================
// Custom Interactive View: Send Email / SMS (`comm-send`)
// ============================================================================
const RECIPIENT_PRESETS = ['All Students', 'All Staff', 'All Parents'];

function SendEmailSmsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    title: '',
    type: 'Email' as 'Email' | 'SMS' | 'Both',
    recipients: 'All Students',
    message: '',
    sentBy: 'Admin',
  });

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/communicate/logs`);
      if (!res.ok) throw new Error('Failed to load sent messages');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      notify(e?.message || 'Error loading recent messages', false);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.recipients.trim() || !form.message.trim()) {
      notify('Title, recipients, and message are required', false);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/communicate/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
      }
      notify(`${form.type} dispatched successfully to ${form.recipients}`);
      setForm((prev) => ({ ...prev, title: '', message: '' }));
      loadLogs();
    } catch (e: any) {
      notify(e?.message || 'Failed to send message', false);
    } finally {
      setSending(false);
    }
  };

  const filteredLogs = logs.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(item.title || '').toLowerCase().includes(q) ||
      String(item.recipients || '').toLowerCase().includes(q) ||
      String(item.type || '').toLowerCase().includes(q) ||
      String(item.sentBy || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.ok ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Communicate / Send Email / SMS
          </p>
          <h2 className="text-lg font-bold text-slate-800">Send Email / SMS</h2>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
            <Send className="h-4 w-4 text-[#80229a]" /> Compose Message
          </h3>

          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Title / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Exam Schedule Notification"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Channel <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Email', 'SMS', 'Both'] as const).map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: channel }))}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      form.type === channel
                        ? 'bg-[#80229a] text-white border-[#80229a]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {channel === 'Email' && <Mail className="h-3.5 w-3.5" />}
                    {channel === 'SMS' && <MessageSquare className="h-3.5 w-3.5" />}
                    {channel === 'Both' && <Send className="h-3.5 w-3.5" />}
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Recipients <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {RECIPIENT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, recipients: preset }))}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                      form.recipients === preset
                        ? 'bg-purple-50 text-[#80229a] border-purple-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={form.recipients}
                onChange={(e) => setForm((p) => ({ ...p, recipients: e.target.value }))}
                placeholder="All Students, or comma-separated emails/phones"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your announcement or message here..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sent By</label>
              <input
                type="text"
                value={form.sentBy}
                onChange={(e) => setForm((p) => ({ ...p, sentBy: e.target.value }))}
                placeholder="Admin / Principal"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#80229a] hover:bg-[#6b1a82] text-white text-xs font-semibold transition disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Sending...' : `Send ${form.type}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Sent Messages</h3>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sent logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Title</th>
                  <th className="px-3 py-2.5">Channel</th>
                  <th className="px-3 py-2.5">Recipients</th>
                  <th className="px-3 py-2.5">Sent By</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No sent messages found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.slice(0, 15).map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{item.title || '-'}</td>
                      <td className="px-3 py-2.5">{item.type || '-'}</td>
                      <td className="px-3 py-2.5">{item.recipients || '-'}</td>
                      <td className="px-3 py-2.5">{item.sentBy || '-'}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge value={item.status || 'Sent'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing {Math.min(filteredLogs.length, 15)} of {logs.length} sent messages
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Renderer
// ============================================================================
export function Batch2ViewRenderer({ activeView }: { activeView: string }) {
  switch (activeView) {
    // ------------------------------------------------------------------------
    // 1. Communicate
    // ------------------------------------------------------------------------
    case 'comm-notice':
      return (
        <ErpCrudView
          key={activeView}
          title="Notice Board"
          breadcrumb="Communicate / Notice Board"
          endpoint="communicate/notices"
          layout="modal"
          filterFields={[
            {
              name: 'messageTo',
              label: 'Message To',
              type: 'select',
              options: ['All', 'Students', 'Staff', 'Parents', 'Teachers'],
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Published', 'Draft', 'Archived'],
            },
          ]}
          fields={[
            { name: 'title', label: 'Notice Title', required: true },
            { name: 'noticeDate', label: 'Notice Date', type: 'date', required: true },
            { name: 'publishOn', label: 'Publish On', type: 'date' },
            {
              name: 'messageTo',
              label: 'Message To',
              type: 'select',
              options: ['All', 'Students', 'Staff', 'Parents', 'Teachers'],
              defaultValue: 'All',
              required: true,
            },
            { name: 'message', label: 'Message', type: 'textarea', required: true },
            { name: 'attachmentUrl', label: 'Attachment URL', type: 'url', placeholder: 'https://...' },
            { name: 'createdBy', label: 'Created By', defaultValue: 'Admin' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Published', 'Draft', 'Archived'],
              defaultValue: 'Published',
            },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'noticeDate', label: 'Notice Date' },
            { key: 'publishOn', label: 'Publish On' },
            { key: 'messageTo', label: 'Message To' },
            { key: 'createdBy', label: 'Created By' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'comm-send':
      return <SendEmailSmsView key={activeView} />;

    case 'comm-log':
      return (
        <ErpCrudView
          key={activeView}
          title="Email / SMS Log"
          breadcrumb="Communicate / Email / SMS Log"
          endpoint="communicate/logs"
          layout="report"
          hideCreate
          hideEdit
          filterFields={[
            {
              name: 'type',
              label: 'Channel',
              type: 'select',
              options: ['Email', 'SMS', 'Both'],
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Sent', 'Pending', 'Failed'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Channel' },
            { key: 'recipients', label: 'Recipients' },
            { key: 'message', label: 'Message' },
            { key: 'sentBy', label: 'Sent By' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
            {
              key: 'sentAt',
              label: 'Sent At',
              render: (row) => {
                const raw = row.sentAt || row.createdAt;
                return raw ? String(raw).slice(0, 10) : '-';
              },
            },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 2. Human Resource
    // ------------------------------------------------------------------------
    case 'hr-staff':
      return (
        <ErpCrudView
          key={activeView}
          title="Staff Directory"
          breadcrumb="Human Resource / Staff Directory"
          endpoint="human-resource/staff"
          layout="modal"
          fixedFilters={{ status: 'Active' }}
          filterFields={[
            { name: 'department', label: 'Department' },
            { name: 'role', label: 'Role' },
          ]}
          rowActions={[deactivateStaffAction]}
          fields={[
            { name: 'staffId', label: 'Staff ID', required: true },
            { name: 'name', label: 'Full Name', required: true },
            {
              name: 'role',
              label: 'Role',
              type: 'select',
              options: ['Teacher', 'Principal', 'Admin', 'Accountant', 'Librarian', 'Receptionist', 'Lab Assistant'],
              defaultValue: 'Teacher',
              required: true,
            },
            { name: 'department', label: 'Department', required: true },
            { name: 'designation', label: 'Designation', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone', required: true },
            { name: 'joiningDate', label: 'Joining Date', type: 'date' },
            { name: 'basicSalary', label: 'Basic Salary', type: 'number' },
            { name: 'qualification', label: 'Qualification' },
            { name: 'experience', label: 'Experience' },
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
            { key: 'staffId', label: 'Staff ID' },
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'department', label: 'Department' },
            { key: 'designation', label: 'Designation' },
            { key: 'phone', label: 'Phone' },
            { key: 'basicSalary', label: 'Basic Salary' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-recruitment':
      return (
        <ErpCrudView
          key={activeView}
          title="Recruitment"
          breadcrumb="Human Resource / Recruitment"
          endpoint="human-resource/recruitment"
          layout="modal"
          filterFields={[
            { name: 'department', label: 'Department' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Open', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected', 'Closed'],
            },
          ]}
          fields={[
            { name: 'jobTitle', label: 'Job Title', required: true },
            { name: 'department', label: 'Department', required: true },
            { name: 'designation', label: 'Designation' },
            { name: 'vacancies', label: 'Vacancies', type: 'number', defaultValue: 1 },
            { name: 'applicantName', label: 'Applicant Name' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone' },
            { name: 'qualification', label: 'Qualification' },
            { name: 'experience', label: 'Experience' },
            { name: 'interviewDate', label: 'Interview Date', type: 'date' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Open', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected', 'Closed'],
              defaultValue: 'Open',
            },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'jobTitle', label: 'Job Title' },
            { key: 'department', label: 'Department' },
            { key: 'vacancies', label: 'Vacancies' },
            { key: 'applicantName', label: 'Applicant' },
            { key: 'phone', label: 'Phone' },
            { key: 'interviewDate', label: 'Interview Date' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-attendance':
      return (
        <ErpCrudView
          key={activeView}
          title="Staff Attendance"
          breadcrumb="Human Resource / Staff Attendance"
          endpoint="human-resource/attendance"
          layout="modal"
          filterFields={[
            { name: 'department', label: 'Department' },
            { name: 'date', label: 'Date', type: 'date' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
            },
          ]}
          fields={[
            { name: 'staffId', label: 'Staff ID', required: true },
            { name: 'staffName', label: 'Staff Name', required: true },
            { name: 'department', label: 'Department' },
            { name: 'date', label: 'Date', type: 'date', required: true },
            {
              name: 'status',
              label: 'Attendance Status',
              type: 'select',
              options: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
              defaultValue: 'Present',
              required: true,
            },
            { name: 'inTime', label: 'In Time', type: 'time' },
            { name: 'outTime', label: 'Out Time', type: 'time' },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'staffName', label: 'Staff Name' },
            { key: 'department', label: 'Department' },
            { key: 'date', label: 'Date' },
            { key: 'inTime', label: 'In Time' },
            { key: 'outTime', label: 'Out Time' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-apply-leave':
      return (
        <ErpCrudView
          key={activeView}
          title="Apply Leave"
          breadcrumb="Human Resource / Apply Leave"
          endpoint="human-resource/leaves"
          layout="split"
          filterFields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Rejected'],
            },
          ]}
          fields={[
            { name: 'staffId', label: 'Staff ID', required: true },
            { name: 'staffName', label: 'Staff Name', required: true },
            { name: 'department', label: 'Department' },
            { name: 'leaveType', label: 'Leave Type', required: true, placeholder: 'e.g. Casual Leave' },
            { name: 'fromDate', label: 'From Date', type: 'date', required: true },
            { name: 'toDate', label: 'To Date', type: 'date', required: true },
            { name: 'days', label: 'Days', type: 'number', defaultValue: 1 },
            { name: 'reason', label: 'Reason', type: 'textarea', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Rejected'],
              defaultValue: 'Pending',
            },
          ]}
          columns={[
            { key: 'staffName', label: 'Staff Name' },
            { key: 'department', label: 'Department' },
            { key: 'leaveType', label: 'Leave Type' },
            { key: 'fromDate', label: 'From' },
            { key: 'toDate', label: 'To' },
            { key: 'days', label: 'Days' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-approve-leave':
      return (
        <ErpCrudView
          key={activeView}
          title="Approve Leave Request"
          breadcrumb="Human Resource / Approve Leave Request"
          endpoint="human-resource/leaves"
          layout="report"
          hideCreate
          hideEdit
          filterFields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Rejected'],
            },
            { name: 'department', label: 'Department' },
          ]}
          rowActions={[approveLeaveAction, rejectLeaveAction]}
          fields={[]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'staffName', label: 'Staff Name' },
            { key: 'department', label: 'Department' },
            { key: 'leaveType', label: 'Leave Type' },
            { key: 'fromDate', label: 'From Date' },
            { key: 'toDate', label: 'To Date' },
            { key: 'days', label: 'Days' },
            { key: 'reason', label: 'Reason' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-leave-type':
      return (
        <ErpCrudView
          key={activeView}
          title="Leave Type"
          breadcrumb="Human Resource / Leave Type"
          endpoint="human-resource/leave-types"
          layout="split"
          fields={[
            { name: 'name', label: 'Leave Type Name', required: true },
            { name: 'code', label: 'Code', placeholder: 'e.g. CL, SL, EL' },
            { name: 'maxDaysPerYear', label: 'Max Days / Year', type: 'number', defaultValue: 12 },
            { name: 'isPaid', label: 'Paid Leave', type: 'checkbox', defaultValue: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Leave Type' },
            { key: 'code', label: 'Code' },
            { key: 'maxDaysPerYear', label: 'Max Days / Year' },
            {
              key: 'isPaid',
              label: 'Paid',
              render: (row) => (row.isPaid ? 'Yes' : 'No'),
            },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'hr-payroll':
      return (
        <ErpCrudView
          key={activeView}
          title="Payroll"
          breadcrumb="Human Resource / Payroll"
          endpoint="human-resource/payroll"
          layout="modal"
          filterFields={[
            { name: 'month', label: 'Month', type: 'select', options: MONTHS },
            { name: 'year', label: 'Year', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Generated', 'Paid'],
            },
          ]}
          rowActions={[markPayrollPaidAction]}
          fields={[
            { name: 'staffId', label: 'Staff ID', required: true },
            { name: 'staffName', label: 'Staff Name', required: true },
            { name: 'department', label: 'Department' },
            { name: 'month', label: 'Month', type: 'select', options: MONTHS, required: true },
            { name: 'year', label: 'Year', type: 'number', defaultValue: 2026, required: true },
            { name: 'basicSalary', label: 'Basic Salary', type: 'number', required: true },
            { name: 'allowances', label: 'Allowances', type: 'number', defaultValue: 0 },
            { name: 'deductions', label: 'Deductions', type: 'number', defaultValue: 0 },
            { name: 'netSalary', label: 'Net Salary', type: 'number', required: true },
            { name: 'paymentDate', label: 'Payment Date', type: 'date' },
            {
              name: 'paymentMode',
              label: 'Payment Mode',
              type: 'select',
              options: ['Bank Transfer', 'Cash', 'Cheque', 'UPI'],
              defaultValue: 'Bank Transfer',
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Generated', 'Paid'],
              defaultValue: 'Pending',
            },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'staffName', label: 'Staff Name' },
            { key: 'department', label: 'Department' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' },
            { key: 'basicSalary', label: 'Basic' },
            { key: 'netSalary', label: 'Net Salary' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-advance':
      return (
        <ErpCrudView
          key={activeView}
          title="Staff Advance"
          breadcrumb="Human Resource / Staff Advance"
          endpoint="human-resource/advances"
          layout="split"
          filterFields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Paid', 'Settled', 'Rejected'],
            },
          ]}
          fields={[
            { name: 'staffId', label: 'Staff ID', required: true },
            { name: 'staffName', label: 'Staff Name', required: true },
            { name: 'department', label: 'Department' },
            { name: 'amount', label: 'Advance Amount', type: 'number', required: true },
            { name: 'requestDate', label: 'Request Date', type: 'date', required: true },
            { name: 'repaymentMonths', label: 'Repayment Months', type: 'number', defaultValue: 1 },
            { name: 'reason', label: 'Reason', type: 'textarea' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Approved', 'Paid', 'Settled', 'Rejected'],
              defaultValue: 'Pending',
            },
          ]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'staffName', label: 'Staff Name' },
            { key: 'amount', label: 'Amount' },
            { key: 'requestDate', label: 'Date' },
            { key: 'repaymentMonths', label: 'Months' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-department':
      return (
        <ErpCrudView
          key={activeView}
          title="Department"
          breadcrumb="Human Resource / Department"
          endpoint="human-resource/departments"
          layout="split"
          fields={[
            { name: 'name', label: 'Department Name', required: true },
            { name: 'code', label: 'Department Code' },
            { name: 'headOfDepartment', label: 'Head of Department' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Department' },
            { key: 'code', label: 'Code' },
            { key: 'headOfDepartment', label: 'HOD' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'hr-designation':
      return (
        <ErpCrudView
          key={activeView}
          title="Designation"
          breadcrumb="Human Resource / Designation"
          endpoint="human-resource/designations"
          layout="split"
          fields={[
            { name: 'name', label: 'Designation Name', required: true },
            { name: 'code', label: 'Designation Code' },
            { name: 'department', label: 'Department' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Designation' },
            { key: 'code', label: 'Code' },
            { key: 'department', label: 'Department' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'hr-inactive-staff':
      return (
        <ErpCrudView
          key={activeView}
          title="Disabled / Inactive Staff"
          breadcrumb="Human Resource / Disabled Staff"
          endpoint="human-resource/staff"
          layout="report"
          hideCreate
          hideEdit
          fixedFilters={{ status: 'Inactive' }}
          filterFields={[{ name: 'department', label: 'Department' }]}
          rowActions={[activateStaffAction]}
          fields={[]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'department', label: 'Department' },
            { key: 'designation', label: 'Designation' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'hr-reports':
      return (
        <ErpCrudView
          key={activeView}
          title="HR Payroll Reports"
          breadcrumb="Human Resource / Reports"
          endpoint="human-resource/payroll"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            { name: 'month', label: 'Month', type: 'select', options: MONTHS },
            { name: 'year', label: 'Year', type: 'number' },
            { name: 'department', label: 'Department' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Generated', 'Paid'],
            },
          ]}
          fields={[]}
          columns={[
            { key: 'staffId', label: 'Staff ID' },
            { key: 'staffName', label: 'Staff Name' },
            { key: 'department', label: 'Department' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' },
            { key: 'basicSalary', label: 'Basic Salary' },
            { key: 'allowances', label: 'Allowances' },
            { key: 'deductions', label: 'Deductions' },
            { key: 'netSalary', label: 'Net Salary' },
            { key: 'paymentMode', label: 'Mode' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    default:
      return null;
  }
}
