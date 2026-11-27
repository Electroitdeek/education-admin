'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Laptop,
  Search,
  Calendar,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/student-info/online-admissions`;

export interface OnlineAdmissionDirectoryItem {
  _id: string;
  referenceNo?: string;
  studentName: string;
  course: string;
  batch?: string;
  fatherName?: string;
  dob?: string;
  gender: string;
  category?: string;
  mobile: string;
  email?: string;
  transactionId?: string;
  paymentStatus?: string;
  amount?: number;
  enrolled?: boolean;
  status?: string;
  applicationDate?: string;
  createdAt?: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function OnlineAdmissionView({ onNavigate }: Props) {
  // Filter Criteria State (Screenshot 1)
  const [startDate, setStartDate] = useState('01-01-2025');
  const [endDate, setEndDate] = useState('31-12-2025');

  // Directory Table State (Screenshot 2)
  const [items, setItems] = useState<OnlineAdmissionDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false);

  // Column Visibility toggles
  const [visibleCols, setVisibleCols] = useState({
    studentName: true,
    course: true,
    batch: true,
    fatherName: true,
    dob: true,
    gender: true,
    category: true,
    mobile: true,
    transactionId: true,
    enrolled: true,
    action: true,
  });

  // Modal / Detail state
  const [selectedItem, setSelectedItem] = useState<OnlineAdmissionDirectoryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOnlineAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        const normalized: OnlineAdmissionDirectoryItem[] = (data || []).map((d: any) => ({
          _id: d._id,
          referenceNo: d.referenceNo || `ONLINE-${d._id?.slice(-4)}`,
          studentName: d.studentName || d.applicantName || 'Applicant',
          course: d.course || 'B.Sc. Nursing',
          batch: d.batch || 'Batch 2025-2029 (B.Sc. Nursing)',
          fatherName: d.fatherName || d.guardianName || '-',
          dob: d.dob || d.dateOfBirth || '-',
          gender: d.gender || 'Female',
          category: d.category || 'General',
          mobile: d.mobile || d.mobileNumber || '-',
          email: d.email || '',
          transactionId: d.transactionId || (d.paymentStatus === 'Paid' ? `TXN-${Math.floor(10000000 + Math.random() * 90000000)}` : '-'),
          paymentStatus: d.paymentStatus || 'Paid',
          amount: d.amount || 1000,
          enrolled: d.enrolled === true || d.status === 'Enrolled',
          status: d.status || 'Submitted',
          applicationDate: d.applicationDate || d.submissionDate || '17-10-2026',
        }));
        setItems(normalized);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineAdmissions();
  }, [fetchOnlineAdmissions]);

  // Enroll Student to Database
  const handleEnroll = async (item: OnlineAdmissionDirectoryItem) => {
    if (!confirm(`Are you sure you want to approve and enroll ${item.studentName}? A permanent admission record will be generated in Student Details.`)) {
      return;
    }
    try {
      const res = await fetch(`${ENDPOINT}/${item._id}/enroll`, {
        method: 'PUT',
      });
      if (res.ok) {
        const result = await res.json();
        showToast('success', `Student ${item.studentName} enrolled successfully! Assigned Adm No: ${result.student?.admissionNo || 'Generated'}`);
        fetchOnlineAdmissions();
        setOpenActionId(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.message || 'Failed to enroll applicant');
      }
    } catch {
      showToast('error', 'Error connecting to backend API');
    }
  };

  // Delete / Reject record
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete application for ${name}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}/reject`, { method: 'PUT' });
      if (res.ok) {
        showToast('success', `Application for ${name} removed`);
        fetchOnlineAdmissions();
        setOpenActionId(null);
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  // Search and filter
  const filtered = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(q) ||
      item.course.toLowerCase().includes(q) ||
      (item.batch && item.batch.toLowerCase().includes(q)) ||
      (item.fatherName && item.fatherName.toLowerCase().includes(q)) ||
      item.mobile.includes(q) ||
      (item.transactionId && item.transactionId.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium text-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Title & Breadcrumb (Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Laptop className="h-5 w-5 text-slate-700" />
          <h1 className="text-lg font-bold text-slate-800">Online Admission</h1>
        </div>
        <p className="text-xs text-slate-500">
          Student info <span className="mx-1 text-slate-400">/</span> Online Admission
        </p>
      </div>

      {/* ========================================================================= */}
      {/* CARD 1: Select Criteria (Screenshot 1)                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          <Search className="h-4 w-4 text-slate-600" />
          <span>Select Criteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-xs flex items-center gap-1.5">
              Start Date
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
            </label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#80229a]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-xs flex items-center gap-1.5">
              End Date
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
            </label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#80229a]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={fetchOnlineAdmissions}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD 2: Online Admission Directory List (Screenshot 2)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-xs">
        {/* Card Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="text-[#80229a]">≡</span>
            <span>Online Admission Directory List</span>
          </div>

          <button
            onClick={fetchOnlineAdmissions}
            className="p-1.5 text-slate-500 hover:text-[#80229a] hover:bg-purple-50 rounded border border-slate-200 transition"
            title="Refresh List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Toolbar: Export icons, Column visibility, Page Size, Search */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => {
                const text = filtered
                  .map(
                    (i, idx) =>
                      `${idx + 1}\t${i.studentName}\t${i.course}\t${i.batch}\t${i.fatherName}\t${i.dob}\t${i.gender}\t${i.category}\t${i.mobile}\t${i.transactionId}\t${i.enrolled ? 'Yes' : 'No'}`
                  )
                  .join('\n');
                navigator.clipboard.writeText(text);
                showToast('success', 'Copied table data to clipboard');
              }}
              className="p-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded text-xs transition"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                const csv =
                  '#,Student Name,Course,Batch,Father Name,DOB,Gender,Category,Mobile,Transaction ID,Enrolled\n' +
                  filtered
                    .map(
                      (i, idx) =>
                        `"${idx + 1}","${i.studentName}","${i.course}","${i.batch}","${i.fatherName}","${i.dob}","${i.gender}","${i.category}","${i.mobile}","${i.transactionId}","${i.enrolled ? 'Yes' : 'No'}"`
                    )
                    .join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'online_admission_directory.csv';
                a.click();
              }}
              className="p-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded text-xs transition"
              title="Excel / CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded text-xs transition"
              title="Print"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>

            {/* Column visibility dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnVisibilityOpen(!columnVisibilityOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded text-xs font-semibold transition"
              >
                <span>Column visibility</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {columnVisibilityOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 space-y-1">
                  {Object.keys(visibleCols).map((colKey) => (
                    <label key={colKey} className="flex items-center gap-2 px-2 py-1 hover:bg-purple-50 rounded cursor-pointer text-xs text-slate-700 capitalize">
                      <input
                        type="checkbox"
                        checked={(visibleCols as any)[colKey]}
                        onChange={(e) =>
                          setVisibleCols((prev) => ({
                            ...prev,
                            [colKey]: e.target.checked,
                          }))
                        }
                        className="rounded text-[#80229a] focus:ring-[#80229a]"
                      />
                      {colKey.replace(/([A-Z])/g, ' $1')}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white w-44"
              />
            </div>
          </div>
        </div>

        {/* Table (Screenshot 2) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fef2f2] text-slate-700 font-bold uppercase tracking-wider border-b border-rose-100 text-[11px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                {visibleCols.studentName && <th className="py-3 px-3">STUDENT NAME</th>}
                {visibleCols.course && <th className="py-3 px-3">COURSE</th>}
                {visibleCols.batch && <th className="py-3 px-3">BATCH</th>}
                {visibleCols.fatherName && <th className="py-3 px-3">FATHER NAME</th>}
                {visibleCols.dob && <th className="py-3 px-3">DATE OF BIRTH</th>}
                {visibleCols.gender && <th className="py-3 px-3">GENDER</th>}
                {visibleCols.category && <th className="py-3 px-3">CATEGORY</th>}
                {visibleCols.mobile && <th className="py-3 px-3">MOBILE NUMBER</th>}
                {visibleCols.transactionId && <th className="py-3 px-3">TRANSACTION ID</th>}
                {visibleCols.enrolled && <th className="py-3 px-3 text-center">ENROLLED</th>}
                {visibleCols.action && <th className="py-3 px-3 text-right">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#80229a]" />
                    Loading online admission directory...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isActionOpen = openActionId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-purple-50/20 transition">
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                        {rowNumber}
                      </td>
                      {visibleCols.studentName && (
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {item.studentName}
                        </td>
                      )}
                      {visibleCols.course && (
                        <td className="py-2.5 px-3 text-slate-700">
                          {item.course}
                        </td>
                      )}
                      {visibleCols.batch && (
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.batch || 'Batch 2025-2029'}
                        </td>
                      )}
                      {visibleCols.fatherName && (
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.fatherName || '-'}
                        </td>
                      )}
                      {visibleCols.dob && (
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.dob || '-'}
                        </td>
                      )}
                      {visibleCols.gender && (
                        <td className="py-2.5 px-3 text-slate-700">
                          {item.gender}
                        </td>
                      )}
                      {visibleCols.category && (
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.category || 'General'}
                        </td>
                      )}
                      {visibleCols.mobile && (
                        <td className="py-2.5 px-3 text-slate-700 font-mono">
                          {item.mobile}
                        </td>
                      )}
                      {visibleCols.transactionId && (
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {item.transactionId || '-'}
                        </td>
                      )}
                      {visibleCols.enrolled && (
                        <td className="py-2.5 px-3 text-center">
                          {item.enrolled ? (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </td>
                      )}
                      {visibleCols.action && (
                        <td className="py-2.5 px-3 text-right relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setOpenActionId(isActionOpen ? null : item._id)}
                              className="px-2.5 py-1 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs"
                            >
                              Action <ChevronDown className="h-3 w-3" />
                            </button>

                            {isActionOpen && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsDetailsOpen(true);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#80229a]" />
                                  View Details
                                </button>

                                {!item.enrolled && (
                                  <button
                                    type="button"
                                    onClick={() => handleEnroll(item)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-semibold"
                                  >
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Enroll Student
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDelete(item._id, item.studentName)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2 border-t border-slate-100"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  Delete
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

        {/* Footer: Pagination (Screenshot 2) */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium"
            >
              Previous
            </button>
            <span className="px-2.5 py-1 bg-[#80229a] text-white rounded font-bold">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || filtered.length === 0}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="bg-gradient-to-r from-[#80229a] to-[#a23bbd] p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Online Admission #{selectedItem.referenceNo}</h3>
                <p className="text-[11px] text-purple-200">Application Intake Profile</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candidate Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedItem.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Course Applied</span>
                  <span className="font-semibold text-[#80229a]">{selectedItem.course}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Batch</span>
                  <span className="text-slate-700">{selectedItem.batch || 'Batch 2025-2029'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gender & DOB</span>
                  <span className="text-slate-700">{selectedItem.gender} • {selectedItem.dob}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p><strong className="text-slate-700">Father Name:</strong> {selectedItem.fatherName}</p>
                <p><strong className="text-slate-700">Category:</strong> {selectedItem.category}</p>
                <p><strong className="text-slate-700">Mobile:</strong> {selectedItem.mobile}</p>
                <p><strong className="text-slate-700">Email:</strong> {selectedItem.email || 'N/A'}</p>
                <p><strong className="text-slate-700">Transaction ID:</strong> {selectedItem.transactionId}</p>
                <p><strong className="text-slate-700">Application Date:</strong> {selectedItem.applicationDate}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700"
              >
                Close
              </button>

              {!selectedItem.enrolled && (
                <button
                  onClick={() => {
                    handleEnroll(selectedItem);
                    setIsDetailsOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Approve & Enroll Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
