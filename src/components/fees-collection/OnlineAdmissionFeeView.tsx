'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CreditCard,
  FileText,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  Eye,
  X,
  Building,
  GraduationCap,
  Calendar,
  Check,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/fees-collection/online-admission-fee`;

export interface OnlineAdmissionItem {
  _id: string;
  applicationNo: string;
  admissionNo?: string;
  studentName: string;
  fatherName?: string;
  course: string;
  semester: string;
  phone: string;
  email?: string;
  transactionId: string;
  gateway: string;
  amount: number;
  paymentDate: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  remarks?: string;
  createdAt?: string;
}

const COURSES = [
  'All Courses',
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
];

const SEMESTERS = [
  'All Semesters',
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

const STATUS_OPTIONS = ['All', 'Success', 'Pending', 'Failed', 'Refunded'];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function OnlineAdmissionFeeView({ onNavigate }: Props) {
  const [items, setItems] = useState<OnlineAdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalTransactions: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  // Modal states
  const [receiptModalItem, setReceiptModalItem] = useState<OnlineAdmissionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State for new entry
  const [formData, setFormData] = useState({
    applicationNo: '',
    admissionNo: '',
    studentName: '',
    fatherName: '',
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    phone: '',
    email: '',
    transactionId: '',
    gateway: 'Razorpay / UPI',
    amount: 25000,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'Success' as 'Success' | 'Pending' | 'Failed' | 'Refunded',
    remarks: 'Online admission transaction',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCourse !== 'All Courses') params.append('course', selectedCourse);
      if (selectedSemester !== 'All Semesters') params.append('semester', selectedSemester);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);

      // Also fetch stats
      const statsRes = await fetch(`${ENDPOINT}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch online admission fee records.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5" /> Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Status toggle handler
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Create new record
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create online admission fee');
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        applicationNo: '',
        admissionNo: '',
        studentName: '',
        fatherName: '',
        course: 'B.Sc. Nursing',
        semester: 'Semester 1',
        phone: '',
        email: '',
        transactionId: '',
        gateway: 'Razorpay / UPI',
        amount: 25000,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Success',
        remarks: 'Online admission transaction',
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating record');
    } finally {
      setSaving(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!items.length) return;
    const header = 'Application No\tStudent Name\tCourse\tSemester\tTxn ID\tGateway\tAmount\tDate\tStatus\n';
    const body = items
      .map(
        (i) =>
          `${i.applicationNo}\t${i.studentName}\t${i.course}\t${i.semester}\t${i.transactionId}\t${i.gateway}\t₹${i.amount}\t${i.paymentDate}\t${i.status}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!items.length) return;
    const header = 'Application No,Admission No,Student Name,Father Name,Course,Semester,Phone,Transaction ID,Gateway,Amount,Payment Date,Status\n';
    const rows = items
      .map(
        (i) =>
          `"${i.applicationNo}","${i.admissionNo || ''}","${i.studentName}","${i.fatherName || ''}","${i.course}","${i.semester}","${i.phone}","${i.transactionId}","${i.gateway}",${i.amount},"${i.paymentDate}","${i.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Online_Admission_Fees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print list
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span
              onClick={() => onNavigate?.('dashboard')}
              className="hover:text-[#80229a] cursor-pointer"
            >
              Fees Collection
            </span>
            <span>/</span>
            <span className="text-[#80229a] font-semibold">Online Admission Fee</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#80229a]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Online Admission Fee</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Online Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Online Collection
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              ₹{stats.totalCollected.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Successfully Verified
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-[#80229a] flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {stats.totalTransactions}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {stats.successCount} Successful Admissions
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Pending Approvals
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingCount}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">Awaiting Bank Clearance</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Failed / Incomplete
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {stats.failedCount}
            </p>
            <p className="text-xs text-rose-500 font-medium mt-1">Gateway Timeouts / Dropped</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Select Criteria / Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800">Select Criteria</h2>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Semester / Year
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Payment Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] bg-white"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCourse('All Courses');
                setSelectedSemester('All Semesters');
                setSelectedStatus('All');
                setSearchTerm('');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Online Admission Fee Records
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-semibold">
              {items.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search student, txn, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Export buttons */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Copy table data"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                <th className="py-3 px-4">Application / Adm No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course & Semester</th>
                <th className="py-3 px-4">Transaction ID & Gateway</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#80229a]" />
                      <span>Loading online admission records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No online admission fee records found matching criteria.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-800">{row.applicationNo}</span>
                      {row.admissionNo && (
                        <div className="text-[10px] text-slate-400">{row.admissionNo}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{row.studentName}</div>
                      {row.fatherName && (
                        <div className="text-[11px] text-slate-400">S/O {row.fatherName}</div>
                      )}
                      <div className="text-[10px] text-slate-400">{row.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{row.course}</div>
                      <div className="text-[11px] text-purple-600">{row.semester}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-medium">{row.transactionId}</div>
                      <div className="text-[10px] text-slate-400">{row.gateway}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      ₹{row.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.paymentDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge(row.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setReceiptModalItem(row)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View & Print Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {row.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(row._id, 'Success')}
                            className="px-2 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
                            title="Verify & Approve"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {items.length} online transactions</span>
          <span>Copyright © 2026 NLET. All rights reserved. Version (5.6)</span>
        </div>
      </div>

      {/* Receipt / Details Modal */}
      {receiptModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#80229a]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Online Admission Fee Receipt
                </h3>
              </div>
              <button
                onClick={() => setReceiptModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Content */}
            <div className="p-6 space-y-4 printable-receipt">
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-[#80229a] uppercase tracking-wide">
                  Electro Institute of Nursing and Paramedical Sciences
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Affiliated with State Paramedical Faculty & Nursing Council
                </p>
                <span className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                  PAYMENT ACKNOWLEDGEMENT RECEIPT
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Application No</span>
                  <span className="font-bold text-slate-800">{receiptModalItem.applicationNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Admission No</span>
                  <span className="font-bold text-slate-800">{receiptModalItem.admissionNo || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Name</span>
                  <span className="font-bold text-slate-800">{receiptModalItem.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Father's Name</span>
                  <span className="font-medium text-slate-700">{receiptModalItem.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Course Enrolled</span>
                  <span className="font-semibold text-slate-800">{receiptModalItem.course}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Semester</span>
                  <span className="font-medium text-slate-700">{receiptModalItem.semester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800">{receiptModalItem.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Mode</span>
                  <span className="font-medium text-slate-700">{receiptModalItem.gateway}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Date</span>
                  <span className="font-medium text-slate-700">{receiptModalItem.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span>{renderStatusBadge(receiptModalItem.status)}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Total Admission Fee Paid</span>
                <span className="text-lg font-bold text-[#80229a]">
                  ₹{receiptModalItem.amount.toLocaleString()}
                </span>
              </div>

              {receiptModalItem.remarks && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: {receiptModalItem.remarks}
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Computer Generated Official Receipt</span>
                <span>Authorized Signatory</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setReceiptModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Record Online Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#80229a]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Record Online Admission Payment
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Application No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APP2026-007"
                    value={formData.applicationNo}
                    onChange={(e) => setFormData({ ...formData, applicationNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Admission No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-107"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate full name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Father's name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Course *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  >
                    {COURSES.filter((c) => c !== 'All Courses').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Semester / Year *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  >
                    {SEMESTERS.filter((s) => s !== 'All Semesters').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN_UPI_998124"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Gateway / Method
                  </label>
                  <select
                    value={formData.gateway}
                    onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  >
                    <option value="Razorpay / UPI">Razorpay / UPI</option>
                    <option value="Paytm UPI">Paytm UPI</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                  >
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

