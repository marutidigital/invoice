// lib/invoice-number.ts — auto-increment invoice number per user

import { createClient } from '@/lib/supabase/server'

/**
 * Generates the next invoice number for the logged-in user.
 * Format: {prefix}-{padded number}  e.g. "INV-007"
 */
export async function getNextInvoiceNumber(userId: string): Promise<string> {
  const supabase = await createClient()

  // Fetch the user's profile for prefix + counter
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('invoice_prefix, invoice_counter')
    .eq('id', userId)
    .single()

  if (error || !profile) return 'INV-001'

  const prefix = profile.invoice_prefix ?? 'INV'
  const nextNumber = (profile.invoice_counter ?? 0) + 1
  const padded = String(nextNumber).padStart(3, '0')

  // Increment the counter
  await supabase
    .from('profiles')
    .update({ invoice_counter: nextNumber })
    .eq('id', userId)

  return `${prefix}-${padded}`
}

/**
 * Find the highest existing invoice number for a user and return the next one.
 * Used as a fallback in case the counter gets out of sync.
 */
export async function getNextInvoiceNumberFromHistory(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('invoice_prefix')
    .eq('id', userId)
    .single()

  const prefix = profile?.invoice_prefix ?? 'INV'

  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  let maxNum = 0
  for (const inv of invoices ?? []) {
    // Extract trailing number from invoice_number
    const match = inv.invoice_number.match(/(\d+)$/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > maxNum) maxNum = n
    }
  }

  const next = maxNum + 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}
