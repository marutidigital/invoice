'use client'

import { useState, useRef } from 'react'
import { X, ChevronDown, ChevronUp, Type, Palette, Image as ImageIcon, FileText, Layout, RefreshCw, Upload, Link } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export interface InvoiceCustomization {
  // Font
  fontFamily: string
  // Colors
  accentColor: string
  backgroundColor: string
  textColor: string
  headingColor: string
  tableHeaderBg: string
  tableStripeBg: string
  // Layout
  logoPosition: 'left' | 'center' | 'right'
  // Table
  tableStyle: 'clean' | 'striped' | 'bordered' | 'minimal'
  // Border
  showTopBorder: boolean
  borderWidth: number
  // Footer
  footerText: string
  footerImageUrl: string
  footerBg: string
  // Watermark
  watermark: '' | 'PAID' | 'DRAFT' | 'CONFIDENTIAL' | 'VOID'
  watermarkColor: string
  // Extras
  showSignatureLine: boolean
  pageSize: 'A4' | 'Letter'
}

export const DEFAULT_CUSTOMIZATION: InvoiceCustomization = {
  fontFamily: 'Inter',
  accentColor: '#2563eb',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  headingColor: '#0f172a',
  tableHeaderBg: '#f8fafc',
  tableStripeBg: '#f8fafc',
  logoPosition: 'left',
  tableStyle: 'clean',
  showTopBorder: true,
  borderWidth: 3,
  footerText: '',
  footerImageUrl: '',
  footerBg: '#f8fafc',
  watermark: '',
  watermarkColor: '#e2e8f0',
  showSignatureLine: false,
  pageSize: 'A4',
}

const FONTS = [
  { name: 'Inter', label: 'Inter', style: 'sans-serif', preview: 'Modern & Clean' },
  { name: 'Roboto', label: 'Roboto', style: 'sans-serif', preview: 'Clear & Friendly' },
  { name: 'Poppins', label: 'Poppins', style: 'sans-serif', preview: 'Rounded & Bold' },
  { name: 'Montserrat', label: 'Montserrat', style: 'sans-serif', preview: 'Strong & Contemporary' },
  { name: 'Lato', label: 'Lato', style: 'sans-serif', preview: 'Light & Professional' },
  { name: 'Raleway', label: 'Raleway', style: 'sans-serif', preview: 'Elegant & Stylish' },
  { name: 'Nunito', label: 'Nunito', style: 'sans-serif', preview: 'Friendly & Warm' },
  { name: 'Open Sans', label: 'Open Sans', style: 'sans-serif', preview: 'Neutral & Universal' },
  { name: 'Playfair Display', label: 'Playfair Display', style: 'serif', preview: 'Classic & Luxurious' },
  { name: 'Merriweather', label: 'Merriweather', style: 'serif', preview: 'Traditional & Formal' },
  { name: 'Georgia', label: 'Georgia', style: 'serif', preview: 'Timeless & Reliable' },
  { name: 'Courier New', label: 'Courier New', style: 'monospace', preview: 'Technical & Precise' },
]

const COLOR_PRESETS = [
  { name: 'Ocean Blue',  accent: '#2563eb', bg: '#ffffff', text: '#1e293b' },
  { name: 'Emerald',     accent: '#059669', bg: '#ffffff', text: '#1e293b' },
  { name: 'Violet',      accent: '#7c3aed', bg: '#ffffff', text: '#1e293b' },
  { name: 'Rose',        accent: '#e11d48', bg: '#ffffff', text: '#1e293b' },
  { name: 'Amber',       accent: '#d97706', bg: '#ffffff', text: '#1e293b' },
  { name: 'Slate',       accent: '#475569', bg: '#ffffff', text: '#1e293b' },
  { name: 'Indigo',      accent: '#4f46e5', bg: '#ffffff', text: '#1e293b' },
  { name: 'Teal',        accent: '#0d9488', bg: '#ffffff', text: '#1e293b' },
  { name: 'Dark Mode',   accent: '#6366f1', bg: '#0f172a', text: '#e2e8f0' },
  { name: 'Warm Paper',  accent: '#92400e', bg: '#fffbeb', text: '#1c1917' },
  { name: 'Midnight',    accent: '#818cf8', bg: '#1e1b4b', text: '#e0e7ff' },
  { name: 'Forest',      accent: '#166534', bg: '#f0fdf4', text: '#14532d' },
]

const TABLE_STYLES = [
  { id: 'clean', label: 'Clean', desc: 'Simple divider lines' },
  { id: 'striped', label: 'Striped', desc: 'Alternating row colors' },
  { id: 'bordered', label: 'Bordered', desc: 'Full grid borders' },
  { id: 'minimal', label: 'Minimal', desc: 'No lines at all' },
]

