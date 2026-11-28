'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Printer,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  Search,
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

export const BATCH1_VIEW_IDS = [
  // 1. Online Class
  'online-class',
  'online-class-timetable',
  'online-class-attendees',
  // 2. Question Paper
  'qp-type',
  'qp-question',
  'qp-generate',
  // 3. Other programs
  'op-parameter',
  'op-assessment',
  'op-report',
  // 4. Download Center
  'dc-upload',
  'dc-assignments',
  'dc-study-material',
  'dc-syllabus',
  'dc-other',
  'dc-videos',
  // 5. Lesson Planner
  'lp-lesson',
  'lp-topic',
  'lp-manage',
  'lp-report',
  'lp-topic-report',
  'lp-topic-progress',
  'lp-lesson-progress',
  // 6. Assignment
  'assign-add',
  'assign-eval',
] as const;

export type Batch1ViewId = (typeof BATCH1_VIEW_IDS)[number];

const courseField = (required = true): FieldDef => ({
  name: 'course',
  label: 'Course',
  type: 'select',
  options: COURSES,
  required,
});

const semesterField = (required = true): FieldDef => ({
  name: 'semester',
  label: 'Semester',
  type: 'select',
  options: SEMESTERS,
  required,
});

function StatusBadge({ value }: { value?: string }) {
  const v = String(value || 'Pending');
  const lower = v.toLowerCase();
  let cls = 'bg-amber-50 text-amber-700 border-amber-200';
  if (['completed', 'live', 'evaluated', 'present', 'approved', 'active'].includes(lower)) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['scheduled', 'submitted', 'in progress'].includes(lower)) {
    cls = 'bg-purple-50 text-[#80229a] border-purple-200';
  } else if (['cancelled', 'absent', 'rejected'].includes(lower)) {
    cls = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {v}
    </span>
  );
}

