import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Users } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('name', { ascending: true })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client book</h1>
          <p className="text-slate-500 text-sm mt-0.5">Save client details for fast invoicing</p>
        </div>
        <Link
          href="/clients/new"
          id="add-client-btn"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {!clients || clients.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No clients yet</h3>
            <p className="text-sm text-slate-500 mb-6">Add your first client to speed up invoicing.</p>
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add first client
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                  {client.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{client.name}</p>
                  {client.company && (
                    <p className="text-xs text-slate-500">{client.company}</p>
                  )}
                </div>
                {client.email && (
                  <p className="text-sm text-slate-500 truncate max-w-[200px]">{client.email}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
