import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Template definitions
export const TEMPLATES = [
  { id: 'clean', name: 'Clean', category: 'minimal', description: 'Pure white, minimal, thin lines' },
  { id: 'classic', name: 'Classic', category: 'classic', description: 'Traditional, serif headings, formal' },
  { id: 'modern', name: 'Modern', category: 'modern', description: 'Bold header bar, sans-serif' },
  { id: 'slate', name: 'Slate', category: 'modern', description: 'Dark header, white content area' },
  { id: 'soft', name: 'Soft', category: 'minimal', description: 'Light grey background, rounded elements' },
  { id: 'bold', name: 'Bold', category: 'modern', description: 'Large typography, strong colour accent' },
  { id: 'compact', name: 'Compact', category: 'minimal', description: 'Dense, fits lots of line items cleanly' },
  { id: 'elegant', name: 'Elegant', category: 'classic', description: 'Thin fonts, lots of whitespace' },
  { id: 'stripe-style', name: 'Stripe-style', category: 'modern', description: "Inspired by Stripe's invoice design" },
  { id: 'simple', name: 'Simple', category: 'minimal', description: 'Plain, no-frills, maximum compatibility' },
  { id: 'creative', name: 'Creative', category: 'creative', description: 'Coloured sidebar, modern layout' },
  { id: 'studio', name: 'Studio', category: 'creative', description: 'Left-aligned, portfolio-style' },
  { id: 'consulting', name: 'Consulting', category: 'classic', description: 'Professional services layout' },
  { id: 'agency', name: 'Agency', category: 'modern', description: 'Two-column header, clean body' },
  { id: 'freelancer', name: 'Freelancer', category: 'creative', description: 'Warm tones, personal feel' },
  { id: 'retail', name: 'Retail', category: 'modern', description: 'Product-focused, good for line items' },
  { id: 'tech', name: 'Tech', category: 'creative', description: 'Dark accent, code-inspired feel' },
  { id: 'minimal-pro', name: 'Minimal Pro', category: 'minimal', description: 'Ultra-minimal, just the numbers' },
  { id: 'professional', name: 'Professional', category: 'classic', description: 'Standard corporate, universally accepted' },
]

const CATEGORY_COLORS: Record<string, string> = {
  minimal: 'bg-slate-100 text-slate-600',
  classic: 'bg-amber-50 text-amber-700',
  modern: 'bg-blue-50 text-blue-700',
  creative: 'bg-purple-50 text-purple-700',
}

// Simple placeholder thumbnail color per template
const TEMPLATE_COLORS: Record<string, string> = {
  clean: 'bg-white',
  classic: 'bg-amber-50',
  modern: 'bg-blue-600',
  slate: 'bg-slate-800',
  soft: 'bg-slate-100',
  bold: 'bg-blue-700',
  compact: 'bg-white',
  elegant: 'bg-slate-50',
  'stripe-style': 'bg-white',
  simple: 'bg-white',
  creative: 'bg-indigo-600',
  studio: 'bg-slate-900',
  consulting: 'bg-slate-700',
  agency: 'bg-sky-600',
  freelancer: 'bg-orange-50',
  retail: 'bg-emerald-600',
  tech: 'bg-zinc-900',
  'minimal-pro': 'bg-white',
  professional: 'bg-slate-600',
}

export default function TemplatePicker() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Choose a template</h1>
        <p className="text-slate-500 text-sm mt-0.5">Pick a design that suits your brand. You can change it any time.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {TEMPLATES.map((template) => (
          <Link
            key={template.id}
            href={`/invoices/new/${template.id}`}
            id={`template-${template.id}`}
            className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer"
          >
            {/* Thumbnail */}
            <div className={`${TEMPLATE_COLORS[template.id]} h-36 relative flex flex-col p-3 gap-1.5`}>
              {/* Simulated invoice lines */}
              <div className="w-12 h-1.5 bg-black/10 rounded-full" />
              <div className="w-20 h-1 bg-black/8 rounded-full" />
              <div className="mt-2 w-full h-px bg-black/10" />
              <div className="flex gap-1 mt-1">
                <div className="flex-1 h-1 bg-black/8 rounded-full" />
                <div className="w-8 h-1 bg-black/8 rounded-full" />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1 bg-black/6 rounded-full" />
                <div className="w-8 h-1 bg-black/6 rounded-full" />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1 bg-black/6 rounded-full" />
                <div className="w-8 h-1 bg-black/6 rounded-full" />
              </div>
              <div className="mt-auto flex justify-end">
                <div className="w-16 h-1.5 bg-blue-500/40 rounded-full" />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  Use this <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="p-3 bg-white border-t border-slate-100">
              <p className="text-sm font-medium text-slate-900">{template.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${CATEGORY_COLORS[template.category]}`}>
                {template.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
