'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Globe, Image as ImageIcon, Phone, Link as LinkIcon, Search, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<any>({
    siteName: 'Promotency',
    siteTagline: 'Results-Driven Digital Marketing Agency',
    siteDescription: 'Premium digital marketing...',
    email: '',
    phone: '',
    address: '',
    businessHours: '',
    ctaLabel: "Let's Talk",
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    whatsapp: '',
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    googleAnalyticsId: '',
    googleSearchConsole: '',
    logoLight: '',
    logoDark: '',
    favicon: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings((prev: any) => ({ ...prev, ...data.settings }))
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to change password')
      }
      toast.success('Password changed successfully')
      setPasswords({ old: '', new: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'logos', label: 'Brand & Logos', icon: ImageIcon },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'social', label: 'Social Links', icon: LinkIcon },
    { id: 'seo', label: 'SEO & Tracking', icon: Search },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Global Settings</h1>
          <p className="text-gray-400">Manage your website's global configuration, contact info, and branding.</p>
        </div>
        <button onClick={handleSave} disabled={saving || activeTab === 'security'} className={`btn-primary flex items-center gap-2 ${activeTab === 'security' ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
        </button>
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#2A2A2A] p-4 space-y-1 bg-[#1A1A1A]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>General Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                <input type="text" className="input-field" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <input type="text" className="input-field" value={settings.siteTagline} onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site Description</label>
                <textarea rows={3} className="input-field resize-none" value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Global CTA Button Label</label>
                <input type="text" className="input-field" value={settings.ctaLabel} onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Email</label>
                <input type="email" className="input-field" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input type="tel" className="input-field" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Physical Address</label>
                <input type="text" className="input-field" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Hours</label>
                <input type="text" className="input-field" value={settings.businessHours} placeholder="e.g., Mon-Fri 9am-6pm" onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Google Map Embed URL or Share Link</label>
                <input type="url" className="input-field" value={settings.mapEmbedUrl || ''} placeholder="https://maps.app.goo.gl/..." onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">You can paste a standard Google Maps share link or an embed URL. If using a standard link, we will auto-generate the map using your Physical Address above.</p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Social Media Links</h2>
              {['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'whatsapp'].map((platform) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{platform} URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder={`https://${platform}.com/...`}
                    value={settings[platform] || ''}
                    onChange={(e) => setSettings({ ...settings, [platform]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>SEO & Tracking Defaults</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Meta Title</label>
                <input type="text" className="input-field" value={settings.defaultMetaTitle || ''} onChange={(e) => setSettings({ ...settings, defaultMetaTitle: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Meta Description</label>
                <textarea rows={3} className="input-field resize-none" value={settings.defaultMetaDescription || ''} onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Google Analytics 4 ID (G-XXXXXXX)</label>
                <input type="text" className="input-field" value={settings.googleAnalyticsId || ''} onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'logos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Brand & Logos</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Light Mode Logo URL</label>
                <input type="text" className="input-field" placeholder="/images/logo-light.svg or https://..." value={settings.logoLight || ''} onChange={(e) => setSettings({ ...settings, logoLight: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dark Mode Logo URL</label>
                <input type="text" className="input-field" placeholder="/images/logo-dark.svg or https://..." value={settings.logoDark || ''} onChange={(e) => setSettings({ ...settings, logoDark: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
                <input type="text" className="input-field" placeholder="/favicon.ico or https://..." value={settings.favicon || ''} onChange={(e) => setSettings({ ...settings, favicon: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Account Security</h2>
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input type="password" required className="input-field" value={passwords.old} onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input type="password" required className="input-field" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input type="password" required className="input-field" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <button type="submit" disabled={changingPassword} className="btn-primary w-full justify-center mt-4">
                  {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
