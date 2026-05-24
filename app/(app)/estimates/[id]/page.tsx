import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import EstimateActions from '@/components/estimate/EstimateActions'
import InvoiceViewRenderer from '@/components/invoice/InvoiceViewRenderer'

export default async function EstimateViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch estimate + line items
  const { data: estimate } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('type', 'estimate')
    .single()

  if (!estimate) notFound()

  // Look up template for correct accent color
  const templateDef = TEMPLATES.find((t) => t.id === estimate.template_id)
  const accent = templateDef?.accent ?? '#2563eb'

  const items = estimate.invoice_items ?? []

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: estimate.currency ?? 'USD' }).format(n)

  const estimateData = {
    from: {
      name: estimate.from_name ?? '',
      email: estimate.from_email ?? '',
      phone: estimate.from_phone ?? '',
      address: estimate.from_address ?? '',
      logo_url: estimate.from_logo_url ?? '',
    },
    to: {
      name: estimate.to_name ?? '',
      company: estimate.to_company ?? '',
      email: estimate.to_email ?? '',
      phone: estimate.to_phone ?? '',
      address: estimate.to_address ?? '',
    },
    details: {
      invoice_number: estimate.invoice_number,
      issue_date: estimate.issue_date,
      due_date: estimate.due_date ?? '',
      currency: estimate.currency ?? 'USD',
      po_number: estimate.po_number ?? '',
    },
    items: items.map((item: { id: string; description: string; quantity: number; unit_price: number; tax_rate: number; total: number }) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      total: item.total,
    })),
    subtotal: estimate.subtotal ?? 0,
    taxTotal: estimate.tax_amount ?? 0,
    discountAmount: estimate.discount_amount ?? 0,
    grandTotal: estimate.total ?? 0,
    notes: estimate.notes ?? '',
    paymentInfo: estimate.payment_info ?? '',
    fmt,
    accent,
    templateId: estimate.template_id ?? 'clean',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print styles */}
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
          <Link href="/estimates" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="font-semibold text-slate-900 text-sm">{estimate.invoice_number}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/estimates/new/${estimate.template_id ?? 'clean'}?edit=${estimate.id}`}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <EstimateActions
            estimateId={estimate.id}
            currentStatus={estimate.status}
            estimateNumber={estimate.invoice_number}
            businessId={estimate.business_id}
          />
        </div>
      </div>

      {/* Estimate paper */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="invoice-paper bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">
          <InvoiceViewRenderer invoiceData={estimateData} />
        </div>

        {/* Action bar below estimate */}
        <div className="no-print mt-6 flex items-center justify-between">
          <Link href="/estimates" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Back to estimates
          </Link>
          <div className="flex gap-3">
            <Link
              href="/estimates/new"
              className="text-sm border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              + New estimate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
