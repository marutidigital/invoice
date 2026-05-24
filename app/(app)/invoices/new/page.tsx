import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TEMPLATES, CATEGORY_COLORS, INDUSTRY_ICONS, type TemplateDefinition } from '@/lib/templates'

const CATEGORY_GROUPS = ['professional', 'minimal', 'modern', 'classic', 'creative', 'dark', 'luxury'] as const

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

      {/* LEGAL layout */}
      {t.headerStyle === 'legal' && (
        <div className="absolute inset-0 flex flex-col">
          <div style={{ height: '4px', backgroundColor: '#0f2044' }} />
          <div style={{ height: '1px', backgroundColor: t.accent }} />
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="w-12 h-1.5 bg-slate-900/50 rounded-full" />
                <div className="w-8 h-0.5 bg-slate-400/30 rounded-full" />
                <div className="w-10 h-0.5 bg-slate-400/20 rounded-full" />
              </div>
              <div className="border-2 border-slate-900/30 px-2 py-1">
                <div className="w-8 h-1 bg-slate-900/30 rounded-full" />
                <div className="w-10 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: t.accent + '80' }} />
              </div>
            </div>
            <div className="mt-2 border-t border-slate-200" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <div className="w-8 h-0.5 bg-slate-400/30 rounded-full" />
                <div className="w-12 h-1 bg-slate-600/30 rounded-full" />
                <div className="w-10 h-0.5 bg-slate-400/20 rounded-full" />
              </div>
              <div className="bg-slate-50 rounded p-1 space-y-0.5">
                <div className="flex justify-between"><div className="w-6 h-0.5 bg-slate-300 rounded-full" /><div className="w-5 h-0.5 bg-slate-300 rounded-full" /></div>
                <div className="flex justify-between"><div className="w-6 h-0.5 bg-slate-300 rounded-full" /><div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
              </div>
            </div>
            <div className="mt-auto flex justify-end pt-2">
              <div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} />
            </div>
          </div>
          <div style={{ height: '3px', backgroundColor: '#0f2044' }} />
        </div>
      )}

      {/* MEDICAL layout */}
      {t.headerStyle === 'medical' && (
        <div className="absolute inset-0 flex flex-col bg-sky-50">
          <div className="p-3 bg-white" style={{ borderBottom: `2px solid ${t.accent}` }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: t.accent }}>✚</div>
                <div className="space-y-0.5">
                  <div className="w-12 h-1 rounded-full" style={{ backgroundColor: t.accent + '80' }} />
                  <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
                </div>
              </div>
              <div className="rounded-lg px-1.5 py-1" style={{ backgroundColor: t.accent }}>
                <div className="w-6 h-1 bg-white/60 rounded-full" />
                <div className="w-8 h-1.5 bg-white rounded-full mt-0.5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-2 flex-1">
            <div className="bg-white rounded-lg p-1.5 border border-sky-100 space-y-0.5">
              <div className="w-10 h-0.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} />
              <div className="w-12 h-1 bg-slate-600/30 rounded-full" />
              <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
            </div>
            <div className="bg-white rounded-lg p-1.5 border border-sky-100 space-y-0.5">
              <div className="flex justify-between"><div className="w-5 h-0.5 bg-slate-300 rounded-full" /><div className="w-5 h-0.5 bg-slate-300 rounded-full" /></div>
              <div className="flex justify-between"><div className="w-5 h-0.5 bg-slate-300 rounded-full" /><div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-1.5 border border-sky-100">
              <div className="space-y-0.5">
                <div className="flex gap-1"><div className="flex-1 h-0.5 bg-slate-200 rounded-full" /><div className="w-6 h-0.5 bg-slate-200 rounded-full" /></div>
                <div className="flex gap-1"><div className="flex-1 h-0.5 bg-slate-200 rounded-full" /><div className="w-6 h-0.5 bg-slate-200 rounded-full" /></div>
                <div className="flex justify-end mt-0.5"><div className="w-10 h-1 rounded-full" style={{ backgroundColor: t.accent + '60' }} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSTRUCTION layout */}
      {t.headerStyle === 'construction' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="h-12 flex items-center justify-between px-3" style={{ backgroundColor: '#111827' }}>
            <div className="space-y-1">
              <div className="w-12 h-1.5 bg-white/60 rounded-full" />
              <div className="w-8 h-0.5 bg-white/30 rounded-full" />
            </div>
            <div className="px-2 py-1" style={{ backgroundColor: t.accent, transform: 'skewX(-6deg)' }}>
              <div className="w-8 h-1 bg-white/80 rounded-full" />
              <div className="w-10 h-1.5 bg-white rounded-full mt-0.5" />
            </div>
          </div>
          <div className="px-3 py-1 grid grid-cols-4 gap-1" style={{ backgroundColor: t.accent }}>
            {[1,2,3,4].map(i => <div key={i} className="h-2"><div className="w-full h-0.5 bg-white/40 rounded-full mb-0.5" /><div className="w-3/4 h-1 bg-white/70 rounded-full" /></div>)}
          </div>
          <div className="flex-1 bg-white p-2 space-y-1">
            <div className="flex gap-1"><div className="flex-1 h-1 bg-slate-200 rounded-full" /><div className="w-8 h-1 bg-slate-200 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-slate-100 rounded-full" /><div className="w-8 h-1 bg-slate-100 rounded-full" /></div>
            <div className="flex gap-1"><div className="flex-1 h-1 bg-slate-100 rounded-full" /><div className="w-8 h-1 bg-slate-100 rounded-full" /></div>
            <div className="mt-1 border-t-2 pt-1 flex justify-end" style={{ borderColor: t.accent }}>
              <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: t.accent + '70' }} />
            </div>
          </div>
          <div className="h-4 px-3 flex justify-between items-center" style={{ backgroundColor: '#111827' }}>
            <div className="w-12 h-0.5 bg-white/20 rounded-full" />
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
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
        <p className="text-slate-500 text-sm mt-1">35 professionally designed templates across 7 styles. Pick one that fits your brand — you can change anytime.</p>
      </div>

      <div className="space-y-10">
        {grouped.map(({ cat, templates }) => (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${CATEGORY_COLORS[cat]}`}>
                {cat === 'professional' ? '🏢 Professional & Industry' : cat}
              </span>
              {cat === 'professional' && (
                <span className="text-xs text-slate-400">Designed for specific professions — Law, Healthcare, Construction & more</span>
              )}
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      {t.industry && (
                        <span className="text-[9px] font-bold text-slate-400">{INDUSTRY_ICONS[t.industry] ?? ''}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                    {t.industry && (
                      <p className="text-[10px] font-semibold mt-1" style={{ color: t.accent }}>{t.industry}</p>
                    )}
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
