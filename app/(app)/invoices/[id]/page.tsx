import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Download } from 'lucide-react'

export default async function InvoiceViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch invoice + line items
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) notFound()

  const items = invoice.invoice_items ?? []

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency ?? 'USD' }).format(n)

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    overdue: 'bg-red-50 text-red-600',
  }

  const accentColors: Record<string, string> = {
    modern: '#2563eb', slate: '#1e293b', bold: '#1d4ed8', creative: '#4f46e5',
    studio: '#0f172a', consulting: '#374151', agency: '#0284c7', retail: '#059669',
    tech: '#18181b', professional: '#475569', clean: '#2563eb', classic: '#78350f',
    soft: '#475569', compact: '#2563eb', elegant: '#64748b', 'stripe-style': '#635bff',
    simple: '#374151', freelancer: '#c2410c', 'minimal-pro': '#1e293b',
  }
  const accent = accentColors[invoice.template_id ?? 'clean'] ?? '#2563eb'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="font-semibold text-slate-900 text-sm">{invoice.invoice_number}</span>
            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/invoices/new/${invoice.template_id ?? 'clean'}?edit=${invoice.id}`}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={undefined}
            className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice paper */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">

          {/* Header */}
          <div className="px-10 pt-10 pb-6" style={{ borderBottom: `4px solid ${accent}` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xl font-bold" style={{ color: accent }}>
                  {invoice.from_name || 'Your Business'}
                </p>
                {invoice.from_email && <p className="text-slate-500 mt-1 text-sm">{invoice.from_email}</p>}
                {invoice.from_phone && <p className="text-slate-500 text-sm">{invoice.from_phone}</p>}
                {invoice.from_address && <p className="text-slate-500 text-sm mt-1">{invoice.from_address}</p>}
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900 tracking-tight">INVOICE</p>
                <p className="text-lg font-bold mt-1" style={{ color: accent }}>{invoice.invoice_number}</p>
              </div>
            </div>
          </div>

          {/* Bill to + dates */}
          <div className="px-10 py-6 grid grid-cols-2 gap-8 bg-slate-50/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bill to</p>
              <p className="font-bold text-slate-900 text-base">{invoice.to_name || '—'}</p>
              {invoice.to_company && <p className="text-slate-600 text-sm">{invoice.to_company}</p>}
              {invoice.to_email && <p className="text-slate-500 text-sm mt-1">{invoice.to_email}</p>}
              {invoice.to_phone && <p className="text-slate-500 text-sm">{invoice.to_phone}</p>}
              {invoice.to_address && <p className="text-slate-500 text-sm mt-1">{invoice.to_address}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Invoice details</p>
              <div className="space-y-1 text-sm">
                <div className="flex gap-3">
                  <span className="text-slate-500 w-20 shrink-0">Issue date</span>
                  <span className="font-medium text-slate-900">{invoice.issue_date}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex gap-3">
                    <span className="text-slate-500 w-20 shrink-0">Due date</span>
                    <span className="font-medium text-slate-900">{invoice.due_date}</span>
                  </div>
                )}
                {invoice.po_number && (
                  <div className="flex gap-3">
                    <span className="text-slate-500 w-20 shrink-0">PO number</span>
                    <span className="font-medium text-slate-900">{invoice.po_number}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-slate-500 w-20 shrink-0">Currency</span>
                  <span className="font-medium text-slate-900">{invoice.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-10 py-6">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${accent}25` }}>
                  <th className="text-left pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Description</th>
                  <th className="text-right pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide w-16">Qty</th>
                  <th className="text-right pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide w-28">Unit price</th>
                  <th className="text-right pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: { id: string; description: string; quantity: number; unit_price: number; tax_rate: number }) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="py-3 text-slate-800">{item.description}</td>
                    <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">{fmt(item.unit_price)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{fmt(item.quantity * item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals block */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span><span>{fmt(invoice.subtotal)}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax</span><span>{fmt(invoice.tax_amount)}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Discount</span><span>- {fmt(invoice.discount_amount)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between text-lg font-bold text-slate-900 border-t-2 pt-3"
                  style={{ borderColor: `${accent}40` }}
                >
                  <span>Total</span>
                  <span style={{ color: accent }}>{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes + payment */}
          {(invoice.notes || invoice.payment_info) && (
            <div className="px-10 pb-10 grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
              {invoice.notes && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{invoice.notes}</p>
                </div>
              )}
              {invoice.payment_info && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment details</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{invoice.payment_info}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="px-10 py-4 text-center text-xs text-slate-400"
            style={{ borderTop: `3px solid ${accent}20` }}
          >
            Generated with ProInvoice · proinvoice.shop
          </div>
        </div>

        {/* Action bar below invoice */}
        <div className="mt-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to dashboard
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/invoices/new/clean`}
              className="text-sm border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              + New invoice
            </Link>
            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