const WATERMARKS = [
  { id: '', label: 'None' },
  { id: 'PAID', label: '✓ PAID' },
  { id: 'DRAFT', label: '✎ DRAFT' },
  { id: 'CONFIDENTIAL', label: '🔒 CONFIDENTIAL' },
  { id: 'VOID', label: '✗ VOID' },
]

interface Section {
  id: string
  label: string
  icon: React.ReactNode
}

const SECTIONS: Section[] = [
  { id: 'font', label: 'Font & Typography', icon: <Type className="w-4 h-4" /> },
  { id: 'color', label: 'Colours', icon: <Palette className="w-4 h-4" /> },
  { id: 'layout', label: 'Layout & Logo', icon: <Layout className="w-4 h-4" /> },
  { id: 'table', label: 'Table Style', icon: <FileText className="w-4 h-4" /> },
  { id: 'footer', label: 'Footer', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'extras', label: 'Extras & Watermark', icon: <RefreshCw className="w-4 h-4" /> },
]

interface Props {
  open: boolean
  onClose: () => void
  value: InvoiceCustomization
  onChange: (v: InvoiceCustomization) => void
  userId: string
}

export default function InvoiceCustomizer({ open, onClose, value, onChange, userId }: Props) {
  const [openSection, setOpenSection] = useState<string>('font')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const set = (patch: Partial<InvoiceCustomization>) => onChange({ ...value, ...patch })

  // Load Google Font dynamically
  const loadFont = (fontName: string) => {
    if (['Georgia', 'Courier New'].includes(fontName)) return
    const id = `gf-${fontName.replace(/\s/g, '-')}`
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
      document.head.appendChild(link)
    }
  }

  const handleFontChange = (fontName: string) => {
    loadFont(fontName)
    set({ fontFamily: fontName })
  }

  // Footer image upload
  const handleFooterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/footer-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); setUploading(false); return }
    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    set({ footerImageUrl: data.publicUrl })
    toast.success('Footer image uploaded!')
    setUploading(false)
  }

  const handleReset = () => {
    onChange(DEFAULT_CUSTOMIZATION)
    toast.success('Reset to defaults')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="font-bold text-white text-base">Advanced Customization</h2>
            <p className="text-blue-200 text-xs mt-0.5">Full control over your invoice design</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="text-blue-200 hover:text-white text-xs border border-blue-400 px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
            <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.id} className="border-b border-slate-100">
              <button
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpenSection(openSection === section.id ? '' : section.id)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-600">{section.icon}</span>
                  <span className="font-semibold text-sm text-slate-800">{section.label}</span>
                </div>
                {openSection === section.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </button>

              {openSection === section.id && (
                <div className="px-5 pb-5 space-y-4">

                  {/* ── FONT SECTION ── */}
                  {section.id === 'font' && (
                    <>
                      <p className="text-xs text-slate-500">Changing the font affects your entire invoice.</p>
                      <div className="grid grid-cols-1 gap-2">
                        {FONTS.map((font) => (
                          <button
                            key={font.name}
                            onClick={() => handleFontChange(font.name)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                              value.fontFamily === font.name
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: `${font.name}, ${font.style}` }}>
                                {font.label}
                              </p>
                              <p className="text-xs text-slate-400">{font.preview}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase">{font.style}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── COLOR SECTION ── */}
                  {section.id === 'color' && (
                    <>
                      {/* Presets */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Quick presets</p>
                        <div className="grid grid-cols-3 gap-2">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => set({ accentColor: preset.accent, backgroundColor: preset.bg, textColor: preset.text })}
                              className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-200 hover:border-blue-300 transition-all group"
                            >
                              <div className="flex gap-1">
                                <div className="w-5 h-5 rounded-full border border-white/50 shadow-sm" style={{ background: preset.accent }} />
                                <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ background: preset.bg }} />
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Custom colours</p>
                        {[
                          { label: 'Accent / Brand colour', key: 'accentColor' as keyof InvoiceCustomization },
                          { label: 'Page background', key: 'backgroundColor' as keyof InvoiceCustomization },
                          { label: 'Body text colour', key: 'textColor' as keyof InvoiceCustomization },
                          { label: 'Heading colour', key: 'headingColor' as keyof InvoiceCustomization },
                          { label: 'Table header background', key: 'tableHeaderBg' as keyof InvoiceCustomization },
                        ].map(({ label, key }) => (
                          <div key={key} className="flex items-center justify-between gap-3">
                            <label className="text-sm text-slate-700 flex-1">{label}</label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-mono">{value[key] as string}</span>
                              <input
                                type="color"
                                value={value[key] as string}
                                onChange={(e) => set({ [key]: e.target.value })}
                                className="w-9 h-9 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5 bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── LAYOUT SECTION ── */}
                  {section.id === 'layout' && (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Logo position</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['left', 'center', 'right'] as const).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => set({ logoPosition: pos })}
                              className={`py-3 px-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                                value.logoPosition === pos
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {pos === 'left' ? '⬅ Left' : pos === 'center' ? '↔ Center' : 'Right ➡'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top border</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Show accent border at top</span>
                          <button
                            onClick={() => set({ showTopBorder: !value.showTopBorder })}
                            className={`relative w-11 h-6 rounded-full transition-colors ${value.showTopBorder ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value.showTopBorder ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>
                        {value.showTopBorder && (
                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm text-slate-600">Thickness</label>
                            <input
                              type="range"
                              min="1"
                              max="8"
                              value={value.borderWidth}
                              onChange={(e) => set({ borderWidth: parseInt(e.target.value) })}
                              className="flex-1 accent-blue-600"
                            />
                            <span className="text-xs text-slate-500 w-6">{value.borderWidth}px</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Page size</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(['A4', 'Letter'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => set({ pageSize: size })}
                              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                value.pageSize === size
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {size === 'A4' ? '📄 A4 (210×297mm)' : '📄 Letter (8.5×11")'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── TABLE SECTION ── */}
                  {section.id === 'table' && (
                    <div className="grid grid-cols-2 gap-2">
                      {TABLE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => set({ tableStyle: style.id as InvoiceCustomization['tableStyle'] })}
                          className={`flex flex-col gap-1 p-3 rounded-xl border transition-all text-left ${
                            value.tableStyle === style.id
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {/* Mini table preview */}
                          <div className="w-full space-y-0.5">
                            <div className={`h-2 w-full rounded-sm ${
                              style.id === 'bordered' ? 'border border-current' : ''
                            }`} style={{ backgroundColor: value.tableHeaderBg }} />
                            {[1,2,3].map((row) => (
                              <div
                                key={row}
                                className="h-1.5 w-full rounded-sm"
                                style={{
                                  backgroundColor: style.id === 'striped' && row % 2 === 0
                                    ? value.tableStripeBg
                                    : 'transparent',
                                  borderBottom: style.id === 'clean' || style.id === 'bordered' ? `1px solid #e2e8f0` : 'none',
                                  border: style.id === 'bordered' ? '1px solid #e2e8f0' : undefined,
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-1">{style.label}</p>
                          <p className="text-[10px] text-slate-400">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── FOOTER SECTION ── */}
                  {section.id === 'footer' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Footer text</label>
                        <textarea
                          value={value.footerText}
                          onChange={(e) => set({ footerText: e.target.value })}
                          placeholder="Thank you for your business! · Bank: HDFC · Acc: 1234567890"
                          rows={3}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Footer image</label>
                        {value.footerImageUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={value.footerImageUrl} alt="footer" className="h-10 max-w-[80px] object-contain rounded" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-700">Footer image set ✓</p>
                            </div>
                            <button onClick={() => set({ footerImageUrl: '' })} className="text-slate-400 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="flex-1 flex items-center justify-center gap-2 text-sm border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
                              >
                                <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload image'}
                              </button>
                              <button
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className="flex-1 flex items-center justify-center gap-2 text-sm border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <Link className="w-4 h-4" /> Paste URL
                              </button>
                            </div>
                            {showUrlInput && (
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={urlInput}
                                  onChange={(e) => setUrlInput(e.target.value)}
                                  placeholder="https://example.com/banner.png"
                                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => { set({ footerImageUrl: urlInput }); setShowUrlInput(false); setUrlInput('') }}
                                  className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFooterImageUpload} />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Footer background</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={value.footerBg}
                            onChange={(e) => set({ footerBg: e.target.value })}
                            className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
                          />
                          <span className="text-sm text-slate-600 font-mono">{value.footerBg}</span>
                          <div className="flex-1 h-6 rounded-lg border border-slate-200" style={{ backgroundColor: value.footerBg }} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── EXTRAS SECTION ── */}
                  {section.id === 'extras' && (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Watermark / Stamp</p>
                        <div className="grid grid-cols-1 gap-2">
                          {WATERMARKS.map((w) => (
                            <button
                              key={w.id}
                              onClick={() => set({ watermark: w.id as InvoiceCustomization['watermark'] })}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                value.watermark === w.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {w.label}
                              {value.watermark === w.id && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Active</span>}
                            </button>
                          ))}
                        </div>
                        {value.watermark && (
                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm text-slate-600">Watermark colour</label>
                            <input
                              type="color"
                              value={value.watermarkColor}
                              onChange={(e) => set({ watermarkColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Signature line</p>
                            <p className="text-xs text-slate-400">Add an &ldquo;Authorised Signature&rdquo; line at the bottom</p>
                          </div>
                          <button
                            onClick={() => set({ showSignatureLine: !value.showSignatureLine })}
                            className={`relative w-11 h-6 rounded-full transition-colors ${value.showSignatureLine ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value.showSignatureLine ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">Changes apply to live preview instantly</p>
          <button
            onClick={onClose}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </>
  )
}
