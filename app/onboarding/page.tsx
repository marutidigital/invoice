'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { COUNTRIES } from '@/lib/countries'
import { CURRENCIES } from '@/lib/currencies'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    currency: 'USD',
    tax_label: 'Tax',
    tax_rate: '',
    payment_info: '',
    default_notes: 'Thank you for your business.',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.business_name.trim()) {
      toast.error('Business name is required')
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Fetch current profile to see if there is an active business ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_business_id')
      .eq('id', user.id)
      .single()

    let activeBusinessId = profile?.active_business_id
    let dbError = null

    const businessData = {
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
    }

    if (activeBusinessId) {
      // Update existing default business
      const { error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', activeBusinessId)
      dbError = error
    } else {
      // Create new business row
      const { data: newBiz, error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          ...businessData
        })
        .select()
        .single()

      if (!error && newBiz) {
        activeBusinessId = newBiz.id
        // Link to profile
        const { error: linkError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email!,
            active_business_id: newBiz.id,
          })
        dbError = linkError
      } else {
        dbError = error
      }
    }

    if (dbError) {
      toast.error(dbError.message)
      setLoading(false)
    } else {
      toast.success('Business settings saved! Welcome aboard 🎉')
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 justify-center mb-10">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-xl">ProInvoice</span>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Set up your business</h1>
          <p className="text-slate-500">
            This information will auto-fill on every invoice. You can edit it any time in Settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
          {/* Business info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Business details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Business name <span className="text-red-500">*</span>
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={form.business_name}
                  onChange={(e) => set('business_name', e.target.value)}
                  placeholder="Acme Ltd."
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Your name / contact</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => set('contact_name', e.target.value)}
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Street address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Main St"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="New York"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>State / Region</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="NY"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Postcode / ZIP</label>
                <input
                  type="text"
                  value={form.postcode}
                  onChange={(e) => set('postcode', e.target.value)}
                  placeholder="10001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  required
                  className={inputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
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
                <label className={labelClass}>Default currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tax label</label>
                <input
                  type="text"
                  value={form.tax_label}
                  onChange={(e) => set('tax_label', e.target.value)}
                  placeholder="VAT, GST, Tax…"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Default tax rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.tax_rate}
                  onChange={(e) => set('tax_rate', e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Payment + notes */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Payment & notes</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Payment instructions</label>
                <textarea
                  value={form.payment_info}
                  onChange={(e) => set('payment_info', e.target.value)}
                  rows={3}
                  placeholder="Bank: Acme Bank&#10;Account: 1234567890&#10;Sort code: 12-34-56"
                  className={inputClass + ' resize-none'}
                />
              </div>
              <div>
                <label className={labelClass}>Default notes</label>
                <textarea
                  value={form.default_notes}
                  onChange={(e) => set('default_notes', e.target.value)}
                  rows={2}
                  placeholder="Thank you for your business."
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>
          </div>

          <button
            id="save-profile-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Save & start invoicing →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
