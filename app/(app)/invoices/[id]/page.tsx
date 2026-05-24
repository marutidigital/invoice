import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import InvoiceActions from '@/components/invoice/InvoiceActions'
import InvoiceViewRenderer from '@/components/invoice/InvoiceViewRenderer'

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

  // Look up template for correct accent color
  const templateDef = TEMPLATES.find((t) => t.id === invoice.template_id)
  const accent = templateDef?.accent ?? '#2563eb'

  const items = invoice.invoice_items ?? []

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency ?? 'USD' }).format(n)

  const invoiceData = {
    from: {
      name: invoice.from_name ?? '',
      email: invoice.from_email ?? '',
      phone: invoice.from_phone ?? '',
      address: invoice.from_address ?? '',
      logo_url: invoice.from_logo_url ?? '',
    },
    to: {
      name: invoice.to_name ?? '',
      company: invoice.to_company ?? '',
      email: invoice.to_email ?? '',
      phone: invoice.to_phone ?? '',
      address: invoice.to_address ?? '',
    },
    details: {
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date ?? '',
      currency: invoice.currency ?? 'USD',
      po_number: invoice.po_number ?? '',
    },
    items: items.map((item: { id: string; description: string; quantity: number; unit_price: number; tax_rate: number; total: number }) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      total: item.total,
    })),
    subtotal: invoice.subtotal ?? 0,
    taxTotal: invoice.tax_amount ?? 0,
    discountAmount: invoice.discount_amount ?? 0,
    grandTotal: invoice.total ?? 0,
    notes: invoice.notes ?? '',
    paymentInfo: invoice.payment_info ?? '',
    fmt,
    accent,
    templateId: invoice.template_id ?? 'clean',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print styles - hides UI chrome when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .invoice-paper { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="no-print sticky top-0 z-30 bg-white border-b border-slate-100 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="font-semibold text-slate-900 text-sm">{invoice.invoice_number}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/invoices/new/${invoice.template_id ?? 'clean'}?edit=${invoice.id}`}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <InvoiceActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
            invoiceNumber={invoice.invoice_number}
            templateId={invoice.template_id ?? 'clean'}
          />
        </div>
      </div>

      {/* Invoice paper */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="invoice-paper bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">
          <InvoiceViewRenderer invoiceData={invoiceData} />
        </div>

        {/* Action bar below invoice */}
        <div className="no-print mt-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to dashboard
          </Link>
          <div className="flex gap-3">
            <Link
              href="/invoices/new"
              className="text-sm border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              + New invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
