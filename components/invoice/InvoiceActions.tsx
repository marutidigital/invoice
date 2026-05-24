'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Download, Send, CheckCircle, AlertCircle, ChevronDown, Copy, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface InvoiceActionsProps {
  invoiceId: string
  currentStatus: string
  invoiceNumber: string
  templateId: string
}

export default function InvoiceActions({ invoiceId, currentStatus, invoiceNumber, templateId }: InvoiceActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const handleDuplicate = () => {
    router.push(`/invoices/new/${templateId ?? 'clean'}?duplicate=${invoiceId}`)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return
    }
    setUpdating(true)
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)

    if (error) {
      toast.error(error.message)
      setUpdating(false)
    } else {
      toast.success('Invoice deleted')
      router.push('/dashboard')
      router.refresh()
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
    { value: 'sent', label: 'Sent', color: 'text-blue-700', bg: 'bg-blue-50' },
    { value: 'paid', label: 'Paid', color: 'text-green-700', bg: 'bg-green-50' },
    { value: 'overdue', label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50' },
  ]

  const currentStatusOption = statusOptions.find(s => s.value === status) ?? statusOptions[0]

  const updateStatus = async (newStatus: string) => {
    if (newStatus === status) { setShowStatusMenu(false); return }
    setUpdating(true)
    setShowStatusMenu(false)

    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId)

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

  return (
    <div className="flex items-center gap-2">
      {/* Status changer */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          disabled={updating}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all ${currentStatusOption.bg} ${currentStatusOption.color} hover:opacity-80`}
        >
          {updating ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : null}
          {status}
          <ChevronDown className="w-3 h-3" />
        </button>

        {showStatusMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
            <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[140px]">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateStatus(opt.value)}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm capitalize transition-colors hover:bg-slate-50 ${
                    status === opt.value ? 'font-semibold' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.bg.replace('bg-', 'bg-')} border border-current ${opt.color}`} />
                  {opt.label}
                  {status === opt.value && (
                    <CheckCircle className="w-3.5 h-3.5 ml-auto text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick status buttons */}
      {status === 'draft' && (
        <button
          onClick={() => updateStatus('sent')}
          disabled={updating}
          className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Mark sent
        </button>
      )}
      {status === 'sent' && (
        <button
          onClick={() => updateStatus('paid')}
          disabled={updating}
          className="flex items-center gap-1.5 text-sm text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Mark paid
        </button>
      )}
      {(status === 'sent') && (
        <button
          onClick={() => updateStatus('overdue')}
          disabled={updating}
          className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Mark overdue
        </button>
      )}

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={updating}
        className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        Delete
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
