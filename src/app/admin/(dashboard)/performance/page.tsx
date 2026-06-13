'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Edit2, Trash2, Image as ImageIcon, Video, Type, PlaySquare, Save, Star, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminPerformance() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    quote: '',
    type: 'text' as string, // text, image, video, youtube
    mediaUrl: '',
    photo: '',
    rating: 5,
    page: 'performance',
    isFeatured: false,
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchTestimonials = () => {
    setLoading(true)
    fetch('/api/admin/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.testimonials) setTestimonials(data.testimonials)
      })
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleEdit = (t: any) => {
    setEditingId(t.id)
    setFormData({
      name: t.name,
      role: t.role || '',
      company: t.company,
      quote: t.quote || '',
      type: t.type,
      mediaUrl: t.mediaUrl || '',
      photo: t.photo || '',
      rating: t.rating || 5,
      page: t.page || 'performance',
      isFeatured: t.isFeatured || false,
      isActive: t.isActive !== undefined ? t.isActive : true,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', role: '', company: '', quote: '', type: 'text', mediaUrl: '', photo: '', rating: 5, page: 'performance', isFeatured: false, isActive: true })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Testimonial deleted')
      fetchTestimonials()
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = '/api/admin/testimonials'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error()
      toast.success(`Testimonial ${editingId ? 'updated' : 'created'}`)
      handleCancel()
      fetchTestimonials()
    } catch {
      toast.error('Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
  }

  if (loading && testimonials.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Performance Manager</h1>
        <p className="text-gray-400">Manage 'What Our Clients Say' (Client Testimonials).</p>
      </div>

      {/* Editor Form */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
          {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Media Type</label>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'text' })} className={`py-2 px-3 rounded-lg border flex items-center gap-2 text-sm transition-colors ${formData.type === 'text' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:bg-[#2A2A2A]'}`}>
                  <Type className="w-4 h-4" /> Text Review
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'image' })} className={`py-2 px-3 rounded-lg border flex items-center gap-2 text-sm transition-colors ${formData.type === 'image' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:bg-[#2A2A2A]'}`}>
                  <ImageIcon className="w-4 h-4" /> Image Review
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'video' })} className={`py-2 px-3 rounded-lg border flex items-center gap-2 text-sm transition-colors ${formData.type === 'video' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:bg-[#2A2A2A]'}`}>
                  <Video className="w-4 h-4" /> Video Upload
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'youtube' })} className={`py-2 px-3 rounded-lg border flex items-center gap-2 text-sm transition-colors ${formData.type === 'youtube' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:bg-[#2A2A2A]'}`}>
                  <PlaySquare className="w-4 h-4" /> YouTube Video
                </button>
              </div>
            </div>

            <div className="md:col-span-3 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Client Name</label>
                  <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input type="text" required className="input-field" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Designation (Optional)</label>
                  <input type="text" className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="CEO" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <select className="input-field bg-black text-white" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}>
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    Client Photo Upload (URL)
                  </label>
                  <input type="text" className="input-field mb-2" value={formData.photo} onChange={e => setFormData({ ...formData, photo: e.target.value })} placeholder="Paste URL from Media Library" />
                  {formData.photo && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#2A2A2A] relative">
                      <Image src={formData.photo} alt="Client" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Visibility Settings</label>
                  <div className="space-y-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-[#2A2A2A] text-orange-500 focus:ring-orange-500 bg-black" />
                      <span className="text-sm text-white font-medium flex items-center gap-2"><Star className="w-4 h-4 text-orange-500" /> Mark as Featured</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-[#2A2A2A] text-orange-500 focus:ring-orange-500 bg-black" />
                      <span className="text-sm text-gray-300 font-medium">Published (Visible on site)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Review Text {(formData.type === 'video' || formData.type === 'youtube') && '(Optional)'}</label>
                <textarea required={formData.type === 'text' || formData.type === 'image'} rows={4} className="input-field resize-y" value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })} placeholder="What did they say about Promotency?" />
              </div>
              
              {formData.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-500" /> Review Image (URL)
                  </label>
                  <input type="text" required className="input-field" value={formData.mediaUrl} onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="Paste image URL from Media Library" />
                  {formData.mediaUrl && <div className="mt-2 w-32 h-32 relative rounded-lg border border-[#2A2A2A] overflow-hidden"><Image src={formData.mediaUrl} alt="Preview" fill className="object-cover" /></div>}
                </div>
              )}

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4 text-orange-500" /> Video Upload (MP4 URL)
                  </label>
                  <input type="text" required className="input-field" value={formData.mediaUrl} onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="Paste MP4 URL from Media Library" />
                  {formData.mediaUrl && (
                    <video src={formData.mediaUrl} controls className="mt-2 w-full max-w-sm rounded-lg border border-[#2A2A2A]" />
                  )}
                </div>
              )}

              {formData.type === 'youtube' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <PlaySquare className="w-4 h-4 text-orange-500" /> YouTube Video URL
                  </label>
                  <input type="text" required className="input-field" value={formData.mediaUrl} onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="https://youtube.com/watch?v=xxxx" />
                  {formData.mediaUrl && extractYoutubeId(formData.mediaUrl) && (
                    <div className="mt-2 bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded-lg flex gap-4 items-center max-w-sm">
                       <div className="w-24 h-16 relative rounded overflow-hidden">
                          <Image src={`https://img.youtube.com/vi/${extractYoutubeId(formData.mediaUrl)}/maxresdefault.jpg`} alt="Thumbnail" fill className="object-cover" />
                       </div>
                       <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Valid YouTube ID: {extractYoutubeId(formData.mediaUrl)}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#2A2A2A]">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)} 
              {editingId ? 'Save Changes' : 'Publish Testimonial'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>All Testimonials</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] border-b border-[#2A2A2A] text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Quote Snippet</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {testimonials.map(t => (
                <tr key={t.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {t.photo ? (
                        <div className="w-10 h-10 rounded-full relative overflow-hidden bg-[#2A2A2A]">
                          <Image src={t.photo} alt={t.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {t.name}
                          {t.isFeatured && <Star className="w-3 h-3 text-orange-500 fill-orange-500" />}
                        </div>
                        <div className="text-xs text-gray-500">{t.role && `${t.role} @ `}{t.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 max-w-xs truncate">
                    {t.quote ? `"${t.quote}"` : <span className="italic opacity-50">No text</span>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300">
                      {t.type === 'video' ? <Video className="w-3 h-3" /> : t.type === 'image' ? <ImageIcon className="w-3 h-3" /> : t.type === 'youtube' ? <PlaySquare className="w-3 h-3 text-red-500" /> : <Type className="w-3 h-3" />}
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {t.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(t)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors inline-flex">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors inline-flex">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No testimonials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
