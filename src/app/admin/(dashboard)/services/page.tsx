'use client'

import { useState, useEffect } from 'react'
import { Plus, GripVertical, Check, X, Loader2, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  title: string
  slug: string
  shortDesc: string
  description: string
  heroHeadline: string
  heroSubheadline: string | null
  order: number
  isActive: boolean
  inclusions: string[]
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/admin/services')
        const data = await res.json()
        if (data.services) {
          setServices(data.services)
        }
      } catch (err) {
        toast.error('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const moveUp = (index: number) => {
    if (index === 0) return
    const newServices = [...services]
    const temp = newServices[index]
    newServices[index] = newServices[index - 1]
    newServices[index - 1] = temp
    setServices(newServices.map((s, i) => ({ ...s, order: i })))
  }

  const moveDown = (index: number) => {
    if (index === services.length - 1) return
    const newServices = [...services]
    const temp = newServices[index]
    newServices[index] = newServices[index + 1]
    newServices[index + 1] = temp
    setServices(newServices.map((s, i) => ({ ...s, order: i })))
  }

  const toggleActive = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
  }

  const updateServiceField = (id: string, field: keyof Service, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Services saved successfully')
    } catch (err) {
      toast.error('Failed to save services')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Services Management</h1>
          <p className="text-gray-400">Reorder, enable, disable, and edit your service offerings.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={service.id} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center p-4 gap-4 bg-[#1A1A1A]">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(index)} disabled={index === 0} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveDown(index)} disabled={index === services.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
              </div>
              
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {service.title}
                  {!service.isActive && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>}
                </h3>
                <p className="text-sm text-gray-400">/{service.slug}</p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-400">Active</span>
                  <input type="checkbox" checked={service.isActive} onChange={() => toggleActive(service.id)} className="w-4 h-4 accent-orange-500" />
                </label>
                <button onClick={() => setExpandedId(expandedId === service.id ? null : service.id)} className="btn-secondary py-1.5 px-3 text-sm">
                  {expandedId === service.id ? 'Collapse' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Expanded Editor */}
            {expandedId === service.id && (
              <div className="p-6 space-y-6 border-t border-[#2A2A2A]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input type="text" className="input-field" value={service.title} onChange={(e) => updateServiceField(service.id, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                    <input type="text" className="input-field" value={service.slug} onChange={(e) => updateServiceField(service.id, 'slug', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Short Description (Cards)</label>
                    <input type="text" className="input-field" value={service.shortDesc} onChange={(e) => updateServiceField(service.id, 'shortDesc', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
                    <textarea rows={3} className="input-field resize-none" value={service.description} onChange={(e) => updateServiceField(service.id, 'description', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hero Headline</label>
                    <input type="text" className="input-field" value={service.heroHeadline} onChange={(e) => updateServiceField(service.id, 'heroHeadline', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hero Subheadline</label>
                    <input type="text" className="input-field" value={service.heroSubheadline || ''} onChange={(e) => updateServiceField(service.id, 'heroSubheadline', e.target.value)} />
                  </div>
                </div>

                {/* Inclusions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Inclusions</label>
                    <button onClick={() => updateServiceField(service.id, 'inclusions', [...service.inclusions, 'New Inclusion'])} className="text-xs text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                  <div className="space-y-2">
                    {service.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="input-field py-2 flex-1"
                          value={inc}
                          onChange={(e) => {
                            const newInc = [...service.inclusions]
                            newInc[i] = e.target.value
                            updateServiceField(service.id, 'inclusions', newInc)
                          }}
                        />
                        <button onClick={() => {
                          const newInc = service.inclusions.filter((_, idx) => idx !== i)
                          updateServiceField(service.id, 'inclusions', newInc)
                        }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
