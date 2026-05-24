'use client'

import { DEFAULT_CUSTOMIZATION } from '@/components/invoice/InvoiceCustomizer'
import { resolveLayout } from '@/lib/invoice-renderer'
import { TEMPLATES } from '@/lib/templates'

interface InvoiceViewRendererProps {
  invoiceData: {
    from: { name: string; email: string; phone: string; address: string; logo_url: string }
    to: { name: string; company: string; email: string; phone: string; address: string }
    details: { invoice_number: string; issue_date: string; due_date: string; currency: string; po_number: string }
    items: { id: string; description: string; quantity: number; unit_price: number; tax_rate: number; total: number }[]
    subtotal: number
    taxTotal: number
    discountAmount: number
    grandTotal: number
    notes: string
    paymentInfo: string
    fmt: (n: number) => string
    accent: string
    templateId: string
  }
}

export default function InvoiceViewRenderer({ invoiceData }: InvoiceViewRendererProps) {
  const templateDef = TEMPLATES.find((t) => t.id === invoiceData.templateId)
  const headerStyle = templateDef?.headerStyle ?? 'split'

  const Layout = resolveLayout(headerStyle)

  // Use default customization with the template's accent colour
  const customization = {
    ...DEFAULT_CUSTOMIZATION,
    accentColor: invoiceData.accent,
  }

  return (
    <Layout
      from={invoiceData.from}
      to={invoiceData.to}
      details={invoiceData.details}
      items={invoiceData.items}
      subtotal={invoiceData.subtotal}
      taxTotal={invoiceData.taxTotal}
      discountAmount={invoiceData.discountAmount}
      grandTotal={invoiceData.grandTotal}
      notes={invoiceData.notes}
      paymentInfo={invoiceData.paymentInfo}
      fmt={invoiceData.fmt}
      accent={invoiceData.accent}
      customization={customization}
    />
  )
}
