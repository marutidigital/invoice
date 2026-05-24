'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, Edit, Copy, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardActionsProps {
  invoiceId: string
  invoiceNumber: string
  templateId: string
}

export default function DashboardActions({ invoiceId, invoiceNumber, templateId }: DashboardActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  const handleDuplicate = () => {
    router.push(`/invoices/new/${templateId ?? 'clean'}?duplicate=${invoiceId}`)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return
    }
    setDeleting(true)

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success('Invoice deleted')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* View */}
      <Link
        href={`/invoices/${invoiceId}`}
        title="View Invoice"
        className="flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
      </Link>

      {/* Edit */}
      <Link
        href={`/invoices/new/${templateId ?? 'clean'}?edit=${invoiceId}`}
        title="Edit Invoice"
        className="flex items-center justify-center p-1.5 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Edit className="w-3.5 h-3.5" />
      </Link>

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        title="Duplicate Invoice"
        className="flex items-center justify-center p-1.5 text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete Invoice"
        className="flex items-center justify-center p-1.5 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}
