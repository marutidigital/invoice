'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Download, CheckCircle, AlertCircle, ChevronDown, Copy, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface EstimateActionsProps {
  estimateId: string
  currentStatus: string
  estimateNumber: string
  businessId: string
}

export default function EstimateActions({ estimateId, currentStatus, estimateNumber, businessId }: EstimateActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [converting, setConverting] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
    { value: 'sent', label: 'Sent', color: 'text-blue-700', bg: 'bg-blue-50' },
    { value: 'accepted', label: 'Accepted', color: 'text-green-700', bg: 'bg-green-50' },
    { value: 'declined', label: 'Declined', color: 'text-red-700', bg: 'bg-red-50' },
  ]

  const currentStatusOption = statusOptions.find(s => s.value === status) ?? statusOptions[0]

  const updateStatus = async (newStatus: string) => {
    if (newStatus === status) { setShowStatusMenu(false); return }
    setUpdating(true)
    setShowStatusMenu(false)

    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', estimateId)

    if (error) {
      toast.error(error.message)
    } else {
      setStatus(newStatus)
      toast.success(`Status updated to ${newStatus}`)
      router.refresh()
    }
    setUpdating(false)
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handleConvert = async () => {
    setConverting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthenticated')

      // 1. Fetch estimate + line items
      const { data: estimate, error: estError } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', estimateId)
        .single()

      if (estError || !estimate) throw new Error(estError?.message || 'Estimate not found')

      // 2. Fetch business to get next invoice counter
      const { data: biz, error: bizError } = await supabase
        .from('businesses')
        .select('invoice_prefix, invoice_counter')
        .eq('id', businessId)
        .single()

      if (bizError || !biz) throw new Error(bizError?.message || 'Business profile not found')

      const prefix = biz.invoice_prefix ?? 'INV'
      const nextCounter = (biz.invoice_counter ?? 0) + 1
      const invoiceNumber = `${prefix}-${String(nextCounter).padStart(3, '0')}`

      // 3. Create new invoice row
      const payload = {
        user_id: user.id,
        business_id: businessId,
        client_id: estimate.client_id,
        invoice_number: invoiceNumber,
        status: 'draft',
        type: 'invoice',
        parent_id: estimateId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        currency: estimate.currency,
        po_number: estimate.po_number,
        from_name: estimate.from_name,
        from_email: estimate.from_email,
        from_phone: estimate.from_phone,
        from_address: estimate.from_address,
        from_logo_url: estimate.from_logo_url,
        to_name: estimate.to_name,
        to_email: estimate.to_email,
        to_phone: estimate.to_phone,
        to_company: estimate.to_company,
        to_address: estimate.to_address,
        subtotal: estimate.subtotal,
        tax_amount: estimate.tax_amount,
        discount_amount: estimate.discount_amount,
        total: estimate.total,
        notes: estimate.notes,
        payment_info: estimate.payment_info,
        template_id: estimate.template_id,
      }

      const { data: newInv, error: insertError } = await supabase
        .from('invoices')
        .insert(payload)
        .select('id')
        .single()

      if (insertError || !newInv) throw new Error(insertError?.message || 'Failed to insert invoice')

      // 4. Create line items
      const itemsPayload = (estimate.invoice_items || []).map((item: any, idx: number) => ({
        invoice_id: newInv.id,
        sort_order: idx,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        total: item.total,
      }))

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsPayload)

        if (itemsError) throw itemsError
      }

      // 5. Increment counter
      await supabase
        .from('businesses')
        .update({ invoice_counter: nextCounter })
        .eq('id', businessId)

      toast.success('Successfully converted to Invoice! 🎉')
      router.push(`/invoices/${newInv.id}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to convert estimate')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Menu */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          disabled={updating}
          className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${currentStatusOption.value === 'accepted' ? 'bg-green-500' : currentStatusOption.value === 'declined' ? 'bg-red-500' : currentStatusOption.value === 'sent' ? 'bg-blue-500' : 'bg-slate-400'}`} />
          {currentStatusOption.label}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showStatusMenu && (
          <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 w-36">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStatus(opt.value)}
                className={`w-full flex items-center px-4 py-2 text-xs font-semibold text-left hover:bg-slate-50 ${opt.value === status ? 'text-blue-600' : 'text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Convert to Invoice */}
      <button
        onClick={handleConvert}
        disabled={converting || status === 'declined'}
        className="flex items-center gap-1.5 text-sm text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-3.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {converting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-3.5 h-3.5" />
            Convert to Invoice
          </>
        )}
      </button>

      {/* Download PDF */}
      <button
        onClick={handleDownloadPDF}
        className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-all"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </button>
    </div>
  )
}
