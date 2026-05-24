/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import { CURRENCIES } from '@/lib/currencies'
import { Plus, Trash2, Download, Save, ArrowLeft, Eye, EyeOff, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile, Client } from '@/types'
import LogoUpload from '@/components/ui/LogoUpload'
import InvoiceCustomizer, { type InvoiceCustomization, DEFAULT_CUSTOMIZATION } from '@/components/invoice/InvoiceCustomizer'
import { resolveLayout } from '@/lib/invoice-renderer'

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
  const searchParams = useSearchParams()
  const editInvoiceId = searchParams.get('edit') // existing invoice ID when editing
  const duplicateInvoiceId = searchParams.get('duplicate') // existing invoice ID when duplicating
  const isEditMode = !!editInvoiceId
  const isDuplicateMode = !!duplicateInvoiceId

  const supabase = createClient()
  const template = TEMPLATES.find((t) => t.id === params.templateId) ?? TEMPLATES[0]

  const [profile, setProfile] = useState<Profile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string | null>(isEditMode ? editInvoiceId : null)
  const [userId, setUserId] = useState<string>('')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [customization, setCustomization] = useState<InvoiceCustomization>(DEFAULT_CUSTOMIZATION)
  const [loading, setLoading] = useState(isEditMode || isDuplicateMode) // show loading state when editing or duplicating

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

  // Load profile + clients + (if editing/duplicating) existing invoice data
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
      }

      const { data: c } = await supabase.from('clients').select('*').eq('user_id', user.id).order('name')
      setClients(c ?? [])

      // ── EDIT or DUPLICATE MODE: Load existing invoice ───────────────────────
      const targetInvoiceId = editInvoiceId || duplicateInvoiceId
      if (targetInvoiceId) {
        const { data: inv } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('id', targetInvoiceId)
          .eq('user_id', user.id)
          .single()

        if (inv) {
          setFrom({
            name: inv.from_name ?? '',
            email: inv.from_email ?? '',
            phone: inv.from_phone ?? '',
            address: inv.from_address ?? '',
            logo_url: inv.from_logo_url ?? '',
          })
          setTo({
            client_id: inv.client_id ?? '',
            name: inv.to_name ?? '',
            company: inv.to_company ?? '',
            email: inv.to_email ?? '',
            phone: inv.to_phone ?? '',
            address: inv.to_address ?? '',
          })
          
          if (duplicateInvoiceId) {
            // For duplication: generate a new number and dates
            const newNum = `${p?.invoice_prefix ?? 'INV'}-${String((p?.invoice_counter ?? 0) + 1).padStart(3, '0')}`
            setDetails({
              invoice_number: newNum,
              issue_date: new Date().toISOString().split('T')[0],
              due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              currency: inv.currency ?? 'USD',
              po_number: inv.po_number ?? '',
            })
          } else {
            // Edit mode: keep original number and dates
            setDetails({
              invoice_number: inv.invoice_number ?? 'INV-001',
              issue_date: inv.issue_date ?? new Date().toISOString().split('T')[0],
              due_date: inv.due_date ?? '',
              currency: inv.currency ?? 'USD',
              po_number: inv.po_number ?? '',
            })
          }

          // Load line items
          const loadedItems: LineItem[] = (inv.invoice_items ?? []).map(
            (item: { id: string; description: string; quantity: number; unit_price: number; tax_rate: number; total: number }) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              tax_rate: item.tax_rate,
              total: item.total,
            })
          )
          setItems(loadedItems.length > 0 ? loadedItems : [blankItem()])
          setNotes(inv.notes ?? '')
          setPaymentInfo(inv.payment_info ?? '')

          // Restore discount if any
          if (inv.discount_amount > 0) {
            setDiscount({ type: 'flat', value: inv.discount_amount })
          }
        }
        setLoading(false)
      } else {
        // New invoice — populate from profile
        if (p) {
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
      }
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
      // Update existing invoice
      await supabase.from('invoices').update(payload).eq('id', id)
    } else {
      // Create new invoice
      const { data } = await supabase.from('invoices').insert(payload).select('id').single()
      id = data?.id ?? null
      if (id) {
        setInvoiceId(id)
        // Increment invoice counter only for new invoices
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
    if (id) toast.success(isEditMode ? 'Invoice updated!' : 'Draft saved!')
  }

  const handleSaveAndView = async () => {
    const id = await save('draft')
    if (id) {
      toast.success(isEditMode ? 'Invoice updated!' : 'Invoice saved!')
      router.push(`/invoices/${id}`)
    }
  }

  const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const lc = 'block text-xs font-medium text-slate-500 mb-1'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading invoice…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-semibold text-slate-900 text-sm">
              {isEditMode ? 'Edit Invoice' : 'New Invoice'}
            </span>
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
            {saving ? 'Saving…' : isEditMode ? 'Update draft' : 'Save draft'}
          </button>
          <button onClick={handleSaveAndView} disabled={saving} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50">
            <Download className="w-4 h-4" />
            {isEditMode ? 'Update & view' : 'Save & view'}
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
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notes & payment</h2>
            <div className="space-y-3">
              <div><label className={lc}>Notes</label><textarea className={ic + ' resize-none'} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thank you for your business." /></div>
              <div><label className={lc}>Payment instructions</label><textarea className={ic + ' resize-none'} rows={3} value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)} placeholder="Bank details, PayPal, etc." /></div>
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <button onClick={handleSaveDraft} disabled={saving} className="flex items-center gap-2 text-sm border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {isEditMode ? 'Update draft' : 'Save draft'}
            </button>
            <button onClick={handleSaveAndView} disabled={saving} className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 ml-auto">
              <Download className="w-4 h-4" /> {isEditMode ? 'Update & view invoice' : 'Save & view invoice'}
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
  to: { name: string; company: string; email: string; phone: string; address: string }
  details: { invoice_number: string; issue_date: string; due_date: string; currency: string; po_number: string }
  items: LineItem[]
  subtotal: number; taxTotal: number; discountAmount: number; grandTotal: number
  notes: string; paymentInfo: string
  fmt: (n: number) => string
  templateId: string
  customization: InvoiceCustomization
}

function InvoicePreview(p: PreviewProps) {
  const { templateId, customization } = p

  // Get template definition for headerStyle + default accent
  const templateDef = TEMPLATES.find((t) => t.id === templateId)
  const headerStyle = templateDef?.headerStyle ?? 'split'
  const defaultAccent = templateDef?.accent ?? '#2563eb'

  // User's custom accent overrides template default (unless still at default blue)
  const accent = customization.accentColor !== '#2563eb'
    ? customization.accentColor
    : defaultAccent

  const Layout = resolveLayout(headerStyle)

  return (
    <div className="rounded-xl shadow-xl overflow-hidden">
      <Layout {...p} accent={accent} />
    </div>
  )
}
