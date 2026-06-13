'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Copy, Trash2, Image as ImageIcon, Loader2, File, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface MediaFile {
  id: string
  url: string
  filename: string
  size: number
  format: string
  createdAt: string
}

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/media')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setFiles(data.files)
        }
      })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false))
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFiles[0])

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFiles(prev => [data.file, ...prev])
        toast.success('File uploaded successfully')
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setFiles(files.filter(f => f.id !== id))
      toast.success('File deleted')
    } catch (err) {
      toast.error('Failed to delete file')
    }
  }

  const copyUrl = (id: string, url: string) => {
    // We use relative URLs because Next.js <Image> component natively supports 
    // relative paths without needing domains whitelisted in next.config.ts
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('URL copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Media Library</h1>
          <p className="text-gray-400">Manage images, videos, and assets used across your website.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,application/pdf" 
          />
          <button 
            onClick={handleUploadClick} 
            disabled={uploading} 
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Asset</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : files.length === 0 ? (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No Media Found</h3>
          <p className="text-gray-400 mb-6">Upload your first image or video to get started.</p>
          <button onClick={handleUploadClick} className="btn-secondary">Upload File</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.id} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden group">
              <div className="aspect-square bg-[#1A1A1A] relative flex items-center justify-center p-4">
                {file.format.includes('image') ? (
                  <Image 
                    src={file.url} 
                    alt={file.filename} 
                    fill 
                    className="object-contain p-2"
                  />
                ) : (
                  <File className="w-12 h-12 text-gray-500" />
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => copyUrl(file.id, file.url)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === file.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white truncate mb-1" title={file.filename}>
                  {file.filename}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatBytes(file.size)}</span>
                  <span className="uppercase">{file.format.split('/')[1] || 'FILE'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
