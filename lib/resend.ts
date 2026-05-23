import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.FROM_EMAIL ?? 'invoices@proinvoice.shop'
export const FROM_NAME = process.env.FROM_NAME ?? 'ProInvoice'
