'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  List,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LeaveApplication {
  _id: string;
  admissionNo: string;
  studentName: string;
  course: string;
  semester: string;
  applyDate: string;
  fromDate: string;
  toDate: string;
  reason: string;
  reply?: string;
  status: 'Pending' | 'Approved' | 'Disapproved';
  attachDocument?: string;
}

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
  'PARAMEDICAL',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ApproveLeaveView({ onNavigate }: Props) {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    course: true,
    applyDate: true,
    leaveDate: true,
    status: true,
    reply: true,
    description: true,
    action: true,
  });

  // Add Leave Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admissionNo: '',
    studentName: '',
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    applyDate: '17-10-2026',
    fromDate: '18-10-2026',
    toDate: '20-10-2026',
    reason: '',
  });

  // Reply / Status Modal
  const [replyModalLeave, setReplyModalLeave] = useState<LeaveApplication | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'Pending' | 'Approved' | 'Disapproved'>('Approved');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance/leaves`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(Array.isArray(data) ? data : data.items || []);
      }
    } catch {
      showToast('error', 'Failed to load student leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetch(`${API}/student-info/students`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStudents(Array.isArray(d) ? d : d.items || []);
      })
      .catch(() => {});
  }, []);

  const filteredLeaves = useMemo(() => {
    if (!searchTerm.trim()) return leaves;
    const q = searchTerm.toLowerCase();
    return leaves.filter(
      (l) =>
        l.studentName.toLowerCase().includes(q) ||
        l.admissionNo.toLowerCase().includes(q) ||
        l.course.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q) ||
        (l.reason || '').toLowerCase().includes(q) ||
        (l.reply || '').toLowerCase().includes(q)
    );
  }, [leaves, searchTerm]);

  const displayedLeaves = filteredLeaves.slice(0, pageSize);

  const handleSelectStudent = (admNo: string) => {
    const match = students.find((s) => s.admissionNo === admNo);
    if (match) {
      setFormData((prev) => ({
        ...prev,
        admissionNo: match.admissionNo,
        studentName: `${match.firstName} ${match.lastName || ''}`.trim(),
        course: match.course || prev.course,
        semester: match.semester || prev.semester,
      }));
    } else {
      setFormData((prev) => ({ ...prev, admissionNo: admNo }));
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.reason.trim()) {
      showToast('error', 'Student Name and Description/Reason are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/attendance/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          admissionNo: formData.admissionNo || `ADM-${Date.now().toString().slice(-4)}`,
          status: 'Pending',
        }),
      });
      if (!res.ok) throw new Error('Failed to add leave');
      showToast('success', 'Student leave added successfully.');
      setIsAddOpen(false);
      setFormData({
        admissionNo: '',
        studentName: '',
        course: 'B.Sc. Nursing',
        semester: 'Semester 1',
        applyDate: '17-10-2026',
        fromDate: '18-10-2026',
        toDate: '20-10-2026',
        reason: '',
      });
      fetchLeaves();
    } catch (err: any) {
      showToast('error', err?.message || 'Error creating leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (
    id: string,
    status: 'Pending' | 'Approved' | 'Disapproved',
    reply?: string
  ) => {
    try {
      const res = await fetch(`${API}/attendance/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reply }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast('success', `Leave marked as ${status}.`);
      fetchLeaves();
    } catch (err: any) {
      showToast('error', err?.message || 'Error updating leave status');
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalLeave) return;
    await handleQuickStatus(replyModalLeave._id, replyStatus, replyText);
    setReplyModalLeave(null);
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      const res = await fetch(`${API}/attendance/leaves/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete leave');
      showToast('success', 'Leave record deleted.');
      fetchLeaves();
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting leave');
    }
  };

  const handleExportCsv = () => {
    const headers = ['NAME', 'COURSE', 'APPLY DATE', 'LEAVE DATE', 'STATUS', 'REPLY', 'DESCRIPTION'];
    const rows = filteredLeaves.map((l) => [
      l.studentName,
      `${l.course} (${l.semester})`,
      l.applyDate,
      `${l.fromDate} - ${l.toDate}`,
      l.status,
      l.reply || '',
      l.reason || '',
    ]);
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-leaves.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Exported student leave list.');
  };

  const handleCopy = async () => {
    const headers = ['NAME', 'COURSE', 'APPLY DATE', 'LEAVE DATE', 'STATUS', 'REPLY', 'DESCRIPTION'];
    const rows = filteredLeaves.map((l) =>
      [
        l.studentName,
        `${l.course} (${l.semester})`,
        l.applyDate,
        `${l.fromDate} - ${l.toDate}`,
        l.status,
        l.reply || '-',
        l.reason || '-',
      ].join('\t')
    );
    try {
      await navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n'));
      showToast('success', 'Copied to clipboard.');
    } catch {
      showToast('error', 'Failed to copy.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Header & Breadcrumb (exact match to screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Student Leave</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('student-attendance')}
              className="inline-flex items-center gap-1.5 text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Attendance
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Student Leave</span>
          </div>
        </div>

        {/* Student Leave List Card */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-800">Student Leave List</h2>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-medium shadow-xs transition cursor-pointer"
            >
              Add Leave
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-[#80229a] rounded-md p-1 relative">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy"
                  className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  title="Excel"
                  className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  title="CSV"
                  className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print"
                  className="p-1.5 text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowColMenu((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  Column visibility <ChevronDown className="w-3 h-3" />
                </button>

                {showColMenu && (
                  <div className="absolute left-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-44 text-xs text-gray-700">
                    {Object.entries(visibleCols).map(([key, val]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-purple-50 rounded cursor-pointer capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={() =>
                            setVisibleCols((prev) => ({
                              ...prev,
                              [key]: !prev[key as keyof typeof prev],
                            }))
                          }
                          className="accent-[#80229a]"
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 px-2 border border-gray-300 rounded bg-white text-gray-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 px-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#80229a]"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    {visibleCols.name && <th className="px-4 py-3">NAME</th>}
                    {visibleCols.course && <th className="px-4 py-3">COURSE</th>}
                    {visibleCols.applyDate && <th className="px-4 py-3">APPLY DATE</th>}
                    {visibleCols.leaveDate && <th className="px-4 py-3">LEAVE DATE</th>}
                    {visibleCols.status && <th className="px-4 py-3">STATUS</th>}
                    {visibleCols.reply && <th className="px-4 py-3">REPLY</th>}
                    {visibleCols.description && <th className="px-4 py-3">DESCRIPTION</th>}
                    {visibleCols.action && <th className="px-4 py-3 text-right">ACTION</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-[#80229a]" />
                        Loading leave applications...
                      </td>
                    </tr>
                  ) : displayedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    displayedLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-purple-50/30">
                        {visibleCols.name && (
                          <td className="px-4 py-3 font-medium text-gray-800">
                            <div>{leave.studentName}</div>
                            <div className="text-[11px] text-gray-400">{leave.admissionNo}</div>
                          </td>
                        )}
                        {visibleCols.course && (
                          <td className="px-4 py-3 text-gray-700">
                            {leave.course} ({leave.semester})
                          </td>
                        )}
                        {visibleCols.applyDate && (
                          <td className="px-4 py-3 text-gray-600">{leave.applyDate}</td>
                        )}
                        {visibleCols.leaveDate && (
                          <td className="px-4 py-3 text-gray-600">
                            {leave.fromDate} - {leave.toDate}
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                leave.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : leave.status === 'Disapproved'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                        )}
                        {visibleCols.reply && (
                          <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                            {leave.reply || '-'}
                          </td>
                        )}
                        {visibleCols.description && (
                          <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                            {leave.reason}
                          </td>
                        )}
                        {visibleCols.action && (
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {leave.status !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(leave._id, 'Approved')}
                                  title="Approve"
                                  className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {leave.status !== 'Disapproved' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(leave._id, 'Disapproved')}
                                  title="Disapprove"
                                  className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyModalLeave(leave);
                                  setReplyText(leave.reply || '');
                                  setReplyStatus(leave.status);
                                }}
                                title="Reply / Update"
                                className="p-1.5 rounded bg-purple-50 text-[#80229a] hover:bg-purple-100 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLeave(leave._id)}
                                title="Delete"
                                className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddLeave}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <span className="font-semibold text-sm">Add Student Leave</span>
              <button type="button" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              {students.length > 0 && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Select Student (Auto-fill)
                  </label>
                  <select
                    value={formData.admissionNo}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    <option value="">-- Choose Existing Student --</option>
                    {students.map((s) => (
                      <option key={s.admissionNo} value={s.admissionNo}>
                        {s.admissionNo} - {s.firstName} {s.lastName || ''} ({s.course})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">From Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">To Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full h-9 px-2.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description / Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Leave'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reply / Status Modal */}
      {replyModalLeave && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveReply}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#80229a] text-white flex items-center justify-between">
              <span className="font-semibold text-sm">
                Leave Reply — {replyModalLeave.studentName}
              </span>
              <button
                type="button"
                onClick={() => setReplyModalLeave(null)}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as any)}
                  className="w-full h-9 px-2.5 border border-gray-300 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Disapproved">Disapproved</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Admin Reply</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter approval/rejection remarks..."
                  className="w-full p-2.5 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyModalLeave(null)}
                className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold cursor-pointer"
              >
                Save Reply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}
