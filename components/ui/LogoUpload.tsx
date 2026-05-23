'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Link, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface LogoUploadProps {
  currentUrl?: string
  onUpload: (url: string) => void
  userId: string
}

export default function LogoUpload({ currentUrl, onUpload, userId }: LogoUploadProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState(currentUrl ?? '')

  // Upload file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)')
      return
    }
    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large — max 5MB')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    const publicUrl = data.publicUrl
    setPreview(publicUrl)
    onUpload(publicUrl)
    toast.success('Logo uploaded!')
    setUploading(false)
  }

  // Use a URL directly
  const handleUrlSave = () => {
    if (!urlInput.trim()) return
    setPreview(urlInput.trim())
    onUpload(urlInput.trim())
    setShowUrlInput(false)
    setUrlInput('')
    toast.success('Logo URL saved!')
  }

  const handleRemove = () => {
    setPreview('')
    onUpload('')
    toast.success('Logo removed')
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-500 mb-1">Business logo</label>

      {preview ? (
        /* Preview */
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-20 h-14 relative rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
            <Image
              src={preview}
              alt="Logo"
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Logo set ✓</p>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{preview}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-2 py-1 rounded-lg transition-colors"
            >
              Change
            </button>
            <button
              onClick={handleRemove}
              className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 px-2 py-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload area */
        <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors">
          {!showUrlInput ? (
            <div className="p-5 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Add your logo</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, SVG or WebP · max 5MB</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload file'}
                </button>
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="flex items-center gap-2 text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Link className="w-4 h-4" /> Paste URL
                </button>
              </div>
            </div>
          ) : (
            /* URL input */
            <div className="p-4 flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSave()}
                placeholder="https://example.com/logo.png"
                autoFocus
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleUrlSave} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Save
              </button>
              <button onClick={() => { setShowUrlInput(false); setUrlInput('') }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  )
}
