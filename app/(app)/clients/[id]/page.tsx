import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Edit } from 'lucide-react'
import ClientEditForm from './ClientEditForm'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch client
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  // Fetch invoices for this client
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, currency, issue_date')
    .eq('client_id', client.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    overdue: 'bg-red-50 text-red-700',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clients" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          {client.company && <p className="text-slate-500 text-sm mt-0.5">{client.company}</p>}
        </div>
        <Link
          href={`/invoices/new?client=${client.id}`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
        >
          <FileText className="w-4 h-4" />
          New invoice
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Edit form */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Client details</h2>
              <Edit className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-6">
              <ClientEditForm client={client} />
            </div>
          </div>
        </div>

        {/* Invoices for this client */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Invoices</h2>
            </div>
            {!invoices || invoices.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No invoices yet for this client</p>
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create first invoice
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-blue-600">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{inv.issue_date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: inv.currency ?? 'USD',
                        }).format(inv.total ?? 0)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inv.status] ?? statusColors.draft}`}>
                        {inv.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
