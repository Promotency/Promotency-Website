'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, ImageIcon, VideoIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminHomeHero() {
  const [heroContent, setHeroContent] = useState<any>({
    headline: '',
    subheadline: '',
    primaryCtaLabel: '',
    primaryCtaUrl: '',
    secondaryCtaLabel: '',
    secondaryCtaUrl: '',
    backgroundImage: '',
    backgroundVideo: '',
    backgroundType: 'image',
    youtubeUrl: '',
    enableAudio: false,
    autoPlay: true,
    loopVideo: true,
    overlayOpacity: 60,
    badgeText: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/home')
      .then(res => res.json())
      .then(data => {
        if (data.heroContent) {
          setHeroContent(data.heroContent)
        }
      })
      .catch(() => toast.error('Failed to load hero content'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContent)
      })
      if (!res.ok) throw new Error()
      toast.success('Hero content saved successfully')
    } catch (err) {
      toast.error('Failed to save hero content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Home Page Manager</h1>
          <p className="text-gray-400">Manage the hero section and main content for your homepage.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Hero Text Content</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Badge Text</label>
                <input type="text" className="input-field" value={heroContent.badgeText || ''} onChange={(e) => setHeroContent({ ...heroContent, badgeText: e.target.value })} placeholder="e.g. Award-Winning Digital Agency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                <textarea rows={2} className="input-field resize-none" value={heroContent.headline || ''} onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })} placeholder="Main headline text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subheadline</label>
                <textarea rows={3} className="input-field resize-none" value={heroContent.subheadline || ''} onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })} placeholder="Secondary descriptive text" />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Call to Action (CTA)</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary CTA Label</label>
                  <input type="text" className="input-field" value={heroContent.primaryCtaLabel || ''} onChange={(e) => setHeroContent({ ...heroContent, primaryCtaLabel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary CTA URL</label>
                  <input type="text" className="input-field" value={heroContent.primaryCtaUrl || ''} onChange={(e) => setHeroContent({ ...heroContent, primaryCtaUrl: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary CTA Label</label>
                  <input type="text" className="input-field" value={heroContent.secondaryCtaLabel || ''} onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaLabel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary CTA URL</label>
                  <input type="text" className="input-field" value={heroContent.secondaryCtaUrl || ''} onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaUrl: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Hero Media Background</h2>
            
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-medium text-gray-300">Background Type</label>
              <div className="grid grid-cols-3 gap-3">
                {['image', 'video', 'youtube'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setHeroContent({ ...heroContent, backgroundType: type })}
                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                      heroContent.backgroundType === type || (type === 'video' && heroContent.isVideoEnabled && heroContent.backgroundType !== 'youtube')
                        ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                        : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {heroContent.backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Background Image URL
                  </label>
                  <input type="text" className="input-field mb-4" placeholder="Enter media URL (e.g., from Media Library)" value={heroContent.backgroundImage || ''} onChange={(e) => setHeroContent({ ...heroContent, backgroundImage: e.target.value })} />
                  
                  {heroContent.backgroundImage && (
                    <div className="w-full aspect-video rounded-xl border border-[#2A2A2A] overflow-hidden relative mt-2 bg-[#0A0A0A]">
                      <Image src={heroContent.backgroundImage} alt="Hero Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              )}

              {heroContent.backgroundType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <VideoIcon className="w-4 h-4" /> Background Video URL (MP4)
                  </label>
                  <input type="text" className="input-field mb-4" placeholder="Enter video URL (e.g., from Media Library)" value={heroContent.backgroundVideo || ''} onChange={(e) => setHeroContent({ ...heroContent, backgroundVideo: e.target.value })} />
                  
                  {heroContent.backgroundVideo && (
                    <div className="w-full aspect-video rounded-xl border border-[#2A2A2A] overflow-hidden relative mt-2 bg-[#0A0A0A]">
                      <video src={heroContent.backgroundVideo} autoPlay muted loop className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {heroContent.backgroundType === 'youtube' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <VideoIcon className="w-4 h-4" /> YouTube Video URL
                  </label>
                  <input type="text" className="input-field mb-4" placeholder="https://www.youtube.com/watch?v=..." value={heroContent.youtubeUrl || ''} onChange={(e) => setHeroContent({ ...heroContent, youtubeUrl: e.target.value })} />
                  
                  {heroContent.youtubeUrl && (
                    <div className="w-full aspect-video rounded-xl border border-[#2A2A2A] overflow-hidden relative mt-2 bg-[#0A0A0A]">
                      {(() => {
                        const match = heroContent.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                        const videoId = match ? match[1] : heroContent.youtubeUrl.split('/').pop()?.split('?')[0] || '';
                        return (
                          <iframe 
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Common Media Controls */}
            <div className="mt-8 space-y-5 pt-6 border-t border-[#2A2A2A]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Playback Controls</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">Overlay Opacity</p>
                  <p className="text-xs text-gray-400">Controls the darkness of the black overlay over the media</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{heroContent.overlayOpacity || 60}%</span>
                  <input type="range" min="0" max="100" value={heroContent.overlayOpacity ?? 60} onChange={(e) => setHeroContent({ ...heroContent, overlayOpacity: parseInt(e.target.value) })} className="accent-orange-500" />
                </div>
              </div>

              {(heroContent.backgroundType === 'video' || heroContent.backgroundType === 'youtube') && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">Auto Play</p>
                      <p className="text-xs text-gray-400">Automatically play the video when page loads</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={heroContent.autoPlay ?? true} onChange={(e) => setHeroContent({ ...heroContent, autoPlay: e.target.checked })} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">Loop Video</p>
                      <p className="text-xs text-gray-400">Restart video automatically when it ends</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={heroContent.loopVideo ?? true} onChange={(e) => setHeroContent({ ...heroContent, loopVideo: e.target.checked })} />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </>
              )}

              {heroContent.backgroundType === 'youtube' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">Enable Audio</p>
                    <p className="text-xs text-gray-400">Play sound from the YouTube video (Browser may block if Auto Play is ON)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={heroContent.enableAudio ?? false} onChange={(e) => setHeroContent({ ...heroContent, enableAudio: e.target.checked })} />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
