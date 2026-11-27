'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Pencil,
  FileEdit,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';

interface StudentRow {
  _id: string;
  admissionNo: string;
  firstName: string;
  lastName?: string;
  rollNo?: string;
  course: string;
  semester?: string;
  category?: string;
  house?: string;
  batch?: string;
  bloodGroup?: string;
  mobileNumber?: string;
  fatherName?: string;
  email?: string;
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
  'DOTT-1st Year',
  'DECG-1st Year',
  'DMLT-1st Year',
];

const CATEGORIES = [
  'General',
  'OBC',
  'MBC',
  'SC',
  'ST',
  'EWS',
  'DC',
  'OBCNCL',
  'MBCNCL',
  'GEN-EWS',
  'SBC',
];

const HOUSES = [
  'Florence Nightingale House',
  'Mother Teresa House',
  'Red Cross House',
  'Charaka House',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentUpdateView({ onNavigate }: Props) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [editedMap, setEditedMap] = useState<Record<string, Partial<StudentRow>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Criteria Filters (exact match to screenshot)
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  // Bulk Update Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Students based on Course & Semester
  const fetchStudents = useCallback(async (course: string, semester: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (semester) params.append('semester', semester);

      const res = await fetch(`${API}/student-info/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const items: StudentRow[] = Array.isArray(data) ? data : data.items || [];
        setStudents(items);
        setEditedMap({});
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load when both Course & Semester are selected
  useEffect(() => {
    if (selectedCourse || selectedSemester) {
      setHasSearched(true);
      fetchStudents(selectedCourse, selectedSemester);
    }
  }, [selectedCourse, selectedSemester, fetchStudents]);

  const handleFieldChange = (id: string, field: keyof StudentRow, value: string) => {
    setEditedMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    const updateIds = Object.keys(editedMap);
    if (updateIds.length === 0) {
      showToast('error', 'No modified student rows to save.');
      return;
    }

    const payloadStudents = updateIds
      .map((id) => {
        const orig = students.find((s) => s._id === id);
        if (!orig) return null;
        return {
          admissionNo: orig.admissionNo,
          ...editedMap[id],
        };
      })
      .filter(Boolean);

    setSaving(true);
    try {
      const res = await fetch(`${API}/student-info/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: payloadStudents }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', `Successfully updated ${data.updatedCount || payloadStudents.length} student record(s)!`);
        fetchStudents(selectedCourse, selectedSemester);
      } else {
        showToast('error', 'Failed to save bulk updates');
      }
    } catch {
      showToast('error', 'Network error while saving updates');
    } finally {
      setSaving(false);
    }
  };

  // Download CSV Template for Bulk Update Import
  const handleDownloadTemplate = () => {
    const header = 'admissionNo,rollNo,category,bloodGroup,mobileNumber,fatherName,house\n';
    const rows = (students.length > 0 ? students : [
      {
        admissionNo: 'ADM-2026-101',
        rollNo: 'NUR-01',
        category: 'General',
        bloodGroup: 'B+',
        mobileNumber: '9876543210',
        fatherName: 'Rajesh Sharma',
        house: 'Florence Nightingale House',
      },
    ])
      .map(
        (s) =>
          `"${s.admissionNo}","${s.rollNo || ''}","${s.category || 'General'}","${s.bloodGroup || ''}","${s.mobileNumber || ''}","${s.fatherName || ''}","${s.house || ''}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulk_Student_Update_Template_${selectedCourse || 'All'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV Upload Parse
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || '';
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length < 2) {
        showToast('error', 'CSV file must contain header and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.replace(/"/g, '').trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          if (vals[idx] !== undefined && vals[idx] !== '') {
            obj[h] = vals[idx];
          }
        });
        return obj;
      }).filter((r) => r.admissionNo);

      setParsedImportRows(rows);
    };
    reader.readAsText(file);
  };

  // Submit CSV Bulk Update Import
  const handleImportSubmit = async () => {
    if (parsedImportRows.length === 0) {
      showToast('error', 'Please upload a valid CSV file first.');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${API}/student-info/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedImportRows }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', `Bulk Update Import completed: ${data.updatedCount || parsedImportRows.length} student(s) updated!`);
        setShowImportModal(false);
        setCsvFileName('');
        setParsedImportRows([]);
        if (hasSearched) {
          fetchStudents(selectedCourse, selectedSemester);
        }
      } else {
        showToast('error', 'Failed to import bulk updates');
      }
    } catch {
      showToast('error', 'Network error during import');
    } finally {
      setImporting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!tableSearch.trim()) return students;
    const q = tableSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.admissionNo.toLowerCase().includes(q) ||
        `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.mobileNumber || '').includes(q)
    );
  }, [students, tableSearch]);

  const modifiedCount = Object.keys(editedMap).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium text-xs transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB (EXACT ERP LAYOUT)                  */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-slate-800">
            <Pencil className="w-5 h-5 text-slate-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Update</h1>
        </div>

        {/* Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <div
            onClick={() => onNavigate?.('student-details')}
            className="flex items-center gap-1 text-[#80229a] hover:underline cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Bulk Update</span>
          </div>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Student Update</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SELECT CRITERIA CARD (WITH BULK UPDATE IMPORT BUTTON)       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">Select Criteria</h2>
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate ? onNavigate('student-import-export') : setShowImportModal(true)
            }
            className="px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            Bulk Update Import
          </button>
        </div>

        {/* Card Body: Course * and Semester * */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
              >
                <option value="">Select Course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] focus:border-[#80229a] bg-white text-xs text-slate-700"
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
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. INLINE EDITABLE STUDENT UPDATE TABLE (ON SELECTION)         */}
      {/* ============================================================== */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
          {/* Table Header Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">
                Bulk Student Update List
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-bold text-[11px]">
                {filteredStudents.length} Students
              </span>
              {modifiedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                  {modifiedCount} Modified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] w-44"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchStudents(selectedCourse, selectedSemester)}
                className="p-1.5 text-slate-500 hover:text-[#80229a] border border-slate-200 rounded transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving || modifiedCount === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : `Save Changes${modifiedCount > 0 ? ` (${modifiedCount})` : ''}`}</span>
              </button>
            </div>
          </div>

          {/* Editable Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] border-b border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  <th className="py-3 px-3 w-10">#</th>
                  <th className="py-3 px-3">ADMISSION NO</th>
                  <th className="py-3 px-3">STUDENT NAME</th>
                  <th className="py-3 px-3">ROLL NO</th>
                  <th className="py-3 px-3">CATEGORY</th>
                  <th className="py-3 px-3">BLOOD GROUP</th>
                  <th className="py-3 px-3">MOBILE NUMBER</th>
                  <th className="py-3 px-3">FATHER NAME</th>
                  <th className="py-3 px-3">HOUSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-[#80229a]" />
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No students found for the selected Course & Semester.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const edits = editedMap[s._id] || {};
                    const isModified = Boolean(editedMap[s._id]);
                    return (
                      <tr
                        key={s._id}
                        className={`hover:bg-slate-50/80 transition ${
                          isModified ? 'bg-purple-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#80229a] whitespace-nowrap">
                          {s.admissionNo}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {s.firstName} {s.lastName || ''}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={edits.rollNo !== undefined ? edits.rollNo : s.rollNo || ''}
                            onChange={(e) => handleFieldChange(s._id, 'rollNo', e.target.value)}
                            className="w-24 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={edits.category !== undefined ? edits.category : s.category || 'General'}
                            onChange={(e) => handleFieldChange(s._id, 'category', e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={edits.bloodGroup !== undefined ? edits.bloodGroup : s.bloodGroup || ''}
                            onChange={(e) => handleFieldChange(s._id, 'bloodGroup', e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs"
                          >
                            <option value="">Select</option>
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>
                                {bg}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={edits.mobileNumber !== undefined ? edits.mobileNumber : s.mobileNumber || ''}
                            onChange={(e) => handleFieldChange(s._id, 'mobileNumber', e.target.value)}
                            className="w-28 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={edits.fatherName !== undefined ? edits.fatherName : s.fatherName || ''}
                            onChange={(e) => handleFieldChange(s._id, 'fatherName', e.target.value)}
                            className="w-36 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={edits.house !== undefined ? edits.house : s.house || ''}
                            onChange={(e) => handleFieldChange(s._id, 'house', e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#80229a] bg-white text-xs"
                          >
                            <option value="">Select</option>
                            {HOUSES.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BULK UPDATE IMPORT MODAL                                    */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-4 bg-[#80229a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <h3 className="text-sm font-bold">Bulk Update Import (CSV)</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg space-y-2">
                <p className="font-semibold text-[#80229a]">
                  Step 1: Download Sample CSV Template
                </p>
                <p className="text-slate-600">
                  Download the template pre-filled with Admission Numbers, edit the fields in Excel, and upload it back.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-[#80229a] hover:bg-purple-100 rounded font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">
                  Step 2: Upload Updated CSV File <span className="text-rose-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#80229a] rounded-lg p-6 cursor-pointer transition bg-slate-50/50">
                  <Upload className="w-6 h-6 text-[#80229a] mb-2" />
                  <span className="font-medium text-slate-700">
                    {csvFileName || 'Click to choose a .csv file'}
                  </span>
                  {parsedImportRows.length > 0 && (
                    <span className="mt-1 text-emerald-700 font-bold">
                      {parsedImportRows.length} student row(s) ready to update
                    </span>
                  )}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing || parsedImportRows.length === 0}
                className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import & Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. FOOTER (EXACT COPYRIGHT NOTICE)                             */}
      {/* ============================================================== */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </footer>
    </div>
  );
}
