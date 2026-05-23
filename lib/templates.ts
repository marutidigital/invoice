// lib/templates.ts — 35 invoice template definitions

export interface TemplateDefinition {
  id: string
  name: string
  category: 'minimal' | 'classic' | 'modern' | 'creative' | 'dark' | 'luxury' | 'professional'
  description: string
  color: string        // thumbnail bg
  accent: string       // accent color used in preview/render
  headerStyle: 'bar' | 'split' | 'centered' | 'sidebar' | 'dark' | 'bordered' | 'legal' | 'medical' | 'construction'
  industry?: string    // optional tag e.g. "Law", "Healthcare"
}

export const TEMPLATES: TemplateDefinition[] = [
  // MINIMAL
  { id: 'clean',        name: 'Clean',        category: 'minimal',  description: 'Pure white, thin accent line',          color: 'bg-white',      accent: '#2563eb', headerStyle: 'bordered' },
  { id: 'simple',       name: 'Simple',       category: 'minimal',  description: 'Plain, no-frills, max compatibility',   color: 'bg-white',      accent: '#374151', headerStyle: 'bordered' },
  { id: 'soft',         name: 'Soft',         category: 'minimal',  description: 'Light grey bg, subtle rounded style',   color: 'bg-slate-100',  accent: '#475569', headerStyle: 'bordered' },
  { id: 'compact',      name: 'Compact',      category: 'minimal',  description: 'Dense layout, many line items',         color: 'bg-white',      accent: '#2563eb', headerStyle: 'split' },
  { id: 'elegant',      name: 'Elegant',      category: 'minimal',  description: 'Thin fonts, lots of whitespace',        color: 'bg-slate-50',   accent: '#64748b', headerStyle: 'centered' },
  { id: 'minimal-pro',  name: 'Minimal Pro',  category: 'minimal',  description: 'Ultra-minimal, just the numbers',       color: 'bg-white',      accent: '#1e293b', headerStyle: 'bordered' },

  // CLASSIC
  { id: 'classic',      name: 'Classic',      category: 'classic',  description: 'Traditional, serif feel, formal',      color: 'bg-amber-50',   accent: '#78350f', headerStyle: 'centered' },
  { id: 'consulting',   name: 'Consulting',   category: 'classic',  description: 'Professional services layout',         color: 'bg-slate-700',  accent: '#374151', headerStyle: 'dark' },
  { id: 'professional', name: 'Professional', category: 'classic',  description: 'Standard corporate, universally used', color: 'bg-slate-600',  accent: '#475569', headerStyle: 'split' },
  { id: 'executive',    name: 'Executive',    category: 'classic',  description: 'Premium dark border, gold accent',     color: 'bg-amber-950',  accent: '#b45309', headerStyle: 'dark' },
  { id: 'luxury',       name: 'Luxury',       category: 'luxury',   description: 'Gold on dark, ultra premium feel',     color: 'bg-zinc-900',   accent: '#d97706', headerStyle: 'dark' },

  // MODERN
  { id: 'modern',       name: 'Modern',       category: 'modern',   description: 'Bold full-width header bar',           color: 'bg-blue-600',   accent: '#2563eb', headerStyle: 'bar' },
  { id: 'slate',        name: 'Slate',        category: 'modern',   description: 'Dark header, clean white body',        color: 'bg-slate-800',  accent: '#1e293b', headerStyle: 'dark' },
  { id: 'bold',         name: 'Bold',         category: 'modern',   description: 'Large type, strong colour accent',     color: 'bg-blue-700',   accent: '#1d4ed8', headerStyle: 'bar' },
  { id: 'stripe-style', name: 'Stripe-style', category: 'modern',   description: "Inspired by Stripe's invoice design",  color: 'bg-white',      accent: '#635bff', headerStyle: 'split' },
  { id: 'agency',       name: 'Agency',       category: 'modern',   description: 'Two-column header, clean body',        color: 'bg-sky-600',    accent: '#0284c7', headerStyle: 'bar' },
  { id: 'retail',       name: 'Retail',       category: 'modern',   description: 'Product-focused, great for items',     color: 'bg-emerald-600',accent: '#059669', headerStyle: 'bar' },
  { id: 'gradient',     name: 'Gradient',     category: 'modern',   description: 'Soft gradient header, modern feel',    color: 'bg-gradient-to-r from-blue-500 to-purple-500', accent: '#6366f1', headerStyle: 'bar' },
  { id: 'ocean',        name: 'Ocean',        category: 'modern',   description: 'Teal & navy, fresh and professional',  color: 'bg-teal-600',   accent: '#0d9488', headerStyle: 'bar' },

  // CREATIVE
  { id: 'creative',     name: 'Creative',     category: 'creative', description: 'Coloured sidebar, two-column layout',  color: 'bg-indigo-600', accent: '#4f46e5', headerStyle: 'sidebar' },
  { id: 'studio',       name: 'Studio',       category: 'creative', description: 'Left-aligned, portfolio-style',        color: 'bg-slate-900',  accent: '#0f172a', headerStyle: 'dark' },
  { id: 'freelancer',   name: 'Freelancer',   category: 'creative', description: 'Warm tones, personal & friendly',     color: 'bg-orange-50',  accent: '#c2410c', headerStyle: 'split' },
  { id: 'tech',         name: 'Tech',         category: 'dark',     description: 'Dark mode, code-inspired design',     color: 'bg-zinc-900',   accent: '#6366f1', headerStyle: 'dark' },
  { id: 'neon',         name: 'Neon',         category: 'dark',     description: 'Dark bg with vivid neon accents',     color: 'bg-gray-950',   accent: '#22d3ee', headerStyle: 'dark' },
  { id: 'midnight',     name: 'Midnight',     category: 'dark',     description: 'Deep navy, silver highlights',        color: 'bg-slate-950',  accent: '#818cf8', headerStyle: 'dark' },

  // ── PROFESSIONAL / INDUSTRY ────────────────────────────────────────────────

  // Law Firm
  {
    id: 'law-firm',
    name: 'Law Firm',
    category: 'professional',
    description: 'Formal document style, navy & gold — solicitors, barristers, legal advisors',
    color: 'bg-slate-900',
    accent: '#b45309',
    headerStyle: 'legal',
    industry: 'Law & Legal',
  },

  // Medical / Clinic
  {
    id: 'medical',
    name: 'Medical',
    category: 'professional',
    description: 'Clinical, clean blue-white — doctors, clinics, hospitals, labs, dentists',
    color: 'bg-sky-50',
    accent: '#0369a1',
    headerStyle: 'medical',
    industry: 'Healthcare',
  },

  // Construction
  {
    id: 'construction',
    name: 'Construction',
    category: 'professional',
    description: 'Bold orange & black — builders, contractors, civil engineers, trades',
    color: 'bg-orange-500',
    accent: '#ea580c',
    headerStyle: 'construction',
    industry: 'Construction',
  },

  // Real Estate
  {
    id: 'real-estate',
    name: 'Real Estate',
    category: 'professional',
    description: 'Warm gold & cream — property agents, landlords, developers',
    color: 'bg-amber-800',
    accent: '#92400e',
    headerStyle: 'centered',
    industry: 'Real Estate',
  },

  // IT / SaaS
  {
    id: 'it-saas',
    name: 'IT / SaaS',
    category: 'professional',
    description: 'Electric indigo — software agencies, developers, MSPs, cloud services',
    color: 'bg-violet-600',
    accent: '#7c3aed',
    headerStyle: 'bar',
    industry: 'Technology',
  },

  // Accounting & Finance
  {
    id: 'accounting',
    name: 'Accounting',
    category: 'professional',
    description: 'Forest green, numbers-first layout — accountants, CPAs, bookkeepers',
    color: 'bg-emerald-800',
    accent: '#166534',
    headerStyle: 'split',
    industry: 'Finance',
  },

  // Photography
  {
    id: 'photography',
    name: 'Photography',
    category: 'professional',
    description: 'Dramatic black with amber — photographers, videographers, studios',
    color: 'bg-zinc-950',
    accent: '#f59e0b',
    headerStyle: 'dark',
    industry: 'Photography',
  },

  // Hospitality & Hotel
  {
    id: 'hospitality',
    name: 'Hospitality',
    category: 'professional',
    description: 'Warm burgundy & cream — hotels, restaurants, catering, events',
    color: 'bg-rose-900',
    accent: '#9f1239',
    headerStyle: 'centered',
    industry: 'Hospitality',
  },

  // Education / Coaching
  {
    id: 'education',
    name: 'Education',
    category: 'professional',
    description: 'Friendly teal & white — tutors, coaches, training institutes, schools',
    color: 'bg-cyan-600',
    accent: '#0891b2',
    headerStyle: 'bar',
    industry: 'Education',
  },

  // Manufacturing & Supply
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    category: 'professional',
    description: 'Industrial steel blue — factories, suppliers, logistics, wholesale',
    color: 'bg-blue-900',
    accent: '#1e40af',
    headerStyle: 'construction',
    industry: 'Manufacturing',
  },
]

export const CATEGORY_COLORS: Record<string, string> = {
  minimal:      'bg-slate-100 text-slate-600',
  classic:      'bg-amber-50 text-amber-700',
  modern:       'bg-blue-50 text-blue-700',
  creative:     'bg-purple-50 text-purple-700',
  dark:         'bg-zinc-800 text-zinc-300',
  luxury:       'bg-yellow-50 text-yellow-700',
  professional: 'bg-green-50 text-green-700',
}

export const INDUSTRY_ICONS: Record<string, string> = {
  'Law & Legal':    '⚖️',
  'Healthcare':     '🏥',
  'Construction':   '🏗️',
  'Real Estate':    '🏠',
  'Technology':     '💻',
  'Finance':        '📊',
  'Photography':    '📸',
  'Hospitality':    '🏨',
  'Education':      '🎓',
  'Manufacturing':  '🏭',
}
