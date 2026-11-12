'use client';

import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

interface FieldOption {
  key: string; // CSV column name shown in dropdown (e.g., admission_no)
  dtoKey: string; // Backend Student schema/DTO key
  label: string;
  required?: boolean;
}

const EXPORT_FIELDS: FieldOption[] = [
  { key: 'admission_no', dtoKey: 'admissionNo', label: 'admission_no', required: true },
  { key: 'roll_no', dtoKey: 'rollNo', label: 'roll_no' },
  { key: 'first_name', dtoKey: 'firstName', label: 'first_name' },
  { key: 'last_name', dtoKey: 'lastName', label: 'last_name' },
  { key: 'course', dtoKey: 'course', label: 'course' },
  { key: 'semester', dtoKey: 'semester', label: 'semester' },
  { key: 'category', dtoKey: 'category', label: 'category' },
  { key: 'blood_group', dtoKey: 'bloodGroup', label: 'blood_group' },
  { key: 'mobile_number', dtoKey: 'mobileNumber', label: 'mobile_number' },
  { key: 'email', dtoKey: 'email', label: 'email' },
  { key: 'father_name', dtoKey: 'fatherName', label: 'father_name' },
  { key: 'mother_name', dtoKey: 'motherName', label: 'mother_name' },
  { key: 'gender', dtoKey: 'gender', label: 'gender' },
  { key: 'date_of_birth', dtoKey: 'dateOfBirth', label: 'date_of_birth' },
  { key: 'house', dtoKey: 'house', label: 'house' },
  { key: 'batch', dtoKey: 'batch', label: 'batch' },
];

