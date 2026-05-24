import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileSpreadsheet } from 'lucide-react'
import DashboardActions from '@/components/dashboard/DashboardActions'
import type { Business } from '@/types'

export default async function EstimatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch active business from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user!.id)
    .single()

  let activeBiz: Business | null = null
  if (profile?.active_business_id) {
    const { data: b } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', profile.active_business_id)
      .single()
    activeBiz = b
  }

  const businessId = profile?.active_business_id

  // Fetch estimates for active business
  const { data: estimates } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, issue_date, due_date, to_name, to_company, currency, template_id')
    .eq('business_id', businessId)
    .eq('type', 'estimate')
    .order('created_at', { ascending: false })

  const allEstimates = estimates ?? []

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    sent: 'bg-blue-50 text-blue-700 border border-blue-100/50',
    accepted: 'bg-green-50 text-green-700 border border-green-100/50',
    declined: 'bg-rose-50 text-rose-700 border border-rose-100/50',
  }

  const currency = activeBiz?.currency ?? 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estimates</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track your quotes & estimates</p>
        </div>
        <Link
          href="/estimates/new"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          New estimate
        </Link>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">All Estimates</h2>
        </div>

        {allEstimates.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No estimates yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create quotes or estimates for your clients.</p>
            <Link
              href="/estimates/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create first estimate
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50/40">
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Estimate #</th>
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Client</th>
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Amount</th>
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Date</th>
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Status</th>
                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allEstimates.map((est) => (
                <tr key={est.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/estimates/${est.id}`} className="font-bold text-blue-600 hover:text-blue-700 text-sm">
                      {est.invoice_number}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600 truncate max-w-[180px]">
                    {est.to_company || est.to_name || '—'}
                  </td>
                  <td className="px-3 py-4 text-sm font-bold text-slate-900">
                    {fmt(est.total ?? 0)}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-500">
                    {new Date(est.issue_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[est.status] ?? statusColors.draft}`}>
                      {est.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DashboardActions
                      invoiceId={est.id}
                      invoiceNumber={est.invoice_number}
                      templateId={est.template_id ?? 'clean'}
                      isEstimate={true}
                    />
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
