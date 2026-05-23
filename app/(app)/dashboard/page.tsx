import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, currency')
    .eq('id', user!.id)
    .single()

  // Fetch summary stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, issue_date, due_date, to_name, to_company, currency')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const allInvoices = invoices ?? []

  // Summary calculations
  const sentThisMonth = allInvoices.filter(
    (inv) => inv.status === 'sent' && inv.issue_date >= monthStart
  ).length

  const amountThisMonth = allInvoices
    .filter((inv) => inv.status !== 'draft' && inv.issue_date >= monthStart)
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const totalUnpaid = allInvoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const totalOverdue = allInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const currency = profile?.currency ?? 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    overdue: 'bg-red-50 text-red-700',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.business_name ?? 'Your invoices'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track all your invoices</p>
        </div>
        <Link
          href="/invoices/new"
          id="new-invoice-btn"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          New invoice
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Sent this month',
            value: sentThisMonth.toString(),
            icon: <FileText className="w-5 h-5 text-blue-500" />,
            bg: 'bg-blue-50',
          },
          {
            label: 'Invoiced this month',
            value: fmt(amountThisMonth),
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            bg: 'bg-green-50',
          },
          {
            label: 'Total unpaid',
            value: fmt(totalUnpaid),
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            bg: 'bg-amber-50',
          },
          {
            label: 'Overdue',
            value: fmt(totalOverdue),
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            bg: 'bg-red-50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent invoices</h2>
        </div>

        {allInvoices.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No invoices yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first invoice to get started.</p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3">Invoice #</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Client</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-blue-600 hover:text-blue-700 text-sm">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700">
                    {inv.to_company || inv.to_name || '—'}
                  </td>
                  <td className="px-3 py-4 text-sm font-medium text-slate-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: inv.currency ?? 'USD',
                    }).format(inv.total ?? 0)}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-500">
                    {new Date(inv.issue_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inv.status] ?? statusColors.draft}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
