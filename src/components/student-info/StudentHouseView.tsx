'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ENDPOINT = `${API}/student-info/houses`;

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentHouseView({ onNavigate }: Props) {
  const [houses, setHouses] = useState<{ _id: string; houseName: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [description, setDescription] = useState('');

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        setHouses(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseName: houseName.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create house');
      setHouseName('');
      setDescription('');
      fetchHouses();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this House?')) return;
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHouses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#80229a]">
            <Home className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Student House</h1>
        </div>

        <button
          onClick={() => onNavigate?.('student-details')}
          className="text-xs text-[#80229a] font-semibold hover:underline"
        >
          Back to Student Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
            Create House
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                House Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Florence Nightingale House"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#80229a] resize-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#80229a] hover:bg-[#6c1c82] text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">House List</h2>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fef2f2] text-[11px] font-bold text-slate-700 uppercase">
                <th className="py-3 px-4">HOUSE NAME</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {houses.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-800">{h.houseName}</td>
                  <td className="py-3 px-4 text-slate-500">{h.description || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

