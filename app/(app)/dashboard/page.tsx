import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, FileSpreadsheet, TrendingUp, Clock, AlertCircle, Calendar, ArrowRight } from 'lucide-react'
import DashboardActions from '@/components/dashboard/DashboardActions'
import type { Business } from '@/types'

export default async function DashboardPage() {
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

  // Fetch invoices for active business
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, issue_date, due_date, to_name, to_company, currency, template_id')
    .eq('business_id', businessId)
    .eq('type', 'invoice')
    .order('created_at', { ascending: false })
    .limit(10)

  const allInvoices = invoices ?? []

  // Fetch estimates for active business
  const { data: estimates } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, issue_date, due_date, to_name, to_company, currency, template_id')
    .eq('business_id', businessId)
    .eq('type', 'estimate')
    .order('created_at', { ascending: false })
    .limit(10)

  const allEstimates = estimates ?? []

  // Calculate monthly analytics (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return {
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      total: 0,
      paid: 0,
    }
  })

  // Fetch all invoices for metrics & chart calculation
  const { data: allBizInvoices } = await supabase
    .from('invoices')
    .select('total, status, issue_date')
    .eq('business_id', businessId)
    .eq('type', 'invoice')

  const bizInvoices = allBizInvoices ?? []

  // Populate month values
  bizInvoices.forEach((inv) => {
    const date = new Date(inv.issue_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const bucket = last6Months.find((m) => m.monthKey === key)
    if (bucket) {
      bucket.total += Number(inv.total ?? 0)
      if (inv.status === 'paid') {
        bucket.paid += Number(inv.total ?? 0)
      }
    }
  })

  // Stats calculation
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const sentThisMonth = bizInvoices.filter(
    (inv) => inv.status === 'sent' && inv.issue_date >= monthStart
  ).length

  const amountThisMonth = bizInvoices
    .filter((inv) => inv.status !== 'draft' && inv.issue_date >= monthStart)
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const totalUnpaid = bizInvoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const totalOverdue = bizInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total ?? 0), 0)

  const currency = activeBiz?.currency ?? 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const maxVal = Math.max(...last6Months.map((m) => m.total), 100)

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    sent: 'bg-blue-50 text-blue-700 border border-blue-100/50',
    paid: 'bg-green-50 text-green-700 border border-green-100/50',
    overdue: 'bg-red-50 text-red-700 border border-red-100/50',
  }

  const estimateStatusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border border-slate-200/50',
    sent: 'bg-blue-50 text-blue-700 border border-blue-100/50',
    accepted: 'bg-green-50 text-green-700 border border-green-100/50',
    declined: 'bg-rose-50 text-rose-700 border border-rose-100/50',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeBiz?.name || 'My Business'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Financial analytics & invoicing dashboard</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/estimates"
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            Estimates list
          </Link>
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            New invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Sent this month',
            value: sentThisMonth.toString(),
            icon: <FileText className="w-5 h-5 text-blue-500" />,
            bg: 'bg-blue-50/50',
          },
          {
            label: 'Invoiced this month',
            value: fmt(amountThisMonth),
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            bg: 'bg-green-50/50',
          },
          {
            label: 'Total unpaid',
            value: fmt(totalUnpaid),
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            bg: 'bg-amber-50/50',
          },
          {
            label: 'Overdue',
            value: fmt(totalOverdue),
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            bg: 'bg-red-50/50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3.5`}>
              {card.icon}
            </div>
            <p className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">{card.value}</p>
            <p className="text-xs font-medium text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Graph & Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SVG Revenue Graph */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Revenue Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Paid vs. total billed over the last 6 months</p>
          </div>
          
          <div className="my-6">
            <svg viewBox="0 0 500 200" className="w-full h-44">
              {/* Horizontal grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f8fafc" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f8fafc" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f8fafc" strokeWidth="1" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
              
              {last6Months.map((m, idx) => {
                const totalHeight = (m.total / maxVal) * 150
                const paidHeight = (m.paid / maxVal) * 150
                const x = 30 + idx * 75
                const totalY = 180 - totalHeight
                const paidY = 180 - paidHeight
                const barWidth = 36

                return (
                  <g key={m.label} className="group">
                    {/* Billed (light background bar) */}
                    <rect
                      x={x}
                      y={totalY}
                      width={barWidth}
                      height={totalHeight}
                      rx="4"
                      fill="#f1f5f9"
                      className="transition-all duration-300 group-hover:fill-slate-200"
                    />
                    {/* Paid (blue foreground bar) */}
                    <rect
                      x={x}
                      y={paidY}
                      width={barWidth}
                      height={paidHeight}
                      rx="4"
                      fill="#3b82f6"
                      className="transition-all duration-300 group-hover:fill-blue-600"
                    />
                    {/* Labels */}
                    <text
                      x={x + barWidth / 2}
                      y="196"
                      textAnchor="middle"
                      className="text-[9px] font-semibold fill-slate-400"
                    >
                      {m.label}
                    </text>
                    <title>{`Billed: ${fmt(m.total)} | Paid: ${fmt(m.paid)}`}</title>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="flex gap-4 text-xs font-semibold text-slate-500 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Paid Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>Billed Revenue</span>
            </div>
          </div>
        </div>

        {/* Quick actions & stats */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Active Plan & Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Free forever plan status</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Registered Business Profile</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold uppercase tracking-wider text-[9px] border border-blue-100/50">Free Tier</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Default Currency</span>
              <span className="font-bold text-slate-800">{currency}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Business Setup</span>
              <span className="text-green-600 font-bold">100% Complete</span>
            </div>
          </div>

          <Link
            href="/settings"
            className="w-full flex items-center justify-center gap-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200/60"
          >
            Manage Settings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recents list Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Recent Invoices</h2>
            <Link href="/invoices/new" className="text-xs font-semibold text-blue-600 hover:underline">
              Create New
            </Link>
          </div>

          {allInvoices.length === 0 ? (
            <div className="py-14 text-center flex-1 flex flex-col items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No invoices created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50 text-left bg-slate-50/40">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Invoice #</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Client</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Amount</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link href={`/invoices/${inv.id}`} className="font-bold text-blue-600 hover:text-blue-700 text-xs">
                          {inv.invoice_number}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize ml-2 ${statusColors[inv.status] ?? statusColors.draft}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-600 truncate max-w-[120px]">
                        {inv.to_company || inv.to_name || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-xs font-bold text-slate-800">
                        {fmt(inv.total ?? 0)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <DashboardActions
                          invoiceId={inv.id}
                          invoiceNumber={inv.invoice_number}
                          templateId={inv.template_id ?? 'clean'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Estimates */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Recent Estimates</h2>
            <Link href="/estimates" className="text-xs font-semibold text-blue-600 hover:underline">
              Create New
            </Link>
          </div>

          {allEstimates.length === 0 ? (
            <div className="py-14 text-center flex-1 flex flex-col items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No estimates created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50 text-left bg-slate-50/40">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3">Estimate #</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Client</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-3">Amount</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allEstimates.map((est) => (
                    <tr key={est.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link href={`/estimates/${est.id}`} className="font-bold text-blue-600 hover:text-blue-700 text-xs">
                          {est.invoice_number}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize ml-2 ${estimateStatusColors[est.status] ?? estimateStatusColors.draft}`}>
                          {est.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-slate-600 truncate max-w-[120px]">
                        {est.to_company || est.to_name || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-xs font-bold text-slate-800">
                        {fmt(est.total ?? 0)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
