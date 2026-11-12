'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StudentOption {
  _id: string;
  admissionNo: string;
  firstName: string;
  lastName?: string;
  course: string;
  semester?: string;
  fatherName?: string;
  fatherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  mobileNumber?: string;
  siblingAdmissionNo?: string;
  siblingName?: string;
  siblingRelation?: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function LinkSiblingsView({ onNavigate }: Props) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Accordion open state (key = guardianPhone)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Selected student IDs via checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [relation, setRelation] = useState('Sibling');

  // Manual Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [student1Adm, setStudent1Adm] = useState('');
  const [student2Adm, setStudent2Adm] = useState('');
  const [modalRelation, setModalRelation] = useState('Brother');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all students from API
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/student-info/students`);
      if (res.ok) {
        const data = await res.json();
        const items: StudentOption[] = Array.isArray(data) ? data : data.items || [];
        setStudents(items);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Group students by Guardian Phone No. (only groups with >= 2 students, matching ERP sibling detection)
  const groupedByPhone = useMemo(() => {
    const groups: Record<string, StudentOption[]> = {};
    for (const s of students) {
      const phone = (s.guardianPhone || s.fatherPhone || s.mobileNumber || '').trim();
      if (!phone || phone === '-') continue;
      if (!groups[phone]) groups[phone] = [];
      groups[phone].push(s);
    }

    // Keep groups with 2+ students (or if search term matches)
    const entries = Object.entries(groups)
      .filter(([phone, list]) => {
        if (list.length < 2) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          phone.includes(q) ||
          list.some(
            (s) =>
              s.admissionNo.toLowerCase().includes(q) ||
              `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(q) ||
              (s.guardianName || s.fatherName || '').toLowerCase().includes(q)
          )
        );
      })
      .sort((a, b) => b[1].length - a[1].length);

    return entries;
  }, [students, searchTerm]);

  // Expand all groups initially once loaded
  useEffect(() => {
    if (groupedByPhone.length > 0 && Object.keys(expandedGroups).length === 0) {
      const initial: Record<string, boolean> = {};
      groupedByPhone.forEach(([phone]) => {
        initial[phone] = true;
      });
      setExpandedGroups(initial);
    }
  }, [groupedByPhone, expandedGroups]);

  const toggleGroup = (phone: string) => {
    setExpandedGroups((prev) => ({ ...prev, [phone]: !prev[phone] }));
  };

  // Checkbox selection handlers
  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectGroup = (list: StudentOption[]) => {
    const groupIds = list.map((s) => s._id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  // Link selected students via API
  const handleLinkSelected = async () => {
    if (selectedIds.length < 2) {
      showToast('error', 'Please select at least 2 students to link as siblings.');
      return;
    }

    const selectedStudents = students.filter((s) => selectedIds.includes(s._id));
    if (selectedStudents.length < 2) return;

    setLinking(true);
    try {
      const primary = selectedStudents[0];
      for (let i = 1; i < selectedStudents.length; i++) {
        const sibling = selectedStudents[i];
        await fetch(`${API}/student-info/link-sibling`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentAdmissionNo: primary.admissionNo,
            siblingAdmissionNo: sibling.admissionNo,
            relation,
          }),
        });
      }

      showToast(
        'success',
        `Successfully linked ${selectedStudents.length} students as siblings!`
      );
      setSelectedIds([]);
      fetchStudents();
    } catch {
      showToast('error', 'Failed to link selected siblings');
    } finally {
      setLinking(false);
    }
  };

  // Manual Link Modal Submit
  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student1Adm || !student2Adm) {
      showToast('error', 'Please select both students');
      return;
    }
    if (student1Adm === student2Adm) {
      showToast('error', 'Cannot link a student to themselves');
      return;
    }

    setLinking(true);
    try {
      const res = await fetch(`${API}/student-info/link-sibling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAdmissionNo: student1Adm,
          siblingAdmissionNo: student2Adm,
          relation: modalRelation,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        showToast('success', 'Siblings linked successfully!');
        setShowLinkModal(false);
        setStudent1Adm('');
        setStudent2Adm('');
        fetchStudents();
      } else {
        showToast('error', data.message || 'Failed to link siblings');
      }
    } catch {
      showToast('error', 'Network error while linking siblings');
    } finally {
      setLinking(false);
    }
  };

  // Unlink Sibling
  const handleUnlink = async (student: StudentOption) => {
    if (!confirm(`Unlink sibling connection for ${student.firstName} ${student.lastName || ''}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API}/student-info/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siblingAdmissionNo: '',
          siblingName: '',
          siblingRelation: '',
        }),
      });
      if (res.ok) {
        showToast('success', 'Sibling link removed.');
        fetchStudents();
      }
    } catch {
      showToast('error', 'Failed to unlink sibling');
    }
  };

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
            <Users className="w-6 h-6 text-slate-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Sibling</h1>
        </div>

        {/* Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            onClick={() => onNavigate?.('student-admission')}
            className="hover:text-[#80229a] cursor-pointer"
          >
            Student Info
          </span>
          <span>/</span>
          <span className="text-[#80229a] font-semibold">Sibling List</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN STUDENT SIBLING LIST CARD                              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide">Student Sibling List</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search phone, name, adm no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] w-52"
              />
            </div>

            {/* Link Selected Action (shown when >= 2 checked) */}
            {selectedIds.length >= 2 && (
              <div className="flex items-center gap-2 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="text-xs bg-white border border-purple-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none"
                >
                  <option value="Sibling">Sibling</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Twin">Twin</option>
                </select>
                <button
                  onClick={handleLinkSelected}
                  disabled={linking}
                  className="flex items-center gap-1 px-3 py-1 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{linking ? 'Linking...' : `Link Selected (${selectedIds.length})`}</span>
                </button>
              </div>
            )}

            {/* Manual Link Sibling Button */}
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Sibling</span>
            </button>
          </div>
        </div>

        {/* Accordion Groups Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#80229a]" />
              <span>Loading student sibling groups...</span>
            </div>
          ) : groupedByPhone.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No student groups sharing the same Guardian Phone Number were found.
            </div>
          ) : (
            groupedByPhone.map(([phone, list]) => {
              const isExpanded = expandedGroups[phone] !== false;
              const allGroupSelected = list.every((s) => selectedIds.includes(s._id));

              return (
                <div
                  key={phone}
                  className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs"
                >
                  {/* Accordion Header: Guardian Phone No. - XXXXXXXXXX */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(phone)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#f1f5f9] hover:bg-slate-200/70 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#80229a] text-xs sm:text-sm">
                        Guardian Phone No. - {phone}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-[#80229a] font-semibold">
                        {list.length} Students
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {/* Accordion Table Body */}
                  {isExpanded && (
                    <div className="overflow-x-auto bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#fef2f2] border-y border-rose-100 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                            <th className="py-3 px-4 w-10">
                              <input
                                type="checkbox"
                                checked={allGroupSelected}
                                onChange={() => toggleSelectGroup(list)}
                                className="rounded border-slate-300 text-[#80229a] focus:ring-[#80229a] cursor-pointer"
                                title="Select all in group"
                              />
                            </th>
                            <th className="py-3 px-4">STUDENT NAME</th>
                            <th className="py-3 px-4">ADMISSION NO</th>
                            <th className="py-3 px-4">GUARDIAN NAME</th>
                            <th className="py-3 px-4">GUARDIAN PHONE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {list.map((s) => {
                            const isChecked = selectedIds.includes(s._id);
                            const fullName = `${s.firstName} ${s.lastName || ''}`.trim().toUpperCase();
                            const courseLabel = s.semester ? `${s.course}-${s.semester}` : s.course;
                            const guardianName = (s.guardianName || s.fatherName || '-').toUpperCase();
                            const guardianPhone = s.guardianPhone || s.fatherPhone || s.mobileNumber || phone;

                            return (
                              <tr
                                key={s._id}
                                className={`hover:bg-slate-50/80 transition-colors ${
                                  isChecked ? 'bg-purple-50/40' : ''
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelectStudent(s._id)}
                                    className="rounded border-slate-300 text-[#80229a] focus:ring-[#80229a] cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-800">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span>
                                      {fullName} ({courseLabel})
                                    </span>
                                    {s.siblingAdmissionNo && (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        title={`Linked with ${s.siblingName || s.siblingAdmissionNo} (${s.siblingRelation || 'Sibling'})`}
                                      >
                                        <Link2 className="w-2.5 h-2.5" />
                                        <span>Linked: {s.siblingAdmissionNo}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnlink(s);
                                          }}
                                          className="ml-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                          title="Unlink Sibling"
                                        >
                                          <Unlink className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-700">
                                  {s.admissionNo}
                                </td>
                                <td className="py-3 px-4 text-slate-700">
                                  {guardianName}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-700">
                                  {guardianPhone}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MANUAL LINK SIBLING MODAL                                   */}
      {/* ============================================================== */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-4 bg-[#80229a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <h3 className="text-sm font-bold">Link Student Siblings</h3>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualLink} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Primary Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={student1Adm}
                  onChange={(e) => setStudent1Adm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white text-xs"
                >
                  <option value="">Select Primary Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s.admissionNo}>
                      {s.firstName} {s.lastName || ''} ({s.admissionNo}) - {s.course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Sibling Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={student2Adm}
                  onChange={(e) => setStudent2Adm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white text-xs"
                >
                  <option value="">Select Sibling Student</option>
                  {students
                    .filter((s) => s.admissionNo !== student1Adm)
                    .map((s) => (
                      <option key={s._id} value={s.admissionNo}>
                        {s.firstName} {s.lastName || ''} ({s.admissionNo}) - {s.course}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Relation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modalRelation}
                  onChange={(e) => setModalRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white text-xs"
                >
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Twin">Twin</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-md text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {linking ? 'Linking...' : 'Link Siblings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FOOTER (EXACT COPYRIGHT NOTICE)                             */}
      {/* ============================================================== */}
      <footer className="text-center text-xs text-slate-400 py-4">
        Copyright © 2026 NLET. All rights reserved. Version (5.6)
      </footer>
    </div>
  );
}
