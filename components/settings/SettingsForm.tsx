'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { COUNTRIES } from '@/lib/countries'
import { CURRENCIES } from '@/lib/currencies'
import type { Profile } from '@/types'

interface SettingsFormProps {
  profile: Profile | null
  userId: string
  userEmail: string
}

export default function SettingsForm({ profile, userId, userEmail }: SettingsFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    business_name: profile?.business_name ?? '',
    contact_name: profile?.contact_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    postcode: profile?.postcode ?? '',
    country: profile?.country ?? 'US',
    currency: profile?.currency ?? 'USD',
    tax_label: profile?.tax_label ?? 'Tax',
    tax_rate: profile?.tax_rate?.toString() ?? '0',
    payment_info: profile?.payment_info ?? '',
    default_notes: profile?.default_notes ?? '',
    invoice_prefix: profile?.invoice_prefix ?? 'INV',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email: userEmail,
      ...form,
      tax_rate: parseFloat(form.tax_rate) || 0,
    })

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
