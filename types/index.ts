// types/index.ts — InvoiceForge global TypeScript types

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  logo_url?: string;
  currency: string;
  tax_label?: string;
  tax_rate?: number;
  payment_info?: string;
  default_notes?: string;
  invoice_prefix: string;
  invoice_counter: number;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  active_business_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  sort_order: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  business_id: string;
  client_id?: string;
  invoice_number: string;
  status: string; // can be invoice status or estimate status
  type: 'invoice' | 'estimate';
  parent_id?: string;
  issue_date: string;
  due_date?: string;
  currency: string;
  po_number?: string;

  // From (sender)
  from_name?: string;
  from_email?: string;
  from_phone?: string;
  from_address?: string;
  from_logo_url?: string;

  // To (client)
  to_name?: string;
  to_email?: string;
  to_phone?: string;
  to_company?: string;
  to_address?: string;

  // Totals
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;

  notes?: string;
  payment_info?: string;
  template_id: string;

  // Relations
  items?: InvoiceItem[];
  client?: Client;

  created_at?: string;
  updated_at?: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'minimal' | 'classic' | 'modern' | 'creative';
  description: string;
  thumbnail: string;
}

// For the invoice form state
export interface InvoiceFormData {
  // From
  from_name: string;
  from_email: string;
  from_phone: string;
  from_address: string;
  from_logo_url: string;

  // To
  client_id: string;
  to_name: string;
  to_email: string;
  to_phone: string;
  to_company: string;
  to_address: string;

  // Details
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  po_number: string;
  template_id: string;

  // Line items
  items: InvoiceItemFormData[];

  // Discount
  discount_type: 'flat' | 'percent';
  discount_value: number;

  // Notes
  notes: string;
  payment_info: string;
}

export interface InvoiceItemFormData {
  id: string; // temp local id
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

// Email modal
export interface SendEmailPayload {
  invoiceId: string;
  to: string;
  cc?: string;
  subject: string;
  message: string;
}

// Dashboard summary
export interface DashboardSummary {
  totalSentThisMonth: number;
  totalAmountThisMonth: number;
  totalUnpaid: number;
  totalOverdue: number;
}
