'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FastForward,
  Search,
  ChevronRight,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/fees-collection/fees-opening-balance`;

export interface FeesOpeningBalanceRecord {
  _id?: string;
  studentName: string;
  admissionNo: string;
  rollNo?: string;
  course: string;
  semester: string;
  fatherName?: string;
  phone?: string;
  openingBalance: number;
  academicYear?: string;
  status: string; // 'Pending' | 'Settled' | 'Saved'
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT (Medical Lab)',
  'DRT (Radiology)',
  'DOT (Operation Theatre)',
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

export default function FeesOpeningBalanceView({
  onNavigate,
}: {
  onNavigate?: (view: string) => void;
} = {}) {
  // Search Criteria State matching reference screenshot
  const [course, setCourse] = useState<string>('');
  const [semester, setSemester] = useState<string>('');

  // Table & Data State
  const [records, setRecords] = useState<FeesOpeningBalanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof FeesOpeningBalanceRecord>('studentName');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Editable balances map for inline editing
  const [editedBalances, setEditedBalances] = useState<{ [id: string]: number }>({});
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editRecord, setEditRecord] = useState<FeesOpeningBalanceRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<FeesOpeningBalanceRecord | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState<string>('');
  const [formAdmissionNo, setFormAdmissionNo] = useState<string>('');
  const [formRollNo, setFormRollNo] = useState<string>('');
  const [formCourse, setFormCourse] = useState<string>(COURSES[0]);
  const [formSemester, setFormSemester] = useState<string>(SEMESTERS[0]);
  const [formFatherName, setFormFatherName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);
  const [formNote, setFormNote] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('Pending');

  // Notifications
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Fetch Data from API
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (course && course !== 'Select Course') params.append('course', course);
      if (semester && semester !== 'Select Semester') params.append('semester', semester);
      if (tableSearch) params.append('search', tableSearch);

      const res = await fetch(`${ENDPOINT}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        // Initialize edited balances map
        const initialMap: { [id: string]: number } = {};
        data.forEach((r: FeesOpeningBalanceRecord) => {
          if (r._id) initialMap[r._id] = r.openingBalance || 0;
        });
        setEditedBalances(initialMap);
      } else {
        showAlert('Failed to load opening balances from server', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Could not connect to API server on port 5000', 'error');
    } finally {
      setLoading(false);
    }
  }, [course, semester, tableSearch]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search Criteria button click
  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
    showAlert('Filter criteria applied successfully');
  };

  // Handle Inline Balance Change
  const handleBalanceChange = (id: string, value: string) => {
    const num = Number(value) || 0;
    setEditedBalances((prev) => ({
      ...prev,
      [id]: num,
    }));
  };

  // Save Single Row Inline
  const handleSaveSingleRow = async (record: FeesOpeningBalanceRecord) => {
    if (!record._id) return;
    const newBal = editedBalances[record._id] ?? record.openingBalance;
    try {
      const res = await fetch(`${ENDPOINT}/${record._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingBalance: newBal,
          status: newBal > 0 ? 'Pending' : 'Settled',
        }),
      });
      if (res.ok) {
        showAlert(`Opening balance for ${record.studentName} updated to ₹${newBal.toLocaleString('en-IN')}`);
        fetchRecords();
      } else {
        showAlert('Failed to update balance', 'error');
      }
    } catch {
      showAlert('Error updating balance', 'error');
    }
  };

  // Save All Modified Rows (Batch Update)
  const handleSaveAllBalances = async () => {
    setIsSavingBatch(true);
    try {
      const items = Object.entries(editedBalances).map(([id, val]) => ({
        id,
        openingBalance: val,
      }));
      const res = await fetch(`${ENDPOINT}/batch-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const result = await res.json();
        showAlert(`Successfully saved opening balances for ${result.count || items.length} students!`);
        fetchRecords();
      } else {
        showAlert('Failed to save balances in batch', 'error');
      }
    } catch {
      showAlert('Server error during batch update', 'error');
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Delete Record
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete opening balance record for ${name}?`)) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert(`Deleted record for ${name}`);
        fetchRecords();
      } else {
        showAlert('Failed to delete', 'error');
      }
    } catch {
      showAlert('Error deleting record', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: FeesOpeningBalanceRecord) => {
    setEditRecord(rec);
    setFormName(rec.studentName);
    setFormAdmissionNo(rec.admissionNo);
    setFormRollNo(rec.rollNo || '');
    setFormCourse(rec.course);
    setFormSemester(rec.semester);
    setFormFatherName(rec.fatherName || '');
    setFormPhone(rec.phone || '');
    setFormOpeningBalance(rec.openingBalance || 0);
    setFormNote(rec.note || '');
    setFormStatus(rec.status || 'Pending');
    setShowAddModal(true);
  };

  // Reset Add Modal
  const handleOpenAdd = () => {
    setEditRecord(null);
    setFormName('');
    setFormAdmissionNo(`ADM-2025-${Math.floor(10 + Math.random() * 90)}`);
    setFormRollNo(`RN-${Math.floor(100 + Math.random() * 900)}`);
    setFormCourse(course && course !== 'Select Course' ? course : COURSES[0]);
    setFormSemester(semester && semester !== 'Select Semester' ? semester : SEMESTERS[0]);
    setFormFatherName('');
    setFormPhone('');
    setFormOpeningBalance(0);
    setFormNote('');
    setFormStatus('Pending');
    setShowAddModal(true);
  };

  // Save Add / Edit
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAdmissionNo.trim()) {
      showAlert('Please enter Student Name and Admission No.', 'error');
      return;
    }

    const payload = {
      studentName: formName.trim(),
      admissionNo: formAdmissionNo.trim(),
      rollNo: formRollNo.trim(),
      course: formCourse,
      semester: formSemester,
      fatherName: formFatherName.trim(),
      phone: formPhone.trim(),
      openingBalance: Number(formOpeningBalance) || 0,
      note: formNote.trim(),
      status: Number(formOpeningBalance) > 0 ? formStatus : 'Settled',
    };

    try {
      let res;
      if (editRecord && editRecord._id) {
        res = await fetch(`${ENDPOINT}/${editRecord._id}`, {
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
        showAlert(editRecord ? 'Record updated successfully!' : 'New student opening balance added!');
        setShowAddModal(false);
        fetchRecords();
      } else {
        showAlert('Failed to save record', 'error');
      }
    } catch {
      showAlert('Server connection error', 'error');
    }
  };

  // Print Handlers
  const handlePrint = (rec: FeesOpeningBalanceRecord) => {
    setPrintRecord(rec);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['#', 'Student Name', 'Admission No', 'Roll No', 'Course', 'Semester', 'Opening Balance', 'Status', 'Note'];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.studentName}"`,
      `"${r.admissionNo}"`,
      `"${r.rollNo || ''}"`,
      `"${r.course}"`,
      `"${r.semester}"`,
      r.openingBalance,
      `"${r.status}"`,
      `"${r.note || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fees_opening_balance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV exported successfully');
  };

  const handleCopy = () => {
    const text = records
      .map((r, i) => `${i + 1}. ${r.studentName} (${r.admissionNo}) - ₹${r.openingBalance} [${r.status}]`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showAlert('Opening balances copied to clipboard!');
  };

  // Filtered & Sorted Records
  const filtered = records
    .filter((r) => {
      if (!tableSearch) return true;
      const s = tableSearch.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(s) ||
        r.admissionNo.toLowerCase().includes(s) ||
        (r.rollNo && r.rollNo.toLowerCase().includes(s)) ||
        (r.phone && r.phone.toLowerCase().includes(s)) ||
        (r.fatherName && r.fatherName.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalOpeningBalanceSum = records.reduce((sum, r) => sum + (editedBalances[r._id || ''] ?? r.openingBalance ?? 0), 0);

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

      {/* Top Header matching reference screenshot: ⏩ Fees Opening Balance & breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Double Right Arrow icon matching screenshot */}
          <div className="text-[#80229a]">
            <FastForward className="h-5 w-5 fill-[#80229a]" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Fees Opening Balance
          </h1>
        </div>

        {/* Breadcrumb matching reference screenshot: 👛 Fees Collection / Fees Opening Balance */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-sm">👛</span>
          <button
            onClick={() => onNavigate?.('collect-fee')}
            className="hover:text-[#80229a] transition cursor-pointer"
          >
            Fees Collection
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#80229a] font-semibold">Fees Opening Balance</span>
        </div>
      </div>

      {/* Select Criteria Card matching Reference Screenshot Exactly */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Search className="h-4 w-4 text-[#80229a]" />
          <h2 className="text-sm font-bold text-slate-700 tracking-wide">Select Criteria</h2>
        </div>

        <form onSubmit={handleSearchClick}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">Select Course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition cursor-pointer"
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button matching screenshot */}
          <div className="flex justify-end mt-5 pt-3 border-t border-slate-100/70">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition transform active:scale-95 disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results & Student Opening Balances Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800">
              Student Opening Balance List
            </h3>
            <span className="bg-purple-100 text-[#80229a] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {filtered.length} Students
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Total Dues: ₹{totalOpeningBalanceSum.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Student Record Button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Balance Record</span>
            </button>

            {/* Save All Modified Balances */}
            <button
              onClick={handleSaveAllBalances}
              disabled={isSavingBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingBatch ? 'Saving...' : 'Save All Changes'}</span>
            </button>

            {/* Export Buttons */}
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
                title="Print List"
                className="p-1.5 hover:bg-white/20 rounded transition"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Reset / Reload */}
            <button
              onClick={() => {
                setCourse('');
                setSemester('');
                setTableSearch('');
                fetchRecords();
              }}
              title="Reset Filters"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Page Size Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Search:</span>
            <input
              type="text"
              placeholder="Search by name, roll, admission no..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] w-64"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fef2f2] text-slate-700 font-bold border-b border-rose-100/60 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th
                  onClick={() => {
                    setSortField('studentName');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-[#80229a] transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Admission No</th>
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Semester</th>
                <th className="py-3 px-3 w-44">Opening Balance (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Note</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#80229a] border-t-transparent mb-2"></div>
                    <div>Loading opening balance records...</div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    <div className="text-3xl mb-1">📋</div>
                    <div className="font-semibold text-slate-600">No data available in table</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try selecting different Course / Semester criteria or add a new record.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((rec, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const currentVal = editedBalances[rec._id || ''] ?? rec.openingBalance ?? 0;
                  const isModified = currentVal !== rec.openingBalance;

                  return (
                    <tr
                      key={rec._id || idx}
                      className="hover:bg-purple-50/30 transition group"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-semibold">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[#80229a] font-bold">{rec.studentName}</span>
                          {rec.fatherName && (
                            <span className="text-[10px] text-slate-400">
                              S/O {rec.fatherName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">
                        {rec.admissionNo}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {rec.rollNo || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {rec.course}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {rec.semester}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={currentVal}
                            onChange={(e) => handleBalanceChange(rec._id || '', e.target.value)}
                            className={`w-28 text-xs font-bold px-2 py-1 border rounded-lg focus:outline-none transition ${
                              isModified
                                ? 'border-amber-400 bg-amber-50 text-amber-900 focus:ring-2 focus:ring-amber-300'
                                : 'border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]'
                            }`}
                          />
                          {isModified && (
                            <button
                              onClick={() => handleSaveSingleRow(rec)}
                              title="Save this row"
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            currentVal > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {currentVal > 0 ? 'Pending' : 'Settled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={rec.note}>
                        {rec.note || '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            title="Edit Student Details"
                            className="p-1.5 hover:bg-purple-100 text-[#80229a] rounded-md transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrint(rec)}
                            title="Print Ledger Summary"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec._id || '', rec.studentName)}
                            title="Delete Record"
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
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

      {/* Add / Edit Student Balance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scale-up">
            <div className="bg-[#80229a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FastForward className="h-5 w-5 fill-white" />
                <h3 className="font-bold text-sm tracking-wide">
                  {editRecord ? 'Edit Opening Balance' : 'Add Student Opening Balance'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Admission No *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAdmissionNo}
                    onChange={(e) => setFormAdmissionNo(e.target.value)}
                    placeholder="e.g. ADM-2025-10"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Roll No
                  </label>
                  <input
                    type="text"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    placeholder="e.g. RN-110"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    placeholder="Enter father name"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Course *
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Opening Balance (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formOpeningBalance}
                    onChange={(e) => setFormOpeningBalance(Number(e.target.value) || 0)}
                    placeholder="Enter amount"
                    className="w-full text-xs font-bold text-[#80229a] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Enter mobile"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Note / Arrears Reason
                </label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Previous year tuition fees or hostel fee carried forward"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {editRecord ? 'Update Record' : 'Save Opening Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Ledger Modal */}
      {printRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                Fees Opening Balance Receipt / Certificate
              </h3>
              <button
                onClick={() => setPrintRecord(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={printRef} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-[#80229a] uppercase">
                  Gangapur Institute of Nursing and Paramedical Sciences
                </h4>
                <p className="text-[10px] text-slate-500">Official Opening Balance Statement (Academic Year 2025-26)</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="font-semibold text-slate-500">Student Name:</span> {printRecord.studentName}</div>
                <div><span className="font-semibold text-slate-500">Admission No:</span> {printRecord.admissionNo}</div>
                <div><span className="font-semibold text-slate-500">Roll No:</span> {printRecord.rollNo || '-'}</div>
                <div><span className="font-semibold text-slate-500">Father Name:</span> {printRecord.fatherName || '-'}</div>
                <div><span className="font-semibold text-slate-500">Course:</span> {printRecord.course}</div>
                <div><span className="font-semibold text-slate-500">Semester:</span> {printRecord.semester}</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-purple-100 flex items-center justify-between">
                <span className="font-bold text-slate-700">Carried Forward Opening Dues:</span>
                <span className="text-base font-extrabold text-[#80229a]">
                  ₹{(editedBalances[printRecord._id || ''] ?? printRecord.openingBalance).toLocaleString('en-IN')}
                </span>
              </div>

              {printRecord.note && (
                <div className="text-[11px] text-slate-500 italic">
                  Note: {printRecord.note}
                </div>
              )}

              <div className="flex justify-between items-end pt-6 text-[10px] text-slate-400">
                <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mb-1"></div>
                  <span>Authorized Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintRecord(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer matching reference screenshot exactly: Copyright © 2026 NLET. All rights reserved. Version (5.6) */}
      <div className="text-center pt-8 pb-4 text-xs text-white/90 drop-shadow-sm font-medium">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </div>
    </div>
  );
}

