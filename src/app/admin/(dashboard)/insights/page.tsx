'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Save, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminInsights() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    featuredImage: '',
    excerpt: '',
    isDraft: false,
    metaTitle: '',
    metaDesc: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/admin/insights')
      .then(res => res.json())
      .then(data => {
        if (data.posts) setPosts(data.posts)
      })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleEdit = (p: any) => {
    setEditingId(p.id)
    setFormData({
      title: p.title,
      body: p.body,
      featuredImage: p.featuredImage || '',
      excerpt: p.excerpt || '',
      isDraft: p.isDraft,
      metaTitle: p.metaTitle || '',
      metaDesc: p.metaDesc || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ title: '', body: '', featuredImage: '', excerpt: '', isDraft: false, metaTitle: '', metaDesc: '' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      const res = await fetch(`/api/admin/insights?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Post deleted')
      fetchPosts()
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleSave = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = '/api/admin/insights'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData, isDraft: asDraft } : { ...formData, isDraft: asDraft }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error()
      toast.success(asDraft ? 'Saved as Draft' : `Post ${editingId ? 'updated' : 'published'}`)
      handleCancel()
      fetchPosts()
    } catch {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading && posts.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Insights Manager</h1>
        <p className="text-gray-400">Manage your blog posts and knowledge center articles.</p>
      </div>

      {/* Editor Form */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
          {editingId ? 'Edit Blog Post' : 'Add New Blog Post'}
        </h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Blog Title</label>
                <input type="text" required className="input-field" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter blog title..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Blog Content</label>
                <textarea required rows={15} className="input-field resize-y font-mono text-sm" value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} placeholder="Write your blog post content here (Markdown or HTML supported)..." />
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Featured Image</h3>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Image URL
                </label>
                <input type="text" className="input-field text-sm mb-3" value={formData.featuredImage} onChange={e => setFormData({ ...formData, featuredImage: e.target.value })} placeholder="Paste URL from Media Library" />
                {formData.featuredImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#2A2A2A]">
                    <Image src={formData.featuredImage} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Optional Fields</h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Excerpt (Short Summary)</label>
                  <textarea rows={3} className="input-field text-sm resize-none" value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">SEO Title</label>
                  <input type="text" className="input-field text-sm" value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">SEO Description</label>
                  <textarea rows={2} className="input-field text-sm resize-none" value={formData.metaDesc} onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={(e) => handleSave(e, false)} disabled={saving} className="btn-primary flex items-center gap-2 px-8">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
              {editingId ? 'Update & Publish' : 'Publish Post'}
            </button>
            <button type="button" onClick={(e) => handleSave(e, true)} disabled={saving} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save as Draft
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors ml-4 text-sm font-medium">Cancel Edit</button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>All Posts</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] border-b border-[#2A2A2A] text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Post Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.featuredImage ? (
                        <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] relative overflow-hidden flex-shrink-0">
                          <Image src={p.featuredImage} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] flex flex-shrink-0 items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white line-clamp-1">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-1">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {p.isDraft ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        Published
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(p)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors inline-flex">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors inline-flex">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No blog posts found. Create your first post above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
