'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  BarChart3,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { KnowledgeBaseEntry, QueryLog, Escalation, UserRole } from '@/lib/types';

export default function AdminPage() {
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<'analytics' | 'kb' | 'logs' | 'escalations' | 'system'>('analytics');
  
  const [analytics, setAnalytics] = useState<any>({
    totalQuestions: 0,
    cacheHits: 0,
    cacheHitRate: 0,
    totalCostInr: 0,
    avgConfidence: 0,
    openEscalations: 0,
    kbCount: 25,
    modelBreakdown: { llama8b: 0, llama70b: 0, cache: 0 },
  });

  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const [kbSearch, setKbSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [logFilter, setLogFilter] = useState<'all' | 'cache' | 'escalated'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<KnowledgeBaseEntry> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('campussaarthi_role') as UserRole;
    if (savedRole) setRole(savedRole);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [logsRes, kbRes, escRes] = await Promise.all([
        fetch('/api/admin/logs'),
        fetch('/api/admin/knowledge'),
        fetch('/api/admin/escalations'),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setQueryLogs(data.logs || []);
        if (data.analytics) setAnalytics(data.analytics);
      }

      if (kbRes.ok) {
        const data = await kbRes.json();
        setKbEntries(data.entries || []);
      }

      if (escRes.ok) {
        const data = await escRes.json();
        setEscalations(data.escalations || []);
      }
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleSaveKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.category || !editingEntry?.question || !editingEntry?.answer) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEntry),
      });

      if (res.ok) {
        showFeedback(editingEntry.id ? 'Entry updated successfully.' : 'New entry created & embedded.');
        setIsModalOpen(false);
        setEditingEntry(null);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKb = async (id: string) => {
    if (!confirm('Remove this circular entry from the knowledge base?')) return;
    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('Entry removed.');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveEscalation = async (id: string, newStatus: 'resolved' | 'in_progress') => {
    try {
      const res = await fetch('/api/admin/escalations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          admin_notes: 'Resolved by Admin Officer.',
        }),
      });

      if (res.ok) {
        showFeedback(`Ticket marked as ${newStatus}.`);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', ...Array.from(new Set(kbEntries.map((k) => k.category)))];

  const filteredKb = kbEntries.filter((k) => {
    const matchesCat = selectedCategory === 'All' || k.category === selectedCategory;
    const matchesSearch =
      k.question.toLowerCase().includes(kbSearch.toLowerCase()) ||
      k.answer.toLowerCase().includes(kbSearch.toLowerCase()) ||
      k.source_document.toLowerCase().includes(kbSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredLogs = queryLogs.filter((l) => {
    if (logFilter === 'cache') return l.served_from_cache;
    if (logFilter === 'escalated') return l.was_escalated;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAF8] text-[#1A1A1A] py-8 px-4 sm:px-6 max-w-[1100px] mx-auto w-full">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-semibold">
            Admin cell
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A5A] mt-1">
            Query audit trail, vector knowledge base, and student escalations.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-[10px] border border-[#ECECEC] text-xs">
          {[
            { id: 'analytics', label: 'Overview' },
            { id: 'kb', label: `Knowledge (${kbEntries.length})` },
            { id: 'logs', label: `Queries (${queryLogs.length})` },
            { id: 'escalations', label: `Escalations (${analytics.openEscalations})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FAFAF8] text-[#1A1A1A] font-semibold'
                    : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success alert */}
      {actionSuccessMsg && (
        <div className="mb-4 p-3 bg-[#2E7D53]/10 border border-[#2E7D53]/25 rounded-[8px] text-xs font-medium text-[#2E7D53]">
          {actionSuccessMsg}
        </div>
      )}

      {/* 1. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 surface-card">
              <span className="text-xs text-[#5A5A5A] block mb-1">Total inquiries</span>
              <p className="text-2xl font-serif font-semibold text-[#1A1A1A]">{analytics.totalQuestions}</p>
            </div>
            <div className="bg-white p-4 surface-card">
              <span className="text-xs text-[#5A5A5A] block mb-1">Cache hit rate</span>
              <p className="text-2xl font-serif font-semibold text-[#2E7D53]">{analytics.cacheHitRate}%</p>
            </div>
            <div className="bg-white p-4 surface-card">
              <span className="text-xs text-[#5A5A5A] block mb-1">Avg confidence</span>
              <p className="text-2xl font-serif font-semibold text-[#1A1A1A]">{Math.round(analytics.avgConfidence * 100)}%</p>
            </div>
            <div className="bg-white p-4 surface-card">
              <span className="text-xs text-[#5A5A5A] block mb-1">Open escalations</span>
              <p className="text-2xl font-serif font-semibold text-[#C2410C]">{analytics.openEscalations}</p>
            </div>
          </div>

          <div className="bg-white p-5 surface-card space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Model and cache distribution</h3>
            <div className="space-y-2 text-xs text-[#5A5A5A]">
              <div className="flex justify-between py-1 border-b border-[#ECECEC]">
                <span>Semantic cache hit (₹0.00)</span>
                <span className="font-medium text-[#1A1A1A]">{analytics.cacheHits} calls</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ECECEC]">
                <span>Llama 3.1 8B instant (Routine routing)</span>
                <span className="font-medium text-[#1A1A1A]">{analytics.modelBreakdown?.llama8b || 0} calls</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Llama 3.3 70B versatile (Complex routing)</span>
                <span className="font-medium text-[#1A1A1A]">{analytics.modelBreakdown?.llama70b || 0} calls</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KNOWLEDGE BASE */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 surface-card">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter questions..."
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#FAFAF8] border border-[#ECECEC] rounded-[6px] outline-none text-[#1A1A1A] w-60"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-[#FAFAF8] border border-[#ECECEC] rounded-[6px] px-2.5 py-1.5 text-[#1A1A1A] outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingEntry({
                  category: 'Documents',
                  question: '',
                  answer: '',
                  source_document: 'Admissions Circular',
                  contact_if_unsure: 'Admissions Office',
                });
                setIsModalOpen(true);
              }}
              className="btn-primary text-xs py-1.5 px-3 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add entry</span>
            </button>
          </div>

          <div className="bg-white surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#ECECEC] text-[#5A5A5A] font-medium">
                  <tr>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Question</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC]">
                  {filteredKb.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-3.5 text-[#1A1A1A] font-medium whitespace-nowrap">
                        {entry.category}
                      </td>
                      <td className="p-3.5 text-[#1A1A1A] max-w-sm">
                        {entry.question}
                      </td>
                      <td className="p-3.5 text-[#5A5A5A] whitespace-nowrap">
                        {entry.source_document}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsModalOpen(true);
                          }}
                          className="text-[#5A5A5A] hover:text-[#1A1A1A]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteKb(entry.id)}
                          className="text-[#C2410C] hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUERIES AUDIT */}
      {activeTab === 'logs' && (
        <div className="bg-white surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#ECECEC] text-[#5A5A5A] font-medium">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Inquiry</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Model</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="p-3.5 text-[#5A5A5A] whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-[#1A1A1A] max-w-sm font-medium">
                      {log.question}
                    </td>
                    <td className="p-3.5 text-[#5A5A5A]">
                      {Math.round((log.confidence_score || 0) * 100)}%
                    </td>
                    <td className="p-3.5 text-[#5A5A5A] whitespace-nowrap">
                      {log.served_from_cache ? 'Cache' : log.model_used}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {log.was_escalated ? (
                        <span className="text-[#C2410C] font-medium">Escalated</span>
                      ) : (
                        <span className="text-[#2E7D53] font-medium">Answered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="space-y-3">
          {escalations.length === 0 ? (
            <div className="bg-white surface-card p-8 text-center text-[#5A5A5A] text-xs">
              All student inquiries resolved.
            </div>
          ) : (
            escalations.map((esc) => (
              <div key={esc.id} className="bg-white surface-card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ECECEC]">
                  <span className="font-mono text-[#5A5A5A]">{esc.id}</span>
                  <span className="text-[#C2410C] font-medium uppercase text-[10px]">{esc.status}</span>
                </div>
                <p className="text-xs font-semibold text-[#1A1A1A]">{esc.question}</p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-[#5A5A5A]">Dept: {esc.assigned_dept}</span>
                  {esc.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveEscalation(esc.id, 'resolved')}
                      className="text-xs font-medium text-[#2E7D53] hover:underline"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && editingEntry && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] max-w-lg w-full p-5 surface-card space-y-4">
            <h3 className="text-base font-semibold text-[#1A1A1A]">
              {editingEntry.id ? 'Edit knowledge entry' : 'New knowledge entry'}
            </h3>
            <form onSubmit={handleSaveKb} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A5A5A] mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editingEntry.category || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
                  className="w-full p-2 border border-[#ECECEC] rounded-[6px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#5A5A5A] mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={editingEntry.question || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, question: e.target.value })}
                  className="w-full p-2 border border-[#ECECEC] rounded-[6px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#5A5A5A] mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={editingEntry.answer || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, answer: e.target.value })}
                  className="w-full p-2 border border-[#ECECEC] rounded-[6px] outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary py-1.5 px-3 text-xs"
                >
                  {isSaving ? 'Saving...' : 'Save entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
