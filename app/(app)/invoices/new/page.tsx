import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TEMPLATES, CATEGORY_COLORS, type TemplateDefinition } from '@/lib/templates'

const CATEGORY_GROUPS = ['minimal', 'modern', 'classic', 'creative', 'dark', 'luxury'] as const

function TemplateThumbnail({ t }: { t: TemplateDefinition }) {
  const isDark = t.category === 'dark' || t.headerStyle === 'dark'
  const lineColor = isDark ? 'bg-white/20' : 'bg-black/10'
  const lineColorAlt = isDark ? 'bg-white/10' : 'bg-black/6'

  return (
    <div className={`h-36 relative flex overflow-hidden ${t.color}`}>
      {/* SIDEBAR layout */}
      {t.headerStyle === 'sidebar' && (
        <>
          <div className="w-10 h-full flex flex-col gap-1.5 p-1.5" style={{ background: t.accent }}>
            <div className="w-6 h-6 rounded-full bg-white/20 mt-1 mx-auto" />
            <div className="w-full h-0.5 bg-white/20 mt-2" />
            <div className="w-5 h-1 bg-white/20 rounded mx-auto" />
            <div className="w-4 h-1 bg-white/15 rounded mx-auto" />
            <div className="w-5 h-1 bg-white/15 rounded mx-auto" />
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1">
            <div className="w-16 h-1.5 bg-black/15 rounded-full" />
            <div className="w-10 h-1 bg-black/8 rounded-full" />
            <div className="mt-2 w-full h-px bg-black/10" />
            <div className="flex gap-1 mt-1"><div className="flex-1 h-1 bg-black/8 rounded-full" /><div className="w-6 h-1 bg-black/8 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/6 rounded-full" /><div className="w-6 h-1 bg-black/6 rounded-full" /></div>
            <div className="mt-auto flex justify-end"><div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '80' }} /></div>
          </div>
        </>
      )}

      {/* BAR layout */}
      {t.headerStyle === 'bar' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-12 flex items-center px-3 gap-2" style={{ background: t.accent }}>
            <div className="w-6 h-6 rounded bg-white/20" />
            <div className="flex-1 space-y-1">
              <div className="w-14 h-1.5 bg-white/60 rounded-full" />
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>
            <div className="text-right">
              <div className="w-12 h-1.5 bg-white/80 rounded-full" />
              <div className="w-8 h-1 bg-white/40 rounded-full mt-1 ml-auto" />
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/10 rounded-full" /><div className="w-8 h-1 bg-black/10 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/7 rounded-full" /><div className="w-8 h-1 bg-black/7 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/7 rounded-full" /><div className="w-8 h-1 bg-black/7 rounded-full" /></div>
            <div className="mt-auto flex justify-end"><div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
          </div>
        </div>
      )}

      {/* DARK layout */}
      {t.headerStyle === 'dark' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-14 flex items-center px-3 gap-2" style={{ background: isDark ? '#000000aa' : t.accent + 'dd' }}>
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-white/30" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="w-16 h-1.5 bg-white/70 rounded-full" />
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>
            <div className="text-right space-y-1">
              <div className="w-12 h-2 bg-white/80 rounded-full" />
              <div className="w-8 h-1 rounded-full ml-auto" style={{ backgroundColor: t.accent + 'aa' }} />
            </div>
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="flex gap-1"><div className="flex-1 h-1 bg-white/15 rounded-full" /><div className="w-8 h-1 bg-white/15 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-white/10 rounded-full" /><div className="w-8 h-1 bg-white/10 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-white/10 rounded-full" /><div className="w-8 h-1 bg-white/10 rounded-full" /></div>
            <div className="mt-auto flex justify-end pt-1"><div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} /></div>
          </div>
        </div>
      )}

      {/* CENTERED layout */}
      {t.headerStyle === 'centered' && (
        <div className="absolute inset-0 flex flex-col items-center p-3">
          <div className="w-10 h-10 rounded-lg border-2 flex items-center justify-center mb-1" style={{ borderColor: t.accent + '40' }}>
            <div className="w-5 h-5 rounded" style={{ backgroundColor: t.accent + '30' }} />
          </div>
          <div className="w-16 h-1.5 rounded-full mb-0.5" style={{ backgroundColor: t.accent + '60' }} />
          <div className="w-10 h-1 bg-black/10 rounded-full" />
          <div className="w-full h-px my-2" style={{ backgroundColor: t.accent + '30' }} />
          <div className="w-full space-y-1">
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/10 rounded-full" /><div className="w-6 h-1 bg-black/10 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/7 rounded-full" /><div className="w-6 h-1 bg-black/7 rounded-full" /></div>
          </div>
          <div className="mt-auto flex justify-end w-full"><div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '50' }} /></div>
        </div>
      )}

      {/* SPLIT layout */}
      {t.headerStyle === 'split' && (
        <div className="absolute inset-0 flex flex-col p-3 gap-1.5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
              <div className="w-8 h-1 bg-black/10 rounded-full" />
              <div className="w-10 h-1 bg-black/8 rounded-full" />
            </div>
            <div className="text-right space-y-1">
              <div className="w-14 h-2 bg-black/15 rounded-full" />
              <div className="w-10 h-1 rounded-full ml-auto" style={{ backgroundColor: t.accent + '60' }} />
            </div>
          </div>
          <div className="w-full h-px mt-1" style={{ backgroundColor: t.accent + '30' }} />
          <div className="space-y-1">
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/10 rounded-full" /><div className="w-6 h-1 bg-black/10 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-black/7 rounded-full" /><div className="w-6 h-1 bg-black/7 rounded-full" /></div>
          </div>
          <div className="mt-auto flex justify-end"><div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
        </div>
      )}

      {/* BORDERED layout (default) */}
      {t.headerStyle === 'bordered' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-1.5 w-full" style={{ backgroundColor: t.accent }} />
          <div className="flex-1 p-3 flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className={`w-12 h-1.5 ${lineColor} rounded-full`} />
                <div className={`w-8 h-1 ${lineColorAlt} rounded-full`} />
              </div>
              <div className="space-y-1 text-right">
                <div className={`w-14 h-2 ${lineColor} rounded-full`} />
                <div className="w-10 h-1 rounded-full ml-auto" style={{ backgroundColor: t.accent + '50' }} />
              </div>
            </div>
            <div className={`w-full h-px ${lineColorAlt} mt-1`} />
            <div className="flex gap-1"><div className={`flex-1 h-1 ${lineColorAlt} rounded-full`} /><div className={`w-6 h-1 ${lineColorAlt} rounded-full`} /></div>
            <div className="flex gap-1"><div className={`flex-1 h-1 ${lineColorAlt} rounded-full`} /><div className={`w-6 h-1 ${lineColorAlt} rounded-full`} /></div>
            <div className="mt-auto flex justify-end"><div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
          Use this <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

export default function TemplatePicker() {
  const grouped = CATEGORY_GROUPS.map((cat) => ({
    cat,
    templates: TEMPLATES.filter((t) => t.category === cat),
  })).filter((g) => g.templates.length > 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Choose a template</h1>
        <p className="text-slate-500 text-sm mt-1">25 designs across 6 styles. Pick one that fits your brand — you can change anytime.</p>
      </div>

      <div className="space-y-10">
        {grouped.map(({ cat, templates }) => (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${CATEGORY_COLORS[cat]}`}>{cat}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/invoices/new/${t.id}`}
                  id={`template-${t.id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200"
                >
                  <TemplateThumbnail t={t} />
                  <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
