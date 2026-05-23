// lib/templates.ts — all 19 invoice template definitions

export interface TemplateDefinition {
  id: string
  name: string
  category: 'minimal' | 'classic' | 'modern' | 'creative'
  description: string
  color: string
}

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'clean', name: 'Clean', category: 'minimal', description: 'Pure white, minimal, thin lines', color: 'bg-white' },
  { id: 'classic', name: 'Classic', category: 'classic', description: 'Traditional, serif headings, formal', color: 'bg-amber-50' },
  { id: 'modern', name: 'Modern', category: 'modern', description: 'Bold header bar, sans-serif', color: 'bg-blue-600' },
  { id: 'slate', name: 'Slate', category: 'modern', description: 'Dark header, white content area', color: 'bg-slate-800' },
  { id: 'soft', name: 'Soft', category: 'minimal', description: 'Light grey background, rounded elements', color: 'bg-slate-100' },
  { id: 'bold', name: 'Bold', category: 'modern', description: 'Large typography, strong colour accent', color: 'bg-blue-700' },
  { id: 'compact', name: 'Compact', category: 'minimal', description: 'Dense, fits lots of line items cleanly', color: 'bg-white' },
  { id: 'elegant', name: 'Elegant', category: 'classic', description: 'Thin fonts, lots of whitespace', color: 'bg-slate-50' },
  { id: 'stripe-style', name: 'Stripe-style', category: 'modern', description: "Inspired by Stripe's invoice design", color: 'bg-white' },
  { id: 'simple', name: 'Simple', category: 'minimal', description: 'Plain, no-frills, maximum compatibility', color: 'bg-white' },
  { id: 'creative', name: 'Creative', category: 'creative', description: 'Coloured sidebar, modern layout', color: 'bg-indigo-600' },
  { id: 'studio', name: 'Studio', category: 'creative', description: 'Left-aligned, portfolio-style', color: 'bg-slate-900' },
  { id: 'consulting', name: 'Consulting', category: 'classic', description: 'Professional services layout', color: 'bg-slate-700' },
  { id: 'agency', name: 'Agency', category: 'modern', description: 'Two-column header, clean body', color: 'bg-sky-600' },
  { id: 'freelancer', name: 'Freelancer', category: 'creative', description: 'Warm tones, personal feel', color: 'bg-orange-50' },
  { id: 'retail', name: 'Retail', category: 'modern', description: 'Product-focused, good for line items', color: 'bg-emerald-600' },
  { id: 'tech', name: 'Tech', category: 'creative', description: 'Dark accent, code-inspired feel', color: 'bg-zinc-900' },
  { id: 'minimal-pro', name: 'Minimal Pro', category: 'minimal', description: 'Ultra-minimal, just the numbers', color: 'bg-white' },
  { id: 'professional', name: 'Professional', category: 'classic', description: 'Standard corporate, universally accepted', color: 'bg-slate-600' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  minimal: 'bg-slate-100 text-slate-600',
  classic: 'bg-amber-50 text-amber-700',
  modern: 'bg-blue-50 text-blue-700',
  creative: 'bg-purple-50 text-purple-700',
}
