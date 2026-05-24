'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { COUNTRIES } from '@/lib/countries'
import { CURRENCIES } from '@/lib/currencies'
import type { Business } from '@/types'
import LogoUpload from '@/components/ui/LogoUpload'

interface SettingsFormProps {
  business: Business | null
  userId: string
  userEmail: string
}

export default function SettingsForm({ business, userId, userEmail }: SettingsFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    business_name: business?.name ?? '',
    contact_name: business?.contact_name ?? '',
    phone: business?.phone ?? '',
    address: business?.address ?? '',
    city: business?.city ?? '',
    state: business?.state ?? '',
    postcode: business?.postcode ?? '',
    country: business?.country ?? 'US',
    currency: business?.currency ?? 'USD',
    tax_label: business?.tax_label ?? 'Tax',
    tax_rate: business?.tax_rate?.toString() ?? '0',
    payment_info: business?.payment_info ?? '',
    default_notes: business?.default_notes ?? '',
    invoice_prefix: business?.invoice_prefix ?? 'INV',
    logo_url: business?.logo_url ?? '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business?.id) {
      toast.error('No active business to update')
      return
    }
    setLoading(true)

    const { error } = await supabase
      .from('businesses')
      .update({
        name: form.business_name.trim(),
        contact_name: form.contact_name || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        postcode: form.postcode || null,
        country: form.country,
        currency: form.currency,
        tax_label: form.tax_label || 'Tax',
        tax_rate: parseFloat(form.tax_rate) || 0,
        payment_info: form.payment_info || null,
        default_notes: form.default_notes || null,
        invoice_prefix: form.invoice_prefix || 'INV',
        logo_url: form.logo_url || null,
      })
      .eq('id', business.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Settings saved!')
    }
    setLoading(false)
  }

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        {/* Business info */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Business details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Business name *</label>
              <input type="text" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact name</label>
              <input type="text" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Street address</label>
              <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State / Region</label>
              <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Postcode / ZIP</label>
              <input type="text" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <select value={form.country} onChange={(e) => set('country', e.target.value)} required className={inputClass}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-2 mt-2">
            <LogoUpload
              currentUrl={form.logo_url}
              userId={userId}
              onUpload={(url) => set('logo_url', url)}
            />
          </div>
        </div>

        {/* Invoice defaults */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Invoice defaults</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Invoice prefix</label>
              <input type="text" value={form.invoice_prefix} onChange={(e) => set('invoice_prefix', e.target.value)} placeholder="INV" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Default currency</label>
              <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputClass}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tax label</label>
              <input type="text" value={form.tax_label} onChange={(e) => set('tax_label', e.target.value)} placeholder="Tax" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Default tax rate (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={form.tax_rate} onChange={(e) => set('tax_rate', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Payment & notes</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Payment instructions</label>
              <textarea value={form.payment_info} onChange={(e) => set('payment_info', e.target.value)} rows={3} className={inputClass + ' resize-none'} />
            </div>
            <div>
              <label className={labelClass}>Default notes</label>
              <textarea value={form.default_notes} onChange={(e) => set('default_notes', e.target.value)} rows={2} className={inputClass + ' resize-none'} />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save settings'}
      </button>
    </form>
  )
}
