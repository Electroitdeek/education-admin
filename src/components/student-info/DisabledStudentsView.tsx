'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserX,
  UserCheck,
  Search,
  RefreshCw,
  Copy,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentItem } from './StudentDetailsView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/student-info/students`;

interface Props {
  onNavigate?: (view: string) => void;
}

export default function DisabledStudentsView({ onNavigate }: Props) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDisabled = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ENDPOINT}?status=Disabled`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisabled();
  }, [fetchDisabled]);

  const handleRestore = async (id: string) => {
    if (!confirm('Are you sure you want to re-enable this student?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active', disableReason: '' }),
      });
      if (res.ok) fetchDisabled();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Disabled Students List</h1>
            <p className="text-xs text-slate-400">Inactive or suspended student enrolments</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('student-details')}
          className="text-xs text-[#80229a] font-semibold hover:underline"
        >
          Back to Active Students
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800">Disabled Roster ({filtered.length})</span>
          <input
            type="text"
            placeholder="Search admission no, student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs w-56"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fef2f2] text-[11px] font-bold text-slate-700 uppercase">
                <th className="py-3 px-4">ADMISSION NO</th>
                <th className="py-3 px-4">STUDENT NAME</th>
                <th className="py-3 px-4">COURSE & SEMESTER</th>
                <th className="py-3 px-4">DISABLE REASON</th>
                <th className="py-3 px-4">MOBILE</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading disabled student records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No disabled students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-[#80229a]">{s.admissionNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {s.firstName} {s.lastName || ''}
                    </td>
                    <td className="py-3 px-4">
                      {s.course} ({s.semester})
                    </td>
                    <td className="py-3 px-4 text-rose-600 font-medium">
                      {s.disableReason || 'Administrative suspension'}
                    </td>
                    <td className="py-3 px-4 font-mono">{s.mobileNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRestore(s._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
                        title="Re-enable Student"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Re-enable</span>
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
  );
}

