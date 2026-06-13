'use client'

import { useState, useEffect } from 'react'
import { Download, Search, Trash2, Edit, ChevronDown, Check, X, Filter, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Lead {
  id: string
  source: string
  fullName: string
  email: string
  company: string | null
  interestedService: string | null
  monthlyBudget: string | null
  status: string
  createdAt: string
  phone: string | null
  businessType: string | null
  projectDetails: string | null
  timeline: string | null
  message: string | null
}

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ARCHIVED']

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/leads?page=${page}&limit=20&search=${search}&source=${sourceFilter}&status=${statusFilter}`)
      const data = await res.json()
      if (data.leads) {
        setLeads(data.leads)
        setTotal(data.total)
      }
    } catch (err) {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [page, sourceFilter, statusFilter, search])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)))
        toast.success('Status updated')
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== id))
        toast.success('Lead deleted')
      }
    } catch (err) {
      toast.error('Failed to delete lead')
    }
  }

  const handleExport = () => {
    const exportData = leads.map((l) => ({
      Date: new Date(l.createdAt).toLocaleDateString(),
      Source: l.source,
      Name: l.fullName,
      Email: l.email,
      Phone: l.phone || '',
      Company: l.company || '',
      'Business Type': l.businessType || '',
      Service: l.interestedService || '',
      Budget: l.monthlyBudget || '',
      Timeline: l.timeline || '',
      Status: l.status,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    XLSX.writeFile(wb, `promotency-leads-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'NEW': return 'badge-orange'
      case 'CONTACTED': return 'badge-blue'
      case 'QUALIFIED': return 'badge-purple'
      case 'CONVERTED': return 'badge-green'
      default: return 'badge-gray'
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Leads Management</h1>
          <p className="text-gray-400">Manage and track your incoming inquiries. ({total} total)</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search name, email, company..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Sources</option>
            <option value="contact">Contact Form</option>
            <option value="lets-talk">Let's Talk Modal</option>
          </select>
          <select
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Contact Info</th>
                <th>Company / Service</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No leads found</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <td className="whitespace-nowrap text-gray-400">{formatDate(lead.createdAt)}</td>
                    <td>
                      <div className="font-medium text-white">{lead.fullName}</div>
                      <div className="text-sm text-gray-400">{lead.email}</div>
                    </td>
                    <td>
                      <div className="text-white">{lead.company || '-'}</div>
                      <div className="text-sm text-orange-500 truncate max-w-[200px]">{lead.interestedService || '-'}</div>
                    </td>
                    <td>
                      <span className={`badge ${lead.source === 'lets-talk' ? 'badge-cyan' : 'badge-gray'}`}>
                        {lead.source}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`text-xs font-bold rounded-full px-2 py-1 outline-none border border-transparent hover:border-gray-500 cursor-pointer ${
                          lead.status === 'NEW' ? 'bg-orange-500/20 text-orange-500' :
                          lead.status === 'CONTACTED' ? 'bg-blue-500/20 text-blue-500' :
                          lead.status === 'QUALIFIED' ? 'bg-purple-500/20 text-purple-500' :
                          lead.status === 'CONVERTED' ? 'bg-green-500/20 text-green-500' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1A1A1A] text-white">{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedLead(lead)} className="p-1.5 rounded-lg hover:bg-[#2A2A2A] text-gray-400 hover:text-white transition-colors" title="View Details">
                          <Search className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[#2A2A2A]">
          <div className="text-sm text-gray-400">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-[#2A2A2A] disabled:opacity-50 hover:bg-[#1A1A1A]"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 rounded border border-[#2A2A2A] disabled:opacity-50 hover:bg-[#1A1A1A]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-[#2A2A2A]">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p><p className="font-medium text-white">{selectedLead.fullName}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p><p className="font-medium text-white">{selectedLead.email}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p><p className="font-medium text-white">{selectedLead.phone || '-'}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Company</p><p className="font-medium text-white">{selectedLead.company || '-'}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source</p><p className="font-medium text-white">{selectedLead.source}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p><p className="font-medium text-white">{formatDate(selectedLead.createdAt)}</p></div>
              </div>

              {(selectedLead.businessType || selectedLead.monthlyBudget || selectedLead.interestedService) && (
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] space-y-4">
                  <h3 className="font-bold text-orange-500">Business Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-500 uppercase mb-1">Business Type</p><p className="text-sm text-white">{selectedLead.businessType || '-'}</p></div>
                    <div><p className="text-xs text-gray-500 uppercase mb-1">Monthly Budget</p><p className="text-sm text-white">{selectedLead.monthlyBudget || '-'}</p></div>
                    <div className="col-span-2"><p className="text-xs text-gray-500 uppercase mb-1">Interested Service</p><p className="text-sm text-white">{selectedLead.interestedService || '-'}</p></div>
                    <div className="col-span-2"><p className="text-xs text-gray-500 uppercase mb-1">Timeline</p><p className="text-sm text-white">{selectedLead.timeline || '-'}</p></div>
                  </div>
                </div>
              )}

              {(selectedLead.projectDetails || selectedLead.message) && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message / Project Details</p>
                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 text-sm whitespace-pre-wrap">
                    {selectedLead.projectDetails || selectedLead.message}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#2A2A2A] flex justify-end">
              <button onClick={() => setSelectedLead(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