// ============================================================================
// Custom Interactive View: Question Paper Generator (`qp-generate`)
// ============================================================================
function QuestionPaperGeneratorView() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [previewPaper, setPreviewPaper] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    title: '',
    course: COURSES[0],
    semester: SEMESTERS[0],
    subject: '',
    examDate: '',
    durationMinutes: 180,
    totalMarks: 75,
    questionCount: 10,
    questionType: '',
    difficulty: 'All',
    instructions: 'All questions are compulsory. Write neat and legible answers.',
  });

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadGenerated = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/question-paper/generated`);
      if (!res.ok) throw new Error('Failed to load generated papers');
      const data = await res.json();
      setPapers(Array.isArray(data) ? data : data.items || []);
    } catch (e: any) {
      notify(e?.message || 'Error loading generated papers', false);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadGenerated();
  }, [loadGenerated]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes) || 180,
        totalMarks: Number(form.totalMarks) || 75,
        questionCount: Number(form.questionCount) || 10,
        difficulty: form.difficulty === 'All' ? undefined : form.difficulty,
        questionType: form.questionType.trim() || undefined,
      };
      const res = await fetch(`${API_BASE}/question-paper/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to generate question paper');
      }
      const created = await res.json();
      notify('Question paper generated successfully');
      setPreviewPaper(created);
      setForm((p) => ({ ...p, title: '', subject: '' }));
      await loadGenerated();
    } catch (e: any) {
      notify(e?.message || 'Generation failed', false);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this generated question paper?')) return;
    try {
      const res = await fetch(`${API_BASE}/question-paper/generated/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      notify('Question paper deleted');
      if (previewPaper?._id === id) setPreviewPaper(null);
      await loadGenerated();
    } catch (e: any) {
      notify(e?.message || 'Failed to delete', false);
    }
  };

  const filtered = papers.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [p.title, p.course, p.semester, p.subject]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.ok ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Generate Question Paper</h1>
          <p className="text-xs text-slate-500 mt-0.5">Question Paper / Generate Question Paper</p>
        </div>
        <button
          onClick={loadGenerated}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Generator Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-fit">
          <h2 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#80229a]" /> Paper Configuration
          </h2>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Paper Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Mid-Term Anatomy Exam"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Course <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.course}
                  onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
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
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.semester}
                  onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Anatomy"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => setForm((p) => ({ ...p, examDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (m)</label>
                <input
                  type="number"
                  min={10}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Marks</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalMarks}
                  onChange={(e) => setForm((p) => ({ ...p, totalMarks: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Questions</label>
                <input
                  type="number"
                  min={1}
                  value={form.questionCount}
                  onChange={(e) => setForm((p) => ({ ...p, questionCount: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Type</label>
                <input
                  type="text"
                  value={form.questionType}
                  onChange={(e) => setForm((p) => ({ ...p, questionType: e.target.value }))}
                  placeholder="All / MCQ / Essay"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                  className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Instructions</label>
              <textarea
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-lg bg-[#80229a] hover:bg-[#6a1b82] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate Question Paper'}
            </button>
          </form>
        </div>

        {/* Generated Papers Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-800">Generated Question Papers</h2>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search papers..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80229a]/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fef2f2] text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-3 py-2.5 border-b border-rose-100">#</th>
                  <th className="px-3 py-2.5 border-b border-rose-100">Title</th>
                  <th className="px-3 py-2.5 border-b border-rose-100">Course / Sem</th>
                  <th className="px-3 py-2.5 border-b border-rose-100">Subject</th>
                  <th className="px-3 py-2.5 border-b border-rose-100">Marks / Time</th>
                  <th className="px-3 py-2.5 border-b border-rose-100">Questions</th>
                  <th className="px-3 py-2.5 border-b border-rose-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No generated question papers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr key={p._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{p.title || 'Untitled Paper'}</td>
                      <td className="px-3 py-2.5">
                        {p.course || '-'} <span className="text-slate-400">({p.semester || '-'})</span>
                      </td>
                      <td className="px-3 py-2.5">{p.subject || '-'}</td>
                      <td className="px-3 py-2.5">
                        {p.totalMarks ?? '-'} Marks · {p.durationMinutes ?? '-'}m
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#80229a] font-semibold">
                          {Array.isArray(p.questions) ? p.questions.length : p.questionCount ?? 0} Qs
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setPreviewPaper(p)}
                          className="px-2.5 py-1 rounded bg-purple-50 text-[#80229a] hover:bg-purple-100 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Printable Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <h3 className="text-sm font-bold text-slate-800">Question Paper Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#80229a] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Paper
                </button>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800">
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide">
                  {previewPaper.title || 'Examination Question Paper'}
                </h2>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  {previewPaper.course} — {previewPaper.semester}
                </p>
                <div className="flex flex-wrap justify-between text-xs font-semibold text-slate-700 mt-4 pt-3 border-t border-slate-200 gap-2">
                  <span>Subject: {previewPaper.subject || '-'}</span>
                  <span>Date: {previewPaper.examDate || '-'}</span>
                  <span>Duration: {previewPaper.durationMinutes ?? 180} Minutes</span>
                  <span>Max Marks: {previewPaper.totalMarks ?? 75}</span>
                </div>
              </div>

              {previewPaper.instructions && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                  <span className="font-bold">Instructions: </span>
                  {previewPaper.instructions}
                </div>
              )}

              <div className="space-y-4">
                {Array.isArray(previewPaper.questions) && previewPaper.questions.length > 0 ? (
                  previewPaper.questions.map((q: any, idx: number) => (
                    <div key={q._id || idx} className="pb-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-medium text-slate-800">
                          <span className="font-bold mr-2">Q{idx + 1}.</span>
                          {q.questionText || q.question || q.title || 'Question'}
                        </p>
                        <span className="text-xs font-bold text-slate-600 shrink-0">
                          [{q.marks ?? 1} Marks]
                        </span>
                      </div>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2 pl-6 text-xs text-slate-600">
                          {q.options.map((opt: string, oi: number) => (
                            <div key={oi}>
                              ({String.fromCharCode(97 + oi)}) {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No questions matched the selected criteria in the Question Bank.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Shared Field / Column Configs for Download Center Category Views
// ============================================================================
const DOWNLOAD_CATEGORIES = [
  'Assignments',
  'Study Material',
  'Syllabus',
  'Other Downloads',
  'Videos',
];

function buildDownloadFields(fixedCategory?: string): FieldDef[] {
  return [
    { name: 'title', label: 'Content Title', required: true },
    ...(fixedCategory
      ? [
          {
            name: 'category',
            label: 'Category',
            type: 'select' as const,
            options: [fixedCategory],
            defaultValue: fixedCategory,
            required: true,
          },
        ]
      : [
          {
            name: 'category',
            label: 'Category',
            type: 'select' as const,
            options: DOWNLOAD_CATEGORIES,
            required: true,
          },
        ]),
    courseField(true),
    semesterField(true),
    { name: 'subject', label: 'Subject', required: false },
    { name: 'uploadDate', label: 'Upload Date', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: false },
    { name: 'fileUrl', label: 'File / Video URL', type: 'url', placeholder: 'https://...', required: false },
    { name: 'uploadedBy', label: 'Uploaded By', required: false },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
  ];
}

const downloadColumns: ColumnDef[] = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'course', label: 'Course' },
  { key: 'semester', label: 'Semester' },
  { key: 'subject', label: 'Subject' },
  { key: 'uploadDate', label: 'Upload Date' },
  {
    key: 'fileUrl',
    label: 'Attachment',
    render: (row) =>
      row.fileUrl ? (
        <a
          href={row.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#80229a] hover:underline font-semibold"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        '-'
      ),
  },
];

// ============================================================================
// Lesson Planner Toggle Action Helper
// ============================================================================
const togglePlanStatusAction: RowAction = {
  label: 'Toggle Status',
  onClick: async (row, reload, notify) => {
    const nextStatus = row.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`${API_BASE}/lesson-planner/plans/${row._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      notify(`Marked as ${nextStatus}`);
      reload();
    } catch (e: any) {
      notify(e?.message || 'Status update failed', false);
    }
  },
};

// ============================================================================
// Main Renderer
// ============================================================================
export function Batch1ViewRenderer({ activeView }: { activeView: string }) {
  switch (activeView) {
    // ------------------------------------------------------------------------
    // 1. Online Class
    // ------------------------------------------------------------------------
    case 'online-class':
      return (
        <ErpCrudView
          key={activeView}
          title="Online Classes"
          breadcrumb="Online Class / Online Classes"
          endpoint="online-classes"
          layout="modal"
          filterFields={[courseField(false), semesterField(false), { name: 'teacher', label: 'Teacher' }]}
          fields={[
            { name: 'title', label: 'Class Title', required: true },
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'teacher', label: 'Teacher', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'timeFrom', label: 'Start Time', type: 'time', required: true },
            { name: 'durationMinutes', label: 'Duration (Minutes)', type: 'number', defaultValue: 60, required: true },
            {
              name: 'platform',
              label: 'Platform',
              type: 'select',
              options: ['Zoom', 'Google Meet', 'Jitsi', 'Teams'],
              defaultValue: 'Zoom',
              required: true,
            },
            { name: 'meetingUrl', label: 'Meeting URL', type: 'url', placeholder: 'https://...' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Scheduled', 'Live', 'Completed'],
              defaultValue: 'Scheduled',
            },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'teacher', label: 'Teacher' },
            { key: 'date', label: 'Date' },
            { key: 'timeFrom', label: 'Time' },
            { key: 'durationMinutes', label: 'Duration (m)' },
            { key: 'platform', label: 'Platform' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'online-class-timetable':
      return (
        <ErpCrudView
          key={activeView}
          title="Online Class Timetable"
          breadcrumb="Online Class / Online Class Timetable"
          endpoint="online-classes"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            { name: 'teacher', label: 'Teacher' },
            courseField(false),
            { name: 'date', label: 'Date', type: 'date' },
          ]}
          fields={[]}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'timeFrom', label: 'Start Time' },
            { key: 'durationMinutes', label: 'Duration (m)' },
            { key: 'title', label: 'Class Title' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'teacher', label: 'Teacher' },
            { key: 'platform', label: 'Platform' },
            {
              key: 'meetingUrl',
              label: 'Join Link',
              render: (row) =>
                row.meetingUrl ? (
                  <a
                    href={row.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#80229a] font-semibold hover:underline"
                  >
                    Join
                  </a>
                ) : (
                  '-'
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

    case 'online-class-attendees':
      return (
        <ErpCrudView
          key={activeView}
          title="Online Class Attendees"
          breadcrumb="Online Class / Attendees"
          endpoint="online-classes/attendees"
          layout="modal"
          filterFields={[courseField(false), semesterField(false), { name: 'date', label: 'Date', type: 'date' }]}
          fields={[
            { name: 'classTitle', label: 'Class Title', required: true },
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No', required: false },
            courseField(true),
            semesterField(true),
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'joinedAt', label: 'Joined At', type: 'time' },
            { name: 'durationMinutes', label: 'Attended (Minutes)', type: 'number' },
            {
              name: 'status',
              label: 'Attendance Status',
              type: 'select',
              options: ['Present', 'Absent', 'Late'],
              defaultValue: 'Present',
            },
          ]}
          columns={[
            { key: 'classTitle', label: 'Class Title' },
            { key: 'studentName', label: 'Student Name' },
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'date', label: 'Date' },
            { key: 'joinedAt', label: 'Joined At' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 2. Question Paper
    // ------------------------------------------------------------------------
    case 'qp-type':
      return (
        <ErpCrudView
          key={activeView}
          title="Question Types"
          breadcrumb="Question Paper / Question Type"
          endpoint="question-paper/types"
          layout="split"
          fields={[
            { name: 'name', label: 'Type Name', required: true, placeholder: 'e.g. Long Essay, Short Note, MCQ' },
            { name: 'marksPerQuestion', label: 'Marks Per Question', type: 'number', required: true, defaultValue: 1 },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Type Name' },
            { key: 'marksPerQuestion', label: 'Marks / Question' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'qp-question':
      return (
        <ErpCrudView
          key={activeView}
          title="Question Bank"
          breadcrumb="Question Paper / Question Bank"
          endpoint="question-paper/questions"
          layout="modal"
          filterFields={[
            courseField(false),
            semesterField(false),
            { name: 'subject', label: 'Subject' },
            { name: 'questionType', label: 'Question Type' },
          ]}
          fields={[
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'questionType', label: 'Question Type', required: true, placeholder: 'e.g. MCQ, Short Note, Essay' },
            { name: 'marks', label: 'Marks', type: 'number', defaultValue: 5, required: true },
            {
              name: 'difficulty',
              label: 'Difficulty',
              type: 'select',
              options: ['Easy', 'Medium', 'Hard'],
              defaultValue: 'Medium',
            },
            { name: 'questionText', label: 'Question Text', type: 'textarea', required: true },
            { name: 'answer', label: 'Model Answer / Key', type: 'textarea' },
          ]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'questionType', label: 'Type' },
            { key: 'marks', label: 'Marks' },
            { key: 'difficulty', label: 'Difficulty' },
            { key: 'questionText', label: 'Question' },
          ]}
        />
      );

    case 'qp-generate':
      return <QuestionPaperGeneratorView key={activeView} />;

    // ------------------------------------------------------------------------
    // 3. Other programs
    // ------------------------------------------------------------------------
    case 'op-parameter':
      return (
        <ErpCrudView
          key={activeView}
          title="Program Parameters"
          breadcrumb="Other Programs / Parameters"
          endpoint="other-programs/parameters"
          layout="split"
          fields={[
            { name: 'name', label: 'Parameter Name', required: true },
            { name: 'code', label: 'Parameter Code', required: true },
            { name: 'maxScore', label: 'Max Score', type: 'number', defaultValue: 100, required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'name', label: 'Parameter Name' },
            { key: 'code', label: 'Code' },
            { key: 'maxScore', label: 'Max Score' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'op-assessment':
      return (
        <ErpCrudView
          key={activeView}
          title="Program Assessments"
          breadcrumb="Other Programs / Assessments"
          endpoint="other-programs/assessments"
          layout="split"
          filterFields={[courseField(false), semesterField(false), { name: 'parameter', label: 'Parameter' }]}
          fields={[
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No' },
            courseField(true),
            semesterField(true),
            { name: 'parameter', label: 'Parameter', required: true },
            { name: 'score', label: 'Score Obtained', type: 'number', required: true },
            { name: 'maxScore', label: 'Max Score', type: 'number', defaultValue: 100 },
            { name: 'assessmentDate', label: 'Assessment Date', type: 'date' },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'studentName', label: 'Student' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'parameter', label: 'Parameter' },
            { key: 'score', label: 'Score' },
            { key: 'maxScore', label: 'Max Score' },
            { key: 'assessmentDate', label: 'Date', render: (r: any) => r.assessmentDate || r.date || '-' },
          ]}
        />
      );

    case 'op-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Other Programs Report"
          breadcrumb="Other Programs / Report"
          endpoint="other-programs/assessments"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[courseField(false), semesterField(false), { name: 'parameter', label: 'Parameter' }]}
          fields={[]}
          columns={[
            { key: 'studentName', label: 'Student Name' },
            { key: 'admissionNo', label: 'Admission No' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'parameter', label: 'Parameter' },
            { key: 'score', label: 'Score' },
            { key: 'maxScore', label: 'Max Score' },
            { key: 'assessmentDate', label: 'Date' },
            { key: 'remarks', label: 'Remarks' },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 4. Download Center
    // ------------------------------------------------------------------------
    case 'dc-upload':
      return (
        <ErpCrudView
          key={activeView}
          title="Upload Content"
          breadcrumb="Download Center / Upload Content"
          endpoint="download-center"
          layout="split"
          fields={buildDownloadFields()}
          columns={downloadColumns}
        />
      );

    case 'dc-assignments':
      return (
        <ErpCrudView
          key={activeView}
          title="Assignments Downloads"
          breadcrumb="Download Center / Assignments"
          endpoint="download-center"
          layout="modal"
          fixedFilters={{ category: 'Assignments' }}
          filterFields={[courseField(false), semesterField(false)]}
          fields={buildDownloadFields('Assignments')}
          columns={downloadColumns}
        />
      );

    case 'dc-study-material':
      return (
        <ErpCrudView
          key={activeView}
          title="Study Material"
          breadcrumb="Download Center / Study Material"
          endpoint="download-center"
          layout="modal"
          fixedFilters={{ category: 'Study Material' }}
          filterFields={[courseField(false), semesterField(false)]}
          fields={buildDownloadFields('Study Material')}
          columns={downloadColumns}
        />
      );

    case 'dc-syllabus':
      return (
        <ErpCrudView
          key={activeView}
          title="Syllabus"
          breadcrumb="Download Center / Syllabus"
          endpoint="download-center"
          layout="modal"
          fixedFilters={{ category: 'Syllabus' }}
          filterFields={[courseField(false), semesterField(false)]}
          fields={buildDownloadFields('Syllabus')}
          columns={downloadColumns}
        />
      );

    case 'dc-other':
      return (
        <ErpCrudView
          key={activeView}
          title="Other Downloads"
          breadcrumb="Download Center / Other Downloads"
          endpoint="download-center"
          layout="modal"
          fixedFilters={{ category: 'Other Downloads' }}
          filterFields={[courseField(false), semesterField(false)]}
          fields={buildDownloadFields('Other Downloads')}
          columns={downloadColumns}
        />
      );

    case 'dc-videos':
      return (
        <ErpCrudView
          key={activeView}
          title="Video Tutorials"
          breadcrumb="Download Center / Videos"
          endpoint="download-center"
          layout="modal"
          fixedFilters={{ category: 'Videos' }}
          filterFields={[courseField(false), semesterField(false)]}
          fields={buildDownloadFields('Videos')}
          columns={downloadColumns}
        />
      );

    // ------------------------------------------------------------------------
    // 5. Lesson Planner
    // ------------------------------------------------------------------------
    case 'lp-lesson':
      return (
        <ErpCrudView
          key={activeView}
          title="Lessons"
          breadcrumb="Lesson Planner / Lesson"
          endpoint="lesson-planner/lessons"
          layout="split"
          filterFields={[courseField(false), semesterField(false), { name: 'subject', label: 'Subject' }]}
          fields={[
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'title', label: 'Lesson Title', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'title', label: 'Lesson Title' },
            { key: 'description', label: 'Description' },
          ]}
        />
      );

    case 'lp-topic':
      return (
        <ErpCrudView
          key={activeView}
          title="Topics"
          breadcrumb="Lesson Planner / Topic"
          endpoint="lesson-planner/topics"
          layout="split"
          filterFields={[courseField(false), semesterField(false), { name: 'subject', label: 'Subject' }]}
          fields={[
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'lesson', label: 'Lesson Name', required: true },
            { name: 'title', label: 'Topic Title', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Completed'],
              defaultValue: 'Pending',
            },
            { name: 'completionDate', label: 'Completion Date', type: 'date' },
          ]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'title', label: 'Topic' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
            { key: 'completionDate', label: 'Completion Date' },
          ]}
        />
      );

    case 'lp-manage':
      return (
        <ErpCrudView
          key={activeView}
          title="Manage Lesson Plan"
          breadcrumb="Lesson Planner / Manage Lesson Plan"
          endpoint="lesson-planner/plans"
          layout="modal"
          filterFields={[
            courseField(false),
            semesterField(false),
            { name: 'subject', label: 'Subject' },
            { name: 'teacher', label: 'Teacher' },
          ]}
          rowActions={[togglePlanStatusAction]}
          fields={[
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'teacher', label: 'Teacher', required: true },
            { name: 'lesson', label: 'Lesson', required: true },
            { name: 'topic', label: 'Topic', required: true },
            { name: 'date', label: 'Planned Date', type: 'date', required: true },
            { name: 'timeFrom', label: 'Time From', type: 'time' },
            { name: 'timeTo', label: 'Time To', type: 'time' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Completed'],
              defaultValue: 'Pending',
            },
            { name: 'note', label: 'Teaching Note', type: 'textarea' },
          ]}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'teacher', label: 'Teacher' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'topic', label: 'Topic' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'lp-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Lesson Plan Report"
          breadcrumb="Lesson Planner / Lesson Plan Report"
          endpoint="lesson-planner/plans"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[courseField(false), semesterField(false), { name: 'teacher', label: 'Teacher' }]}
          fields={[]}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'teacher', label: 'Teacher' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'topic', label: 'Topic' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    case 'lp-topic-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Topic Report"
          breadcrumb="Lesson Planner / Topic Report"
          endpoint="lesson-planner/topics"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[courseField(false), semesterField(false), { name: 'subject', label: 'Subject' }]}
          fields={[]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'title', label: 'Topic' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
            { key: 'completionDate', label: 'Completion Date' },
          ]}
        />
      );

    case 'lp-topic-progress':
      return (
        <ErpCrudView
          key={activeView}
          title="Topic Progress Report"
          breadcrumb="Lesson Planner / Topic Progress"
          endpoint="lesson-planner/topics"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[
            courseField(false),
            semesterField(false),
            { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed'] },
          ]}
          fields={[]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'title', label: 'Topic' },
            {
              key: 'status',
              label: 'Progress',
              render: (row) => <StatusBadge value={row.status} />,
            },
            { key: 'completionDate', label: 'Completed On' },
          ]}
        />
      );

    case 'lp-lesson-progress':
      return (
        <ErpCrudView
          key={activeView}
          title="Lesson Progress Report"
          breadcrumb="Lesson Planner / Lesson Progress"
          endpoint="lesson-planner/plans"
          layout="report"
          hideCreate
          hideEdit
          hideDelete
          filterFields={[courseField(false), semesterField(false), { name: 'subject', label: 'Subject' }]}
          fields={[]}
          columns={[
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'lesson', label: 'Lesson' },
            { key: 'teacher', label: 'Teacher' },
            { key: 'date', label: 'Planned Date' },
            {
              key: 'status',
              label: 'Progress',
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
        />
      );

    // ------------------------------------------------------------------------
    // 6. Assignment
    // ------------------------------------------------------------------------
    case 'assign-add':
      return (
        <ErpCrudView
          key={activeView}
          title="Assignments"
          breadcrumb="Assignment / Add Assignment"
          endpoint="assignments"
          layout="modal"
          filterFields={[courseField(false), semesterField(false), { name: 'subject', label: 'Subject' }]}
          fields={[
            { name: 'title', label: 'Assignment Title', required: true },
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject', required: true },
            { name: 'assignDate', label: 'Assign Date', type: 'date', required: true },
            { name: 'submissionDate', label: 'Submission Date', type: 'date', required: true },
            { name: 'maxMarks', label: 'Max Marks', type: 'number', defaultValue: 20 },
            { name: 'attachmentUrl', label: 'Attachment URL', type: 'url', placeholder: 'https://...' },
            { name: 'description', label: 'Instructions / Description', type: 'textarea' },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'subject', label: 'Subject' },
            { key: 'assignDate', label: 'Assign Date' },
            { key: 'submissionDate', label: 'Due Date' },
            { key: 'maxMarks', label: 'Max Marks' },
          ]}
        />
      );

    case 'assign-eval':
      return (
        <ErpCrudView
          key={activeView}
          title="Evaluate Assignment"
          breadcrumb="Assignment / Evaluate Assignment"
          endpoint="assignments/evaluations"
          layout="split"
          filterFields={[
            courseField(false),
            semesterField(false),
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Submitted', 'Evaluated', 'Pending'],
            },
          ]}
          fields={[
            { name: 'assignmentTitle', label: 'Assignment Title', required: true },
            { name: 'studentName', label: 'Student Name', required: true },
            { name: 'admissionNo', label: 'Admission No' },
            courseField(true),
            semesterField(true),
            { name: 'subject', label: 'Subject' },
            { name: 'marksObtained', label: 'Marks Obtained', type: 'number' },
            {
              name: 'status',
              label: 'Evaluation Status',
              type: 'select',
              options: ['Submitted', 'Evaluated', 'Pending'],
              defaultValue: 'Evaluated',
            },
            { name: 'evaluationDate', label: 'Evaluation Date', type: 'date' },
            { name: 'remarks', label: 'Teacher Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'assignmentTitle', label: 'Assignment' },
            { key: 'studentName', label: 'Student' },
            { key: 'course', label: 'Course' },
            { key: 'semester', label: 'Semester' },
            { key: 'marksObtained', label: 'Marks' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge value={row.status} />,
            },
            { key: 'evaluationDate', label: 'Evaluated On' },
          ]}
        />
      );

    default:
      return null;
  }
}
