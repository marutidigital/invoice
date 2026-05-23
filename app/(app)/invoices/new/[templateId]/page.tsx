/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import { CURRENCIES } from '@/lib/currencies'
import { Plus, Trash2, Download, Save, ArrowLeft, Eye, EyeOff, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile, Client } from '@/types'
import LogoUpload from '@/components/ui/LogoUpload'
import InvoiceCustomizer, { type InvoiceCustomization, DEFAULT_CUSTOMIZATION } from '@/components/invoice/InvoiceCustomizer'

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

const blankItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: '',
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
  total: 0,
})

export default function InvoiceFormPage({ params }: { params: { templateId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const template = TEMPLATES.find((t) => t.id === params.templateId) ?? TEMPLATES[0]

  const [profile, setProfile] = useState<Profile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [customization, setCustomization] = useState<InvoiceCustomization>(DEFAULT_CUSTOMIZATION)

  const [from, setFrom] = useState({ name: '', email: '', phone: '', address: '', logo_url: '' })
  const [to, setTo] = useState({ client_id: '', name: '', company: '', email: '', phone: '', address: '' })
  const [details, setDetails] = useState({
    invoice_number: 'INV-001',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    po_number: '',
  })
  const [items, setItems] = useState<LineItem[]>([blankItem()])
  const [discount, setDiscount] = useState({ type: 'flat' as 'flat' | 'percent', value: 0 })
  const [notes, setNotes] = useState('')
  const [paymentInfo, setPaymentInfo] = useState('')

  // Load profile + clients on mount
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setFrom({
          name: p.business_name ?? '',
          email: p.email ?? '',
          phone: p.phone ?? '',
          address: [p.address, p.city, p.state, p.postcode, p.country].filter(Boolean).join(', '),
          logo_url: p.logo_url ?? '',
        })
        setDetails((d) => ({
          ...d,
          currency: p.currency ?? 'USD',
          invoice_number: `${p.invoice_prefix ?? 'INV'}-${String((p.invoice_counter ?? 0) + 1).padStart(3, '0')}`,
        }))
        setNotes(p.default_notes ?? '')
        setPaymentInfo(p.payment_info ?? '')
      }

      const { data: c } = await supabase.from('clients').select('*').eq('user_id', user.id).order('name')
      setClients(c ?? [])
    }
    load()
  }, [])

  // Client autofill
  const selectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) {
      setTo({ client_id: '', name: '', company: '', email: '', phone: '', address: '' })
      return
    }
    setTo({
      client_id: client.id,
      name: client.name,
      company: client.company ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
    })
  }

  // Update line item + recalculate
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        updated.total = updated.quantity * updated.unit_price * (1 + updated.tax_rate / 100)
        return updated
      })
    )
  }

  // Totals
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const taxTotal = items.reduce((s, i) => s + i.quantity * i.unit_price * (i.tax_rate / 100), 0)
  const discountAmount = discount.type === 'flat' ? discount.value : (subtotal * discount.value) / 100
  const grandTotal = subtotal + taxTotal - discountAmount

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: details.currency }).format(n)

  // Save to Supabase
  const save = useCallback(async (status: 'draft' | 'sent' = 'draft') => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return null }

    const payload = {
      user_id: user.id,
      client_id: to.client_id || null,
      invoice_number: details.invoice_number,
      status,
      issue_date: details.issue_date,
      due_date: details.due_date || null,
      currency: details.currency,
      po_number: details.po_number || null,
      from_name: from.name, from_email: from.email, from_phone: from.phone,
      from_address: from.address, from_logo_url: from.logo_url || null,
      to_name: to.name, to_email: to.email, to_phone: to.phone,
      to_company: to.company, to_address: to.address,
      subtotal, tax_amount: taxTotal, discount_amount: discountAmount, total: grandTotal,
      notes: notes || null, payment_info: paymentInfo || null,
      template_id: params.templateId,
    }

    let id = invoiceId
    if (id) {
      await supabase.from('invoices').update(payload).eq('id', id)
    } else {
      const { data } = await supabase.from('invoices').insert(payload).select('id').single()
      id = data?.id ?? null
      if (id) {
        setInvoiceId(id)
        // Increment invoice counter
        await supabase
          .from('profiles')
          .update({ invoice_counter: (profile?.invoice_counter ?? 0) + 1 })
          .eq('id', user.id)
      }
    }

    if (id) {
      await supabase.from('invoice_items').delete().eq('invoice_id', id)
      await supabase.from('invoice_items').insert(
        items.map((item, i) => ({
          invoice_id: id,
          sort_order: i,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          total: item.total,
        }))
      )
    }

    setSaving(false)
    return id
  }, [from, to, details, items, discount, notes, paymentInfo, subtotal, taxTotal, discountAmount, grandTotal, invoiceId, profile, params.templateId])

  const handleSaveDraft = async () => {
    const id = await save('draft')
    if (id) toast.success('Draft saved!')
  }

  const handleSaveAndView = async () => {
    const id = await save('draft')
    if (id) {
      toast.success('Invoice saved!')
      router.push(`/invoices/${id}`)
    }
  }

  const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const lc = 'block text-xs font-medium text-slate-500 mb-1'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-semibold text-slate-900 text-sm">New Invoice</span>
            <span className="text-slate-400 text-xs ml-2">· {template.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Preview
          </button>
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Settings2 className="w-4 h-4" /> Advanced
          </button>
          <button onClick={handleSaveDraft} disabled={saving} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button onClick={handleSaveAndView} disabled={saving} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50">
            <Download className="w-4 h-4" />
            Save &amp; view
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* FORM */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${showPreview ? 'hidden lg:block' : ''}`}>

          {/* FROM */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">From (your business)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lc}>Business name</label>
                <input className={ic} value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} placeholder="Acme Ltd." />
              </div>
              <div>
                <label className={lc}>Email</label>
                <input className={ic} type="email" value={from.email} onChange={(e) => setFrom({ ...from, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <label className={lc}>Phone</label>
                <input className={ic} value={from.phone} onChange={(e) => setFrom({ ...from, phone: e.target.value })} placeholder="+1 555 000 0000" />
              </div>
              <div className="col-span-2">
                <label className={lc}>Address</label>
                <input className={ic} value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} placeholder="123 Main St, City, Country" />
              </div>
              <div className="col-span-2">
                {userId && (
                  <LogoUpload
                    currentUrl={from.logo_url}
                    userId={userId}
                    onUpload={(url) => setFrom({ ...from, logo_url: url })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* BILL TO */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Bill to (client)</h2>
            {clients.length > 0 && (
              <div className="mb-3">
                <label className={lc}>Select saved client</label>
                <select className={ic} value={to.client_id} onChange={(e) => selectClient(e.target.value)}>
                  <option value="">— type manually or pick saved client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Name</label><input className={ic} value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} placeholder="John Smith" /></div>
              <div><label className={lc}>Company</label><input className={ic} value={to.company} onChange={(e) => setTo({ ...to, company: e.target.value })} placeholder="Acme Corp" /></div>
              <div><label className={lc}>Email</label><input className={ic} type="email" value={to.email} onChange={(e) => setTo({ ...to, email: e.target.value })} placeholder="client@example.com" /></div>
              <div><label className={lc}>Phone</label><input className={ic} value={to.phone} onChange={(e) => setTo({ ...to, phone: e.target.value })} placeholder="+1 555 000 0000" /></div>
              <div className="col-span-2"><label className={lc}>Address</label><input className={ic} value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} placeholder="456 Client Ave, City" /></div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Invoice details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Invoice number</label><input className={ic} value={details.invoice_number} onChange={(e) => setDetails({ ...details, invoice_number: e.target.value })} /></div>
              <div>
                <label className={lc}>Currency</label>
                <select className={ic} value={details.currency} onChange={(e) => setDetails({ ...details, currency: e.target.value })}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div><label className={lc}>Issue date</label><input className={ic} type="date" value={details.issue_date} onChange={(e) => setDetails({ ...details, issue_date: e.target.value })} /></div>
              <div><label className={lc}>Due date</label><input className={ic} type="date" value={details.due_date} onChange={(e) => setDetails({ ...details, due_date: e.target.value })} /></div>
              <div><label className={lc}>PO number (optional)</label><input className={ic} value={details.po_number} onChange={(e) => setDetails({ ...details, po_number: e.target.value })} placeholder="PO-12345" /></div>
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Line items</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <div className="col-span-5 text-xs font-medium text-slate-400">Description</div>
                <div className="col-span-2 text-xs font-medium text-slate-400">Qty</div>
                <div className="col-span-2 text-xs font-medium text-slate-400">Price</div>
                <div className="col-span-2 text-xs font-medium text-slate-400">Tax %</div>
                <div className="col-span-1" />
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input className={ic} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Description" />
                  </div>
                  <div className="col-span-2">
                    <input className={ic} type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <input className={ic} type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                  </div>
                  <div className="col-span-2">
                    <input className={ic} type="number" min="0" max="100" step="0.01" value={item.tax_rate} onChange={(e) => updateItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)} placeholder="0" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} disabled={items.length === 1} className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setItems((p) => [...p, blankItem()])} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                <Plus className="w-4 h-4" /> Add line item
              </button>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {taxTotal > 0 && <div className="flex justify-between text-sm text-slate-600"><span>Tax</span><span>{fmt(taxTotal)}</span></div>}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Discount</span>
                <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none" value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value as 'flat' | 'percent' })}>
                  <option value="flat">flat</option>
                  <option value="percent">%</option>
                </select>
                <input type="number" min="0" step="0.01" value={discount.value || ''} onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })} placeholder="0" className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span className="ml-auto text-sm text-slate-600">{discountAmount > 0 ? `- ${fmt(discountAmount)}` : '—'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                <span>Total</span>
                <span className="text-blue-600">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notes &amp; payment</h2>
            <div className="space-y-3">
              <div><label className={lc}>Notes</label><textarea className={ic + ' resize-none'} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thank you for your business." /></div>
              <div><label className={lc}>Payment instructions</label><textarea className={ic + ' resize-none'} rows={3} value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)} placeholder="Bank details, PayPal, etc." /></div>
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button onClick={handleSaveDraft} disabled={saving} className="flex items-center gap-2 text-sm border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> Save draft
            </button>
            <button onClick={handleSaveAndView} disabled={saving} className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 ml-auto">
              <Download className="w-4 h-4" /> Save &amp; view invoice
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className={`w-[460px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto ${showPreview ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live preview · {template.name}</p>
          </div>
          <div className="p-6">
            <InvoicePreview from={from} to={to} details={details} items={items} subtotal={subtotal} taxTotal={taxTotal} discountAmount={discountAmount} grandTotal={grandTotal} notes={notes} paymentInfo={paymentInfo} fmt={fmt} templateId={params.templateId} customization={customization} />
          </div>
        </div>
      </div>

      {/* Advanced Customizer Drawer */}
      <InvoiceCustomizer
        open={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        value={customization}
        onChange={setCustomization}
        userId={userId}
      />
    </div>
  )
}

// LIVE PREVIEW COMPONENT
type PreviewProps = {
  from: { name: string; email: string; phone: string; address: string; logo_url: string }
  to: { name: string; company: string; email: string; address: string }
  details: { invoice_number: string; issue_date: string; due_date: string; po_number: string }
  items: LineItem[]
  subtotal: number; taxTotal: number; discountAmount: number; grandTotal: number
  notes: string; paymentInfo: string
  fmt: (n: number) => string
  templateId: string
  customization: import('@/components/invoice/InvoiceCustomizer').InvoiceCustomization
}

function InvoicePreview({ from, to, details, items, subtotal, taxTotal, discountAmount, grandTotal, notes, paymentInfo, fmt, templateId, customization }: PreviewProps) {
  const accents: Record<string, string> = {
    modern: '#2563eb', slate: '#1e293b', bold: '#1d4ed8', creative: '#4f46e5',
    studio: '#0f172a', consulting: '#374151', agency: '#0284c7', retail: '#059669',
    tech: '#18181b', professional: '#475569', clean: '#2563eb', classic: '#78350f',
    soft: '#475569', compact: '#2563eb', elegant: '#64748b', 'stripe-style': '#635bff',
    simple: '#374151', freelancer: '#c2410c', 'minimal-pro': '#1e293b',
  }
  // customization.accentColor overrides template default
  const accent = customization.accentColor !== '#2563eb'
    ? customization.accentColor
    : (accents[templateId] ?? '#2563eb')

  const font = `${customization.fontFamily}, sans-serif`
  const bg = customization.backgroundColor
  const textColor = customization.textColor

  const logoEl = from.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={from.logo_url} alt="Logo" className="h-10 max-w-[130px] object-contain" />
  ) : null

  return (
    <div
      className="rounded-lg shadow-md overflow-hidden text-xs relative"
      style={{ fontFamily: font, backgroundColor: bg, color: textColor }}
    >
      {/* Watermark */}
      {customization.watermark && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rotate-[-25deg] select-none"
        >
          <span
            className="text-4xl font-black tracking-widest opacity-20"
            style={{ color: customization.watermarkColor, fontSize: '3rem' }}
          >
            {customization.watermark}
          </span>
        </div>
      )}

      {/* Top border */}
      {customization.showTopBorder && (
        <div style={{ height: `${customization.borderWidth}px`, backgroundColor: accent }} />
      )}

      {/* Header */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${accent}20` }}>
        <div className={`flex items-start ${
          customization.logoPosition === 'center' ? 'flex-col items-center text-center gap-2' :
          customization.logoPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
        } justify-between`}>
          <div className={customization.logoPosition === 'center' ? 'flex flex-col items-center' : ''}>
            {logoEl}
            <p className="text-lg font-bold mt-1" style={{ color: accent }}>{from.name || 'Your Business'}</p>
            {from.email && <p className="text-slate-500 mt-0.5">{from.email}</p>}
            {from.phone && <p className="text-slate-500">{from.phone}</p>}
            {from.address && <p className="text-slate-500">{from.address}</p>}
          </div>
          <div className={customization.logoPosition === 'center' ? 'text-center' : 'text-right'}>
            <p className="text-2xl font-black" style={{ color: textColor }}>INVOICE</p>
            <p className="font-bold mt-0.5" style={{ color: accent }}>{details.invoice_number}</p>
          </div>
        </div>
      </div>

      {/* Bill to + dates */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4" style={{ backgroundColor: customization.tableHeaderBg }}>
        <div>
          <p className="font-bold uppercase tracking-wide text-[9px] mb-1" style={{ color: accent }}>Bill to</p>
          <p className="font-bold" style={{ color: customization.headingColor }}>{to.name || '—'}</p>
          {to.company && <p>{to.company}</p>}
          {to.email && <p className="opacity-70">{to.email}</p>}
          {to.address && <p className="opacity-70">{to.address}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold uppercase tracking-wide text-[9px] mb-1" style={{ color: accent }}>Details</p>
          <p>Issued: <span className="font-medium">{details.issue_date}</span></p>
          {details.due_date && <p>Due: <span className="font-medium">{details.due_date}</span></p>}
          {details.po_number && <p className="opacity-70">PO: {details.po_number}</p>}
        </div>
      </div>

      {/* Line items */}
      <div className="px-6 py-4">
        <table className="w-full">
          <thead>
            <tr style={{
              backgroundColor: customization.tableHeaderBg,
              borderBottom: customization.tableStyle !== 'minimal' ? `1px solid ${accent}30` : 'none'
            }}>
              <th className="text-left pb-2 font-bold text-[9px] uppercase tracking-wide opacity-60">Description</th>
              <th className="text-right pb-2 font-bold text-[9px] uppercase tracking-wide opacity-60">Qty</th>
              <th className="text-right pb-2 font-bold text-[9px] uppercase tracking-wide opacity-60">Price</th>
              <th className="text-right pb-2 font-bold text-[9px] uppercase tracking-wide opacity-60">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.filter((i) => i.description || i.unit_price > 0).map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: customization.tableStyle === 'striped' && idx % 2 === 1
                    ? customization.tableStripeBg : 'transparent',
                  borderBottom: customization.tableStyle === 'clean' || customization.tableStyle === 'bordered'
                    ? `1px solid ${accent}15` : 'none',
                  border: customization.tableStyle === 'bordered' ? `1px solid ${accent}15` : undefined,
                }}
              >
                <td className="py-1.5">{item.description || '—'}</td>
                <td className="py-1.5 text-right opacity-80">{item.quantity}</td>
                <td className="py-1.5 text-right opacity-80">{fmt(item.unit_price)}</td>
                <td className="py-1.5 text-right font-medium">{fmt(item.quantity * item.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 ml-auto w-44 space-y-1">
          <div className="flex justify-between opacity-80"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          {taxTotal > 0 && <div className="flex justify-between opacity-80"><span>Tax</span><span>{fmt(taxTotal)}</span></div>}
          {discountAmount > 0 && <div className="flex justify-between opacity-80"><span>Discount</span><span>-{fmt(discountAmount)}</span></div>}
          <div className="flex justify-between font-bold border-t pt-1.5" style={{ borderColor: `${accent}40`, color: accent }}>
            <span>Total</span><span>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(notes || paymentInfo) && (
        <div className="px-6 pb-5 grid grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: `${accent}15` }}>
          {notes && <div><p className="font-bold text-[9px] uppercase tracking-wide opacity-50 mb-1">Notes</p><p className="opacity-80 leading-relaxed">{notes}</p></div>}
          {paymentInfo && <div><p className="font-bold text-[9px] uppercase tracking-wide opacity-50 mb-1">Payment</p><p className="opacity-80 whitespace-pre-line leading-relaxed">{paymentInfo}</p></div>}
        </div>
      )}

      {/* Signature line */}
      {customization.showSignatureLine && (
        <div className="px-6 pb-5">
          <div className="flex justify-end">
            <div className="text-center">
              <div className="w-32 border-t mt-8 mb-1" style={{ borderColor: textColor + '40' }} />
              <p className="text-[9px] opacity-50">Authorised Signature</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {(customization.footerText || customization.footerImageUrl) && (
        <div className="px-6 py-3 text-center space-y-2" style={{ backgroundColor: customization.footerBg, borderTop: `1px solid ${accent}20` }}>
          {customization.footerImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customization.footerImageUrl} alt="footer" className="h-8 mx-auto object-contain" />
          )}
          {customization.footerText && (
            <p className="text-[10px] opacity-70 leading-relaxed">{customization.footerText}</p>
          )}
        </div>
      )}

      {/* Default footer */}
      {!customization.footerText && !customization.footerImageUrl && (
        <div className="px-6 py-3 text-center text-[9px] opacity-40" style={{ borderTop: `1px solid ${accent}15` }}>
          Generated with ProInvoice · proinvoice.shop
        </div>
      )}
    </div>
  )
}
