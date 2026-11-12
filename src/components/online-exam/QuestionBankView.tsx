'use client';

import { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Check,
  Layers,
  BookOpen,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Question {
  _id: string;
  subject: string;
  classCourse: string;
  question: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  correctAnswer: 'optA' | 'optB' | 'optC' | 'optD';
  level: string;
  marks: number;
  createdAt?: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface Props {
  onNavigate?: (view: string) => void;
}

export default function QuestionBankView({ onNavigate }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const [subjectFilter, setSubjectFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'Applied Anatomy & Physiology',
    classCourse: 'B.Sc. Nursing',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswer: 'optA',
    level: 'Medium',
    marks: 1,
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        fetch(`${API}/online-exam/questions`),
        fetch(`${API}/academics/subjects`),
      ]);
      if (qRes.ok) setQuestions(await qRes.json());
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubjects(sData);
        if (sData.length > 0 && !formData.subject) {
          setFormData((prev) => ({ ...prev, subject: sData[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.optA || !formData.optB || !formData.optC || !formData.optD) {
      setNotification({
        type: 'error',
        message: 'Please fill question text and all 4 choices (A, B, C, D).',
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/online-exam/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const created = await res.json();
        setQuestions((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({
          subject: subjects[0]?.name || 'Applied Anatomy & Physiology',
          classCourse: 'B.Sc. Nursing',
          question: '',
          optA: '',
          optB: '',
          optC: '',
          optD: '',
          correctAnswer: 'optA',
          level: 'Medium',
          marks: 1,
        });
        setNotification({ type: 'success', message: 'Question added to bank!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to add question.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`${API}/online-exam/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
        setNotification({ type: 'success', message: 'Question removed.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete question.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (subjectFilter !== 'All' && q.subject !== subjectFilter) return false;
    if (levelFilter !== 'All' && q.level !== levelFilter) return false;
    if (searchTerm && !q.question.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Easy':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Easy</span>;
      case 'Hard':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Hard</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Medium</span>;
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
            <HelpCircle className="w-7 h-7 text-[#80229a]" />
            Question Bank
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Online Examination / Repository • Multiple Choice Question Bank by Subject & Difficulty
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
          >
            <option value="All">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
          >
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full text-xs border border-slate-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading question bank...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            No questions found. Click "Add Question" to build your question bank.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-sm text-[#80229a] bg-purple-50 px-2 py-0.5 rounded">
                    Q{idx + 1}.
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{q.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {q.subject}
                      </span>
                      {getLevelBadge(q.level)}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {q.marks} Mark{q.marks === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(q._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                {[
                  { key: 'optA', label: 'A', text: q.optA },
                  { key: 'optB', label: 'B', text: q.optB },
                  { key: 'optC', label: 'C', text: q.optC },
                  { key: 'optD', label: 'D', text: q.optD },
                ].map((opt) => {
                  const isCorrect = q.correctAnswer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <Check className="w-3.5 h-3.5" /> Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#80229a] to-[#a832c0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">Add Question to Bank</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none bg-white font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter multiple choice question..."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#80229a] focus:outline-none resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Multiple Choice Options & Answer Key <span className="text-rose-500">*</span>
                </label>

                {[
                  { key: 'optA', label: 'Option A' },
                  { key: 'optB', label: 'Option B' },
                  { key: 'optC', label: 'Option C' },
                  { key: 'optD', label: 'Option D' },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === opt.key}
                        onChange={() => setFormData({ ...formData, correctAnswer: opt.key })}
                        className="text-[#80229a] focus:ring-[#80229a]"
                        title="Mark as correct answer"
                      />
                      <span className="text-xs font-bold text-slate-700 w-16">{opt.label}:</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={(formData as any)[opt.key]}
                      onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.value })}
                      placeholder={`Enter ${opt.label}...`}
                      className="flex-1 text-xs border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-[#80229a] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#80229a] hover:bg-[#6c1b82] text-white text-sm font-semibold rounded-md shadow-md transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

