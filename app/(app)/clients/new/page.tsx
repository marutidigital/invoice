'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Client name is required')
      return
    }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select('id')
      .single()

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Client added!')
    router.push(`/clients/${data.id}`)
  }

  const ic = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const lc = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clients" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add client</h1>
          <p className="text-slate-500 text-sm mt-0.5">Save client details for fast invoicing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
          {/* Avatar hint */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">New client</p>
              <p className="text-xs text-slate-400">Fill in the details below — only name is required</p>
            </div>
          </div>

          {/* Name + company */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                autoFocus
                placeholder="John Smith"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}>Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Corp"
                className={ic}
              />
            </div>
          </div>

          {/* Email + phone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lc}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="client@example.com"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 555 000 0000"
                className={ic}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={lc}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="456 Client Ave, City, Country"
              className={ic}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={lc}>Notes (internal)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any notes about this client…"
              rows={3}
              className={ic + ' resize-none'}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link
            href="/clients"
            className="flex items-center gap-2 text-sm border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-60 ml-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save client'}
          </button>
        </div>
      </form>
    </div>
  )
}
