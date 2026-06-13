'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, X, Loader2, AlertCircle,
  Briefcase, Users, Download, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  salary?: string
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED'
  _count?: { applications: number }
  createdAt: string
}

interface JobApplication {
  id: string
  jobId: string
  job?: { title: string }
  fullName: string
  email: string
  phone?: string
  resumeUrl?: string
  coverLetter?: string
  status: string
  notes?: string
  createdAt: string
}

const JOB_STATUS_MAP: Record<string, string> = {
  OPEN: 'badge-green',
  CLOSED: 'badge-red',
  ARCHIVED: 'badge-gray',
}

const APP_STATUS_MAP: Record<string, string> = {
  new: 'badge-orange',
  reviewing: 'badge-blue',
  shortlisted: 'badge-purple',
  rejected: 'badge-red',
  hired: 'badge-green',
}

const APP_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired']
const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract']

const emptyJob: Omit<JobPosting, 'id' | 'createdAt'> = {
  title: '', department: '', location: '', type: 'Full-time',
  description: '', requirements: [] as string[], salary: '', status: 'OPEN',
}

export default function CareersAdminPage() {
  const [tab, setTab] = useState<'jobs' | 'applications'>('jobs')
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [jobForm, setJobForm] = useState(emptyJob)
  const [newReq, setNewReq] = useState('')
  const [saving, setSaving] = useState(false)
  const [appStatusFilter, setAppStatusFilter] = useState('all')
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/admin/careers?type=jobs')
    const data = await res.json()
    setJobs(data.jobs || [])
  }, [])

  const fetchApplications = useCallback(async () => {
    const params = new URLSearchParams({ type: 'applications', ...(appStatusFilter !== 'all' && { status: appStatusFilter }) })
    const res = await fetch(`/api/admin/careers?${params}`)
    const data = await res.json()
    setApplications(data.applications || [])
  }, [appStatusFilter])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchJobs(), fetchApplications()])
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchJobs, fetchApplications])

  const openCreateJob = () => {
    setEditingJob(null)
    setJobForm(emptyJob)
    setShowJobForm(true)
  }

  const openEditJob = (job: JobPosting) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: [...job.requirements],
      salary: job.salary || '',
      status: job.status,
    })
    setShowJobForm(true)
  }

  const saveJob = async () => {
    if (!jobForm.title || !jobForm.department || !jobForm.location || !jobForm.description) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const method = editingJob ? 'PUT' : 'POST'
      const url = editingJob ? `/api/admin/careers?id=${editingJob.id}&type=job` : '/api/admin/careers'
      
      const payload = editingJob ? { id: editingJob.id, ...jobForm } : jobForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await fetchJobs()
      setShowJobForm(false)
      toast.success(editingJob ? 'Job updated' : 'Job created')
    } catch {
      toast.error('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job posting? All applications will also be deleted.')) return
    try {
      const res = await fetch(`/api/admin/careers?id=${id}&type=job`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setJobs((prev) => prev.filter((j) => j.id !== id))
      toast.success('Job posting deleted successfully.')
    } catch {
      toast.error('Failed to delete job posting. Please try again.')
    }
  }

  const deleteApp = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this application?')) return
    try {
      const res = await fetch(`/api/admin/careers?id=${id}&type=application`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setApplications((prev) => prev.filter((a) => a.id !== id))
      if (selectedApp?.id === id) setSelectedApp(null)
      toast.success('Application deleted successfully.')
    } catch {
      toast.error('Failed to delete application. Please try again.')
    }
  }

  const updateJobStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/careers?id=${id}&type=job`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: status as JobPosting['status'] } : j))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const updateAppStatus = async (id: string, status: string) => {
    setUpdatingAppId(id)
    try {
      const res = await fetch(`/api/admin/careers?id=${id}&type=application`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
      if (selectedApp?.id === id) setSelectedApp((prev) => prev ? { ...prev, status } : null)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingAppId(null)
    }
  }

  const addRequirement = () => {
    if (!newReq.trim()) return
    setJobForm((prev) => ({ ...prev, requirements: [...prev.requirements, newReq.trim()] }))
    setNewReq('')
  }

  const removeRequirement = (i: number) => {
    setJobForm((prev) => ({ ...prev, requirements: prev.requirements.filter((_, idx) => idx !== i) }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ color: '#EA580C', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>
            Careers Admin
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
            {jobs.length} job postings · {applications.length} applications
          </p>
        </div>
        {tab === 'jobs' && (
          <button onClick={openCreateJob} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
            <Plus size={16} /> Post New Job
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-card)', border: '1px solid #2A2A2A', borderRadius: 12, padding: 6, width: 'fit-content' }}>
        {(['jobs', 'applications'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: tab === t ? '#EA580C' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {t === 'jobs' ? <><Briefcase size={14} /> Job Postings</> : <><Users size={14} /> Applications</>}
          </button>
        ))}
      </div>

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.length === 0 ? (
            <div style={{
              background: 'var(--color-bg-card)', border: '1px solid #2A2A2A', borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 240, gap: 12,
            }}>
              <Briefcase size={32} style={{ color: '#4B5563' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>No job postings yet</p>
              <button onClick={openCreateJob} className="btn-primary" style={{ fontSize: 13 }}>
                <Plus size={14} /> Post First Job
              </button>
            </div>
          ) : jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--color-bg-card)', border: '1px solid #2A2A2A',
                borderRadius: 12, padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>
                      {job.title}
                    </h3>
                    <span className={`badge ${JOB_STATUS_MAP[job.status]}`}>{job.status}</span>
                    <span className="badge badge-gray">{job.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-secondary)', flexWrap: 'wrap', marginBottom: 8 }}>
                    <span>📁 {job.department}</span>
                    <span>📍 {job.location}</span>
                    {job.salary && <span>💰 {job.salary}</span>}
                    <span>👥 {job._count?.applications || 0} applications</span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {job.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <select
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value)}
                    style={{
                      background: 'var(--color-bg-primary)', border: '1px solid #2A2A2A',
                      color: '#D1D5DB', padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <button
                    onClick={() => openEditJob(job)}
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4', padding: '7px 10px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '7px 10px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Filter by status:</span>
            {['all', ...APP_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setAppStatusFilter(s)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: appStatusFilter === s ? '#EA580C' : 'var(--color-border)',
                  color: appStatusFilter === s ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Applications Table */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid #2A2A2A', borderRadius: 12, overflow: 'hidden' }}>
            {applications.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
                <AlertCircle size={28} style={{ color: '#4B5563' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No applications found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Position</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 500 }}>{app.fullName}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{app.job?.title || '—'}</td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{app.email}</td>
                        <td>
                          <select
                            value={app.status}
                            onChange={(e) => updateAppStatus(app.id, e.target.value)}
                            disabled={updatingAppId === app.id}
                            style={{
                              background: 'var(--color-bg-primary)', border: '1px solid #2A2A2A',
                              color: '#D1D5DB', padding: '4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                            }}
                          >
                            {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          {app.resumeUrl ? (
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#06B6D4', fontSize: 12, textDecoration: 'none' }}>
                              <Download size={13} /> Resume
                            </a>
                          ) : <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => setSelectedApp(app)}
                              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                              View
                            </button>
                            <button
                              onClick={() => deleteApp(app.id)}
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Form Modal */}
      <AnimatePresence>
        {showJobForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowJobForm(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                width: '100%', maxWidth: 640, maxHeight: '90vh',
                background: 'var(--color-bg-card)', border: '1px solid #2A2A2A',
                borderRadius: 20, zIndex: 101, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 18, margin: 0 }}>
                  {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
                </h3>
                <button onClick={() => setShowJobForm(false)} style={{ background: 'var(--color-border)', border: 'none', color: 'var(--color-text-secondary)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Job Title *', key: 'title', placeholder: 'e.g. Senior Marketing Manager' },
                    { label: 'Department *', key: 'department', placeholder: 'e.g. Marketing' },
                    { label: 'Location *', key: 'location', placeholder: 'e.g. Remote / Dubai, UAE' },
                    { label: 'Salary Range', key: 'salary', placeholder: 'e.g. AED 10,000 - 15,000' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(jobForm as any)[field.key] as string}
                        onChange={(e) => setJobForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="input-field"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Job Type
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="input-field" style={{ fontSize: 13 }}
                    >
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Status
                    </label>
                    <select
                      value={jobForm.status}
                      onChange={(e) => setJobForm((prev) => ({ ...prev, status: e.target.value as 'OPEN' | 'CLOSED' | 'ARCHIVED' }))}
                      className="input-field" style={{ fontSize: 13 }}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Description *
                  </label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className="input-field"
                    rows={5}
                    style={{ fontSize: 13, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Requirements
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={newReq}
                      onChange={(e) => setNewReq(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      placeholder="Add a requirement..."
                      className="input-field"
                      style={{ fontSize: 13, flex: 1 }}
                    />
                    <button onClick={addRequirement} className="btn-primary" style={{ padding: '10px 16px', fontSize: 13, flexShrink: 0 }}>
                      <Plus size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {jobForm.requirements.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-primary)', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 12px' }}>
                        <span style={{ flex: 1, fontSize: 13, color: '#D1D5DB' }}>{req}</span>
                        <button onClick={() => removeRequirement(i)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'flex', gap: 10 }}>
                <button onClick={saveJob} disabled={saving} className="btn-primary" style={{ fontSize: 13, padding: '11px 20px', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button onClick={() => setShowJobForm(false)} className="btn-secondary" style={{ fontSize: 13, padding: '11px 20px' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                width: '100%', maxWidth: 700, maxHeight: '90vh',
                background: 'var(--color-bg-card)', border: '1px solid #2A2A2A',
                borderRadius: 20, zIndex: 101, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 20, margin: 0 }}>
                    {selectedApp.fullName}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '6px 0 0' }}>Applied for: <span style={{ color: '#fff', fontWeight: 500 }}>{selectedApp.job?.title}</span></p>
                </div>
                <button onClick={() => setSelectedApp(null)} style={{ background: 'var(--color-border)', border: 'none', color: 'var(--color-text-secondary)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  {[
                    { label: 'Email', value: selectedApp.email },
                    { label: 'Phone', value: selectedApp.phone || '—' },
                    { label: 'Status', value: selectedApp.status },
                    { label: 'Applied', value: new Date(selectedApp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                  ].map((f) => (
                    <div key={f.label}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 14, color: '#D1D5DB' }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {selectedApp.coverLetter && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cover Letter</div>
                    <div style={{ background: 'var(--color-bg-primary)', border: '1px solid #2A2A2A', borderRadius: 10, padding: 14, fontSize: 13, color: '#D1D5DB', lineHeight: 1.6 }}>
                      {selectedApp.coverLetter}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Update Status</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {APP_STATUSES.map((s) => (
                      <button key={s}
                        onClick={() => updateAppStatus(selectedApp.id, s)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', border: 'none',
                          background: selectedApp.status === s ? '#EA580C' : 'var(--color-border)',
                          color: selectedApp.status === s ? '#fff' : 'var(--color-text-secondary)',
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {selectedApp.resumeUrl && (
                    <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ fontSize: 13, padding: '10px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Download size={14} /> Download Resume
                    </a>
                  )}
                  <a href={`mailto:${selectedApp.email}`}
                    className="btn-secondary"
                    style={{ fontSize: 13, padding: '10px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Send Email
                  </a>
                </div>
                <button
                  onClick={() => deleteApp(selectedApp.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Delete Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