const CSV_TO_DTO_MAP: Record<string, string> = {
  admission_no: 'admissionNo',
  admissionno: 'admissionNo',
  roll_no: 'rollNo',
  rollno: 'rollNo',
  first_name: 'firstName',
  firstname: 'firstName',
  last_name: 'lastName',
  lastname: 'lastName',
  course: 'course',
  semester: 'semester',
  category: 'category',
  blood_group: 'bloodGroup',
  bloodgroup: 'bloodGroup',
  mobile_number: 'mobileNumber',
  mobilenumber: 'mobileNumber',
  father_name: 'fatherName',
  fathername: 'fatherName',
  mother_name: 'motherName',
  mothername: 'motherName',
  email: 'email',
  gender: 'gender',
  date_of_birth: 'dateOfBirth',
  dateofbirth: 'dateOfBirth',
  dob: 'dateOfBirth',
  house: 'house',
  batch: 'batch',
};

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ImportExportStudentView({ onNavigate }: Props) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['admission_no']);
  const [fieldsDropdownOpen, setFieldsDropdownOpen] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);

  const [exporting, setExporting] = useState(false);

  // Import state
  const [csvFileName, setCsvFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fieldsRef.current && !fieldsRef.current.contains(e.target as Node)) {
        setFieldsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleField = (fieldKey: string) => {
    if (fieldKey === 'admission_no') return; // always required as identifier
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((f) => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(EXPORT_FIELDS.map((f) => f.key));
  };

  const clearOptionalFields = () => {
    setSelectedFields(['admission_no']);
  };

  // Escape CSV cell
  const escapeCsv = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Export Students to CSV
  const handleExportStudent = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse) params.set('course', selectedCourse);
      if (selectedSemester) params.set('semester', selectedSemester);

      const res = await fetch(`${API}/student-info/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch students for export');
      const data = await res.json();
      const items: Record<string, unknown>[] = Array.isArray(data) ? data : data.items || [];

      if (items.length === 0) {
        showToast('error', 'No students found for the selected criteria.');
        setExporting(false);
        return;
      }

      const activeFieldObjects = EXPORT_FIELDS.filter((f) => selectedFields.includes(f.key));
      const headerLine = activeFieldObjects.map((f) => f.key).join(',');
      const dataLines = items.map((student) =>
        activeFieldObjects.map((f) => escapeCsv(student[f.dtoKey])).join(',')
      );

      const csvContent = [headerLine, ...dataLines].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = selectedCourse ? `_${selectedCourse.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      a.download = `students_export${suffix}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showToast('success', `Exported ${items.length} student record(s) successfully.`);
    } catch (err: any) {
      showToast('error', err?.message || 'Error exporting students');
    } finally {
      setExporting(false);
    }
  };

  // Parse CSV line supporting quoted values
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        showToast('error', 'CSV file must contain a header row and at least one student row.');
        setParsedRows([]);
        setCsvHeaders([]);
        return;
      }

      const rawHeaders = parseCsvLine(lines[0]);
      const normalizedHeaders = rawHeaders.map((h) => h.trim().toLowerCase());
      const hasAdmissionNo = normalizedHeaders.some(
        (h) => h === 'admission_no' || h === 'admissionno'
      );

      if (!hasAdmissionNo) {
        showToast('error', 'CSV must include an "admission_no" (or "admissionNo") column.');
        setParsedRows([]);
        setCsvHeaders([]);
        return;
      }

      const rows: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCsvLine(lines[i]);
        const dtoObj: Record<string, string> = {};
        rawHeaders.forEach((rawHeader, idx) => {
          const dtoKey = CSV_TO_DTO_MAP[rawHeader.trim().toLowerCase()];
          if (dtoKey && vals[idx] !== undefined && vals[idx] !== '') {
            dtoObj[dtoKey] = vals[idx];
          }
        });
        if (dtoObj.admissionNo) {
          rows.push(dtoObj);
        }
      }

      setCsvHeaders(rawHeaders);
      setParsedRows(rows);
      showToast('success', `Parsed ${rows.length} student row(s) from ${file.name}.`);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      showToast('error', 'Please upload a valid CSV file with student rows first.');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${API}/student-info/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedRows }),
      });
      if (!res.ok) throw new Error('Bulk import failed');
      const result = await res.json();
      showToast(
        'success',
        `Imported and updated ${result.updatedCount ?? parsedRows.length} student(s) successfully.`
      );
      setParsedRows([]);
      setCsvHeaders([]);
      setCsvFileName('');
    } catch (err: any) {
      showToast('error', err?.message || 'Error importing student updates');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      {/* Toast Notification */}
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
        {/* Top Page Header & Breadcrumb (exact match to screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-gray-800" />
            <h1 className="text-xl font-bold text-gray-800">Import/Export Student</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => onNavigate?.('student-update')}
              className="text-[#80229a] hover:underline font-medium cursor-pointer"
            >
              Student Bulk Update
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Student Update</span>
          </div>
        </div>

        {/* Select Criteria Card (exact match to screenshot) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-800">Select Criteria</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
                >
                  <option value="">Select Course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fields Multi-Select */}
              <div ref={fieldsRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fields</label>
                <button
                  type="button"
                  onClick={() => setFieldsDropdownOpen((o) => !o)}
                  className="w-full min-h-10 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a] text-gray-700 text-left"
                >
                  <span className="truncate">
                    {selectedFields.length === 1
                      ? selectedFields[0]
                      : `${selectedFields[0]} (+${selectedFields.length - 1} more)`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {fieldsDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 mb-1 text-xs">
                      <button
                        type="button"
                        onClick={selectAllFields}
                        className="text-[#80229a] font-medium hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearOptionalFields}
                        className="text-gray-500 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                    {EXPORT_FIELDS.map((field) => {
                      const checked = selectedFields.includes(field.key);
                      return (
                        <label
                          key={field.key}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-purple-50 ${
                            field.required ? 'opacity-80' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={field.required}
                            onChange={() => toggleField(field.key)}
                            className="accent-[#80229a] rounded"
                          />
                          <span className="text-gray-700">{field.label}</span>
                          {field.required && (
                            <span className="ml-auto text-[10px] uppercase tracking-wide text-[#80229a] font-semibold">
                              Required
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom-right Export Student Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleExportStudent}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#80229a] hover:bg-[#6a1b82] text-white text-sm font-medium shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Student
              </button>
            </div>
          </div>
        </div>

        {/* Import Student Card (Bulk Update via CSV) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#80229a]" />
              <h2 className="text-base font-semibold text-gray-800">
                Import Student (Bulk Update CSV)
              </h2>
            </div>
            {csvFileName && (
              <button
                type="button"
                onClick={() => {
                  setCsvFileName('');
                  setParsedRows([]);
                  setCsvHeaders([]);
                }}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear File
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-dashed border-purple-300 bg-purple-50/40">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  Upload modified CSV exported from above
                </p>
                <p className="text-xs text-gray-500">
                  Must contain <code className="px-1 py-0.5 bg-white rounded border">admission_no</code>{' '}
                  plus any updated columns (e.g. <code className="px-1 py-0.5 bg-white rounded border">roll_no</code>,{' '}
                  <code className="px-1 py-0.5 bg-white rounded border">category</code>,{' '}
                  <code className="px-1 py-0.5 bg-white rounded border">blood_group</code>,{' '}
                  <code className="px-1 py-0.5 bg-white rounded border">mobile_number</code>,{' '}
                  <code className="px-1 py-0.5 bg-white rounded border">house</code>).
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-[#80229a] text-[#80229a] hover:bg-purple-50 text-sm font-medium cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                {csvFileName ? csvFileName : 'Choose CSV File'}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {parsedRows.length > 0 && (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fef2f2] text-gray-700 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5">#</th>
                        {csvHeaders.map((h) => (
                          <th key={h} className="px-3 py-2.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                          {csvHeaders.map((h) => {
                            const dtoKey = CSV_TO_DTO_MAP[h.trim().toLowerCase()];
                            return (
                              <td key={h} className="px-3 py-2 text-gray-700">
                                {dtoKey ? row[dtoKey] || '-' : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedRows.length > 15 && (
                  <p className="text-xs text-gray-500">
                    Showing first 15 of {parsedRows.length} parsed student rows.
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={importing}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[#80229a] hover:bg-[#6a1b82] text-white text-sm font-medium shadow-sm transition disabled:opacity-60 cursor-pointer"
                  >
                    {importing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Import &amp; Update Students ({parsedRows.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NLET ERP Footer */}
      <footer className="bg-[#80229a] text-white text-center py-3 px-4 text-xs mt-8">
        Copyright © 2026 NLET. All rights reserved. <span className="font-semibold">Version (5.6)</span>
      </footer>
    </div>
  );
}

