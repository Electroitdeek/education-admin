'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ExamGroup {
  _id: string;
  name: string;
  examType: string;
  description?: string;
  createdAt?: string;
}

interface Exam {
  _id: string;
  name: string;
  examGroupName: string;
  session: string;
  course: string;
  semester: string;
  publishResult: boolean;
  description?: string;
}

const COURSES = [
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
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

export default function ExamGroupView({ onNavigate }: Props) {
  const [examGroups, setExamGroups] = useState<ExamGroup[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  // Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    examType: 'School/College Internal',
    description: '',
  });

  // Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedGroupForExam, setSelectedGroupForExam] = useState('');
  const [examFormData, setExamFormData] = useState({
    name: '',
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    session: '2025-26',
    publishResult: false,
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, examsRes] = await Promise.all([
        fetch(`${API}/examinations/exam-groups`),
        fetch(`${API}/examinations/exams`),
      ]);
      if (groupsRes.ok) setExamGroups(await groupsRes.json());
      if (examsRes.ok) setExams(await examsRes.json());
    } catch (err) {
      console.error('Failed to load exam data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/exam-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });

      if (res.ok) {
        const created = await res.json();
        setExamGroups((prev) => [created, ...prev]);
        setIsGroupModalOpen(false);
        setGroupFormData({ name: '', examType: 'School/College Internal', description: '' });
        setNotification({ type: 'success', message: 'Exam Group created successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to create exam group.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.name) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/examinations/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...examFormData,
          examGroupName: selectedGroupForExam,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setExams((prev) => [created, ...prev]);
        setIsExamModalOpen(false);
        setExamFormData({
          name: '',
          course: 'B.Sc. Nursing',
          semester: 'Semester 1',
          session: '2025-26',
          publishResult: false,
          description: '',
        });
        setNotification({ type: 'success', message: 'Exam added under group successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to add exam.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete exam group "${name}" and its associated exams?`)) return;

    try {
      const res = await fetch(`${API}/examinations/exam-groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExamGroups((prev) => prev.filter((g) => g._id !== id));
        setNotification({ type: 'success', message: 'Exam group deleted.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete exam group.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteExam = async (id: string, name: string) => {
    if (!confirm(`Delete exam "${name}"?`)) return;

    try {
      const res = await fetch(`${API}/examinations/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e._id !== id));
        setNotification({ type: 'success', message: 'Exam deleted.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete exam.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#80229a]" />
            Exam Group
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Examinations / Groups & Sessions • Continuous Assessments, Model Exams & Board Evaluations
          </p>
        </div>
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Exam Group
        </button>
      </div>

      {/* Exam Groups Card List */}
      <div className="space-y-5">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading exam groups...</div>
        ) : examGroups.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            No exam groups created yet. Click "Add Exam Group" to get started.
          </div>
        ) : (
          examGroups.map((group) => {
            const groupExams = exams.filter((e) => e.examGroupName === group.name);
            return (
              <div
                key={group._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Group Header */}
                <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-slate-800">{group.name}</h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#80229a] border border-purple-200">
                        {group.examType}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedGroupForExam(group.name);
                        setIsExamModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#80229a] hover:bg-[#6c1b82] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Exam
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group._id, group.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Exam Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exams under this group table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#fef2f2] text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                        <th className="py-2.5 px-4">Exam Name</th>
                        <th className="py-2.5 px-4">Session</th>
                        <th className="py-2.5 px-4">Course & Class</th>
                        <th className="py-2.5 px-4">Publish Result</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {groupExams.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-slate-400 italic">
                            No individual exams added under this group yet. Click "Add Exam" above.
                          </td>
                        </tr>
                      ) : (
                        groupExams.map((exam) => (
                          <tr key={exam._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">{exam.name}</td>
                            <td className="py-3 px-4 text-xs font-mono font-medium text-slate-700">
                              {exam.session}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="font-semibold text-slate-800">{exam.course}</span>
                              <span className="text-slate-500 ml-1">({exam.semester})</span>
                            </td>
                            <td className="py-3 px-4">
                              {exam.publishResult ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  <CheckCircle className="w-3 h-3" /> Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  Unpublished
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteExam(exam._id, exam.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Exam"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Exam Group */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#80229a] to-[#a832c0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <h3 className="font-bold text-lg">Add Exam Group</h3>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="e.g. 2nd Sessional Internal Assessment"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
                <select
                  value={groupFormData.examType}
                  onChange={(e) => setGroupFormData({ ...groupFormData, examType: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                >
                  <option value="School/College Internal">School/College Internal Continuous Evaluation</option>
                  <option value="INC Council Board">INC Council Board Examination</option>
                  <option value="General Purpose (Pass/Fail)">General Purpose (Pass/Fail)</option>
                  <option value="GPA / CGPA System">GPA / CGPA Grading System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="Brief exam group scope..."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white text-sm font-semibold rounded-md shadow-md transition-colors disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Save Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Exam under Group */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#80229a] to-[#a832c0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-lg">Add Exam in Group</h3>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-900">
                Group: {selectedGroupForExam}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={examFormData.name}
                  onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                  placeholder="e.g. B.Sc. Nursing Sem 1 Mid-Term Assessment"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                  <select
                    value={examFormData.course}
                    onChange={(e) => setExamFormData({ ...examFormData, course: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={examFormData.semester}
                    onChange={(e) => setExamFormData({ ...examFormData, semester: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session</label>
                  <select
                    value={examFormData.session}
                    onChange={(e) => setExamFormData({ ...examFormData, session: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examFormData.publishResult}
                      onChange={(e) =>
                        setExamFormData({ ...examFormData, publishResult: e.target.checked })
                      }
                      className="rounded text-[#80229a] focus:ring-[#80229a]"
                    />
                    <span>Publish Result to Students</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white text-sm font-semibold rounded-md shadow-md transition-colors disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

