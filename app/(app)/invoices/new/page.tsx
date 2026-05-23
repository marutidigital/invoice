import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TEMPLATES, CATEGORY_COLORS } from '@/lib/templates'

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
            <div className={`${template.color} h-36 relative flex flex-col p-3 gap-1.5`}>
              <div className="w-12 h-1.5 bg-black/10 rounded-full" />
              <div className="w-20 h-1 bg-black/10 rounded-full" />
              <div className="mt-2 w-full h-px bg-black/10" />
              <div className="flex gap-1 mt-1">
                <div className="flex-1 h-1 bg-black/10 rounded-full" />
                <div className="w-8 h-1 bg-black/10 rounded-full" />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1 bg-black/8 rounded-full" />
                <div className="w-8 h-1 bg-black/8 rounded-full" />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1 bg-black/8 rounded-full" />
                <div className="w-8 h-1 bg-black/8 rounded-full" />
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
