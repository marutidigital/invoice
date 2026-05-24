'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Client } from '@/types'

export default function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    name: client.name ?? '',
    company: client.company ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    address: client.address ?? '',
    notes: client.notes ?? '',
  })

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Client name is required')
      return
    }
    setSaving(true)

    const { error } = await supabase
      .from('clients')
      .update({
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq('id', client.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Client updated!')
      router.refresh()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)

    const { error } = await supabase.from('clients').delete().eq('id', client.id)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success('Client deleted')
      router.push('/clients')
    }
  }

  const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const lc = 'block text-xs font-medium text-slate-500 mb-1.5'

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className={lc}>Full name *</label>
        <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={ic} />
      </div>
      <div>
        <label className={lc}>Company</label>
        <input type="text" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" className={ic} />
      </div>
      <div>
        <label className={lc}>Email</label>
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="client@example.com" className={ic} />
      </div>
      <div>
        <label className={lc}>Phone</label>
        <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" className={ic} />
      </div>
      <div>
        <label className={lc}>Address</label>
        <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="456 Client Ave, City" className={ic} />
      </div>
      <div>
        <label className={lc}>Notes</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={ic + ' resize-none'} />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-medium transition-all ${
            confirmDelete
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
          }`}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {confirmDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>

      {confirmDelete && (
        <p className="text-xs text-red-500 text-center">
          Click &quot;Confirm delete&quot; again to permanently delete this client.
          <button type="button" onClick={() => setConfirmDelete(false)} className="ml-2 underline text-slate-500">Cancel</button>
        </p>
      )}
    </form>
  )
}
