# InvoiceForge — Full Developer Brief
**Version:** 1.0  
**Audience:** Lead Developer  
**Project type:** Web application (worldwide, free forever, no AI)

---

## 1. Project overview

Build a clean, fast, free invoice generator for anyone in the world. No paywalls, no watermarks, no limits. The product's entire value is in its **memory** — users set up once, and every invoice after that is fast because the app remembers their business details, their clients, and every invoice they have ever made.

There is no AI. There is no complexity. Just a great invoice tool that works.

---

## 2. Core user promise

> "Pick a template, fill a short form, download your PDF or email it to your client. Done in under 2 minutes. Every time."

Every design and feature decision must serve this promise. If a feature makes it slower or more confusing, it does not belong in this product.

---

## 3. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use server components where possible |
| Styling | Tailwind CSS | Keep design clean and minimal |
| Database + Auth | Supabase | Postgres + Supabase Auth (Google + magic link) |
| File storage | Supabase Storage | Logos, any uploaded assets |
| PDF generation | `react-pdf` (client) or Puppeteer (server route) | Pixel-perfect output |
| Email sending | Resend API | Send invoice PDFs to clients |
| Hosting | Vercel | Auto-deploy from GitHub main branch |
| Source control | GitHub | Feature branches, PRs into main |
| Language | TypeScript | Strict mode on |

**No AI APIs. No Gemini. No OpenAI. Nothing like that.**

---

## 4. Authentication

Use Supabase Auth. Two login methods only:

- **Google OAuth** — one-click login
- **Magic link (email)** — passwordless

No username/password login. No social logins beyond Google.

On first login, redirect user to an onboarding screen to fill in their business profile (see Section 7). Until the profile is saved, they cannot create invoices.

---

## 5. Pages and routing

```
/                        → Marketing landing page (see Section 6)
/login                   → Login page (Google + magic link)
/onboarding              → First-time business profile setup
/dashboard               → Invoice history (default after login)
/invoices/new            → Step 1: Template picker
/invoices/new/[templateId] → Step 2: Invoice form + live preview
/invoices/[id]           → View a saved invoice
/invoices/[id]/edit      → Edit a saved invoice
/clients                 → Client book (list, add, edit, delete)
/settings                → Business profile settings
/templates               → Browse all templates (can also be modal)
```

All routes under `/dashboard`, `/invoices`, `/clients`, `/settings` are protected. Redirect unauthenticated users to `/login`.

---

## 6. Landing page (`/`)

Simple, fast, no fluff. Sections in order:

1. **Hero** — headline: "Create professional invoices in minutes. Free, forever." Subheadline: "No watermarks. No limits. No credit card." Two buttons: "Create your first invoice" (→ /login) and "See how it works" (smooth scroll to demo section).
2. **How it works** — three steps with icons: Pick a template → Fill the form → Download or send. Keep it visual.
3. **Template preview** — show 4–6 template thumbnails.
4. **Features** — four simple cards: Smart memory, PDF download, Email to client, Invoice history.
5. **Footer** — logo, "Free forever", GitHub link (if open source), privacy policy link.

No pricing section. No testimonials. No blog. Keep the landing page under 5 sections.

---

## 7. Business profile (onboarding + settings)

This is the data that auto-fills on every invoice. Collected once, editable any time in `/settings`.

**Fields:**

```
Business name         (text, required)
Your name / contact   (text, optional)
Email address         (text, auto-filled from auth)
Phone number          (text, optional)
Street address        (text, optional)
City                  (text, optional)
State / Region        (text, optional)
Postcode / ZIP        (text, optional)
Country               (dropdown, all countries, required)
Logo                  (image upload, stored in Supabase Storage, optional)
Default currency      (dropdown, see currency list in Section 11)
Default tax label     (text, e.g. "VAT", "GST", "Tax" — optional)
Default tax rate      (number %, optional)
Payment instructions  (textarea — bank details, PayPal email, etc., optional)
Default notes         (textarea — e.g. "Thank you for your business", optional)
```

On the invoice form, all of these auto-fill but can be overridden per invoice.

---

## 8. Client book (`/clients`)

Simple CRUD. Each client belongs to the logged-in user.

**Client fields:**

```
Name          (text, required)
Email         (text, optional — used for sending invoices)
Phone         (text, optional)
Company name  (text, optional)
Address       (textarea, optional)
Notes         (textarea, optional — private, never shown on invoice)
```

**Behaviour:**
- List page shows all clients, searchable by name or company.
- Click a client → view their details + list of all invoices sent to them.
- Add / Edit / Delete from the list or detail view.
- On the invoice form, client is a searchable dropdown. Selecting a client auto-fills their details into the invoice. User can still edit the details for that specific invoice without changing the saved client record.

---

## 9. Templates

Ship 20 templates at launch. Each template is an HTML/CSS layout that receives the invoice data object and renders it. Templates are **not** drag-and-drop editors — they are fixed beautiful layouts that the user's data flows into.

**Template categories (name and style):**

| # | Name | Style description |
|---|---|---|
| 1 | Clean | Pure white, minimal, thin lines |
| 2 | Classic | Traditional, serif headings, formal |
| 3 | Modern | Bold header bar, sans-serif |
| 4 | Slate | Dark header, white content area |
| 5 | Soft | Light grey background, rounded elements |
| 6 | Bold | Large typography, strong colour accent |
| 7 | Compact | Dense, fits lots of line items cleanly |
| 8 | Elegant | Thin fonts, lots of whitespace |
| 9 | Stripe-style | Inspired by Stripe's invoice design |
| 10 | Simple | Plain, no-frills, maximum compatibility |
| 11 | Creative | Coloured sidebar, modern layout |
| 12 | Studio | Left-aligned, portfolio-style |
| 13 | Consulting | Professional services layout |
| 14 | Agency | Two-column header, clean body |
| 15 | Freelancer | Warm tones, personal feel |
| 16 | Retail | Product-focused, good for items with images |
| 17 | Tech | Dark accent, code-inspired feel |
| 18 | Minimal Pro | Ultra-minimal, just the numbers |
| 19 | Professional | Standard corporate, universally accepted |
| 20 | Custom (Canva) | User uploads their own design as a base |

**Canva import (template #20):**
- User uploads a PNG or PDF of their Canva design.
- App stores it as a background image in Supabase Storage.
- Invoice data fields are positioned over the image using an overlay form.
- This is an advanced feature — can be shipped in v1.1 if needed.

**Template picker UI:**
- Grid of cards showing a thumbnail preview of each template.
- Click to select, then click "Use this template" to proceed to the form.
- Search/filter by style (Minimal, Classic, Modern, etc.) — simple filter pills.

---

## 10. Invoice form + live preview

This is the most important screen. The layout should be **two-column on desktop** (form on the left, live preview on the right). On mobile, the preview is below the form or accessible via a "Preview" tab.

### Form sections (in order):

**Section A — From (your business)**
- All fields auto-filled from business profile
- Logo shown with option to change for this invoice
- All fields editable inline

**Section B — Bill to (client)**
- Client search dropdown — type to filter saved clients
- When a client is selected, fields auto-fill
- Fields: Client name, company, email, phone, address
- All editable for this invoice

**Section C — Invoice details**
- Invoice number (auto-incremented, editable, e.g. INV-001)
- Issue date (date picker, defaults to today)
- Due date (date picker, defaults to 30 days from today)
- Currency (dropdown, defaults to user's default currency)
- PO number (text, optional)

**Section D — Line items**
- Table with rows: Description | Qty | Unit price | Tax % | Total
- "Add item" button adds a new row
- Each row has a delete button
- Subtotal, tax total, and grand total auto-calculate at the bottom
- Discount field (optional, flat amount or %) — can be toggled on/off

**Section E — Notes and payment info**
- Notes (textarea, auto-filled from default notes, editable)
- Payment instructions (textarea, auto-filled from profile, editable)

### Live preview:
- Renders the selected template with the live form data
- Updates in real time as the user types
- On desktop: fixed right column, full invoice visible with scroll
- On mobile: "Preview" button opens a modal or slides the preview up

### Save behaviour:
- Invoice auto-saves as a draft as the user types (debounced, every 2 seconds)
- "Save & download PDF" — saves invoice and triggers PDF download
- "Save & send email" — saves invoice, opens email modal
- "Save draft" — saves without downloading

---

## 11. PDF generation

Use `react-pdf` (the `@react-pdf/renderer` library) for generating PDFs client-side. Each template has a corresponding React PDF component.

**Requirements:**
- PDF must look identical to the on-screen preview
- All fonts must be embedded (use Google Fonts via react-pdf font registration)
- Include the business logo if uploaded
- Page size: A4 by default, with US Letter as an option in settings
- File name format: `INV-[number]-[client-name].pdf` (e.g. `INV-047-Acme-Corp.pdf`)
- PDF must work perfectly on both mobile and desktop

**Fallback:** If react-pdf cannot match the template design, use a Puppeteer-based server route (`/api/generate-pdf`) that headless-renders the invoice HTML and returns a PDF. This is more reliable for complex templates.

---

## 12. Email sending (Resend)

When the user clicks "Send email":

1. A modal opens with fields:
   - **To:** (pre-filled from client email, editable)
   - **CC:** (optional, pre-filled with user's own email)
   - **Subject:** (pre-filled: `Invoice INV-047 from [Business Name]`, editable)
   - **Message:** (textarea, pre-filled with a simple default message, editable)
2. User clicks "Send invoice"
3. App calls `/api/send-invoice` (Next.js API route)
4. The route generates the PDF (server-side) and sends it via Resend
5. Email is sent from `invoices@invoiceforge.app` (configure custom domain in Resend)
6. Invoice status is updated to "Sent"
7. Modal closes with a success toast

**Default email message (pre-filled, editable):**
```
Hi [Client Name],

Please find your invoice INV-047 attached for the amount of [Amount].

Payment is due by [Due Date].

[Payment Instructions]

Thank you,
[Your Name]
[Business Name]
```

**Resend setup:**
- Create account at resend.com
- Add domain and verify DNS
- Store API key in `.env.local` as `RESEND_API_KEY`
- Free tier: 3,000 emails/month — sufficient for launch

---

## 13. Invoice history (`/dashboard`)

The dashboard is the first screen after login. It is the invoice list.

**Layout:**
- Header: "Your invoices" + "New invoice" button (prominent, top right)
- Search bar: search by client name, invoice number, or amount
- Filter pills: All | Draft | Sent | Paid | Overdue
- Sort: by date (default, newest first), by amount, by client name

**Each invoice row shows:**
```
Invoice #  |  Client name  |  Amount  |  Date  |  Status  |  Actions
```

**Status badges:**
- Draft — grey
- Sent — blue
- Paid — green
- Overdue — red (auto-set when due date passes and status is still Sent)

**Actions per invoice (three-dot menu or inline icons):**
- Download PDF
- Send email
- Duplicate (creates a new invoice pre-filled with same data, new number and today's date)
- Mark as paid
- Edit
- Delete (with confirmation)

**Summary cards at the top of dashboard (simple, no charts):**
- Total invoices sent this month
- Total amount invoiced this month
- Total unpaid
- Total overdue

---

## 14. Database schema (Supabase / Postgres)

### Table: `profiles`
```sql
id            uuid references auth.users primary key
business_name text not null
contact_name  text
email         text not null
phone         text
address       text
city          text
state         text
postcode      text
country       text not null default 'US'
logo_url      text
currency      text not null default 'USD'
tax_label     text default 'Tax'
tax_rate      numeric(5,2) default 0
payment_info  text
default_notes text
created_at    timestamptz default now()
updated_at    timestamptz default now()
```

### Table: `clients`
```sql
id            uuid primary key default gen_random_uuid()
user_id       uuid references auth.users not null
name          text not null
email         text
phone         text
company       text
address       text
notes         text
created_at    timestamptz default now()
updated_at    timestamptz default now()
```

### Table: `invoices`
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references auth.users not null
client_id       uuid references clients
invoice_number  text not null
status          text not null default 'draft'
-- check: status in ('draft', 'sent', 'paid', 'overdue')

issue_date      date not null default current_date
due_date        date
currency        text not null default 'USD'
po_number       text

from_name       text
from_email      text
from_phone      text
from_address    text
from_logo_url   text

to_name         text
to_email        text
to_phone        text
to_company      text
to_address      text

subtotal        numeric(12,2) not null default 0
tax_amount      numeric(12,2) not null default 0
discount_amount numeric(12,2) not null default 0
total           numeric(12,2) not null default 0

notes           text
payment_info    text
template_id     text not null default 'clean'

created_at      timestamptz default now()
updated_at      timestamptz default now()
```

### Table: `invoice_items`
```sql
id           uuid primary key default gen_random_uuid()
invoice_id   uuid references invoices on delete cascade not null
sort_order   integer not null default 0
description  text not null
quantity     numeric(10,2) not null default 1
unit_price   numeric(12,2) not null default 0
tax_rate     numeric(5,2) default 0
total        numeric(12,2) not null default 0
```

### Row Level Security (RLS)

Enable RLS on all tables. Policy pattern for every table:

```sql
-- Enable RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Users can only see and modify their own data
create policy "own data only" on profiles
  for all using (auth.uid() = id);

create policy "own data only" on clients
  for all using (auth.uid() = user_id);

create policy "own data only" on invoices
  for all using (auth.uid() = user_id);

create policy "own invoice items only" on invoice_items
  for all using (
    invoice_id in (
      select id from invoices where user_id = auth.uid()
    )
  );
```

### Auto-increment invoice numbers

Store the last invoice number per user in the `profiles` table or a separate counter. When a new invoice is created, the server generates the next number in the sequence as `INV-001`, `INV-002`, etc. Users can override the number in the form. The prefix (`INV`) should be configurable in settings.

---

## 15. Currency support

Support all major world currencies. Store the ISO 4217 code (e.g. `USD`, `EUR`, `GBP`). Format amounts using the browser's `Intl.NumberFormat` with the appropriate locale.

**Minimum currencies to support at launch:**

USD, EUR, GBP, CAD, AUD, NZD, CHF, JPY, CNY, INR, BRL, MXN, ZAR, SGD, HKD, SEK, NOK, DKK, PLN, CZK, HUF, RON, TRY, AED, SAR, QAR, KWD, MYR, THB, IDR, PHP, VND, KRW, NGN, KES, GHS, EGP, PKR, BDT, LKR, NPR, ILS, ARS, COP, PEN, CLP

Show currency symbol on all amounts. No currency conversion — just display.

---

## 16. Invoice number format

Default format: `INV-001`  
The prefix is configurable (e.g. user could change `INV` to their initials `JD`).  
Number auto-increments per user (not globally).  
New invoice number = (highest existing number for this user) + 1.  
User can override the number in the form — no validation that it is unique (just a warning if duplicate detected).

---

## 17. Environment variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://invoiceforge.app
FROM_EMAIL=invoices@invoiceforge.app
FROM_NAME=InvoiceForge
```

Never commit `.env.local` to GitHub. Add it to `.gitignore`. Add all variables to Vercel environment settings.

---

## 18. Project file structure

```
invoiceforge/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← protected layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/
│   │   │   ├── new/page.tsx        ← template picker
│   │   │   ├── new/[templateId]/page.tsx  ← invoice form
│   │   │   └── [id]/page.tsx       ← view invoice
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   ├── onboarding/page.tsx
│   ├── api/
│   │   ├── send-invoice/route.ts
│   │   └── generate-pdf/route.ts
│   ├── layout.tsx
│   └── page.tsx                    ← landing page
├── components/
│   ├── ui/                         ← base UI components (button, input, modal, etc.)
│   ├── invoice/
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoicePreview.tsx
│   │   ├── LineItemsTable.tsx
│   │   └── EmailModal.tsx
│   ├── templates/
│   │   ├── TemplateGrid.tsx
│   │   ├── TemplatePicker.tsx
│   │   └── pdf/
│   │       ├── CleanTemplate.tsx
│   │       ├── ClassicTemplate.tsx
│   │       └── ... (one file per template)
│   ├── dashboard/
│   │   ├── InvoiceTable.tsx
│   │   ├── InvoiceRow.tsx
│   │   └── SummaryCards.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── MobileNav.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── resend.ts
│   ├── pdf.ts
│   ├── invoice-number.ts
│   └── currencies.ts
├── types/
│   └── index.ts                    ← all TypeScript types
├── hooks/
│   ├── useInvoice.ts
│   ├── useClients.ts
│   └── useProfile.ts
├── middleware.ts                   ← auth guard
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 19. Key TypeScript types

```typescript
// types/index.ts

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Profile {
  id: string;
  business_name: string;
  contact_name?: string;
  email: string;
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
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
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
  client_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  currency: string;
  po_number?: string;
  from_name?: string;
  from_email?: string;
  from_phone?: string;
  from_address?: string;
  from_logo_url?: string;
  to_name?: string;
  to_email?: string;
  to_phone?: string;
  to_company?: string;
  to_address?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  payment_info?: string;
  template_id: string;
  items: InvoiceItem[];
}

export interface Template {
  id: string;
  name: string;
  category: 'minimal' | 'classic' | 'modern' | 'creative';
  description: string;
  thumbnail: string;
}
```

---

## 20. API routes

### `POST /api/send-invoice`

Request body:
```json
{
  "invoiceId": "uuid",
  "to": "client@example.com",
  "cc": "me@example.com",
  "subject": "Invoice INV-047 from Acme",
  "message": "Hi John, please find your invoice attached..."
}
```

Steps:
1. Authenticate the request (check Supabase session)
2. Fetch the invoice + items from DB (verify it belongs to the user)
3. Generate PDF using Puppeteer (render `/invoices/[id]/print` as headless browser)
4. Send via Resend with PDF as attachment
5. Update invoice status to `sent` in DB
6. Return `{ success: true }`

### `GET /api/generate-pdf?invoiceId=[id]`

1. Authenticate the request
2. Fetch invoice data
3. Render invoice HTML to PDF using Puppeteer
4. Return PDF as `application/pdf` with appropriate filename

---

## 21. Supabase storage setup

Bucket: `logos`
- Public bucket (logos are shown on invoices and emails)
- Max file size: 5MB
- Allowed types: image/png, image/jpeg, image/webp, image/svg+xml
- Path pattern: `logos/{user_id}/{filename}`

On upload, store the public URL in `profiles.logo_url`.

---

## 22. Build order (recommended)

**Week 1 — Foundation**
- [ ] Initialize Next.js 14 project with TypeScript and Tailwind
- [ ] Set up Supabase project, run schema SQL, enable RLS
- [ ] Set up GitHub repo, connect to Vercel
- [ ] Auth: Google OAuth + magic link login/logout
- [ ] Middleware: protect app routes, redirect to /login
- [ ] Onboarding page: business profile form, save to `profiles`
- [ ] Settings page: edit business profile, logo upload to Supabase Storage

**Week 2 — Core invoice flow**
- [ ] Template picker page: grid of 20 templates with thumbnails
- [ ] Invoice form page: all sections A–E, live preview panel
- [ ] Line items table: add/remove rows, auto-calculate totals
- [ ] Client dropdown: search and select from saved clients
- [ ] Auto-save draft every 2 seconds (debounced)
- [ ] PDF download using react-pdf (start with 3 templates, expand to all 20)

**Week 3 — Memory and history**
- [ ] Dashboard: invoice list with search, filter, sort
- [ ] Status badges and auto-overdue detection
- [ ] Invoice actions: duplicate, mark paid, delete
- [ ] Client book: list, add, edit, delete, view client invoices
- [ ] Invoice number auto-increment logic

**Week 4 — Email and polish**
- [ ] Resend integration: `/api/send-invoice` route
- [ ] Email modal in invoice form
- [ ] Remaining 17 PDF templates
- [ ] Mobile responsive layout (form + preview as tabs on mobile)
- [ ] Error handling, loading states, toast notifications
- [ ] Empty states (no invoices yet, no clients yet)
- [ ] Final testing across browsers and devices
- [ ] Deploy to production on Vercel

**Post-launch (v1.1)**
- [ ] Canva import (template #20)
- [ ] Share link (public view-only invoice URL)
- [ ] Invoice CSV export
- [ ] Duplicate invoice shortcut from dashboard
- [ ] Print view (CSS print stylesheet)

---

## 23. Design principles

- **White space is your friend.** The app should feel calm and uncluttered.
- **One action per screen.** Never show the user more than one thing to do at a time.
- **No modals for critical actions.** Editing, saving, and creating should happen on a full page. Modals are only for confirmations and the email sender.
- **Mobile first.** The PDF preview can be below the form on mobile. All buttons must be thumb-sized (min 44px tap target).
- **Colour palette:** One accent colour only (a clean blue, e.g. `#2563EB`). Grey for UI chrome. White for surfaces. Green/red/orange for status badges only.
- **Font:** Inter or Geist (Next.js default). Clean, professional, worldwide-readable.
- **No illustrations, no mascots, no decorations.** The invoice itself is the product.

---

## 24. What NOT to build

Do not build any of the following. They are out of scope for v1.0:

- AI features of any kind
- Recurring invoices (v2)
- Payment links or Stripe integration (v2)
- Multi-user teams or workspaces (v2)
- A mobile app (the web app must be mobile-responsive, but no native app)
- Expense tracking
- Time tracking
- CRM features beyond the basic client book
- Dark mode (nice to have, not required for v1)
- Multi-language UI (the app UI is English only; invoice content is whatever the user types)

---

## 25. Definition of done

The product is ready to launch when:

- [ ] A new user can sign up, set up their business, create an invoice, and download a PDF in under 5 minutes
- [ ] All saved data persists correctly across sessions and devices
- [ ] Selecting a saved client auto-fills all their details on the invoice form
- [ ] Invoice history shows all past invoices with correct status
- [ ] Email sending works reliably — client receives the PDF attachment
- [ ] All 20 templates render correctly in the preview and PDF
- [ ] The app works correctly on Chrome, Firefox, Safari, and Edge
- [ ] The app is usable on a phone (iOS Safari and Android Chrome)
- [ ] No Supabase data is accessible across users (RLS verified)
- [ ] PDF filename is correctly formatted
- [ ] App is deployed and live on Vercel with a custom domain

---

## 26. Questions to answer before starting

1. What is the custom domain? (e.g. `invoiceforge.app`) — needed for Resend DNS setup and Supabase redirect URLs.
2. Is the codebase open source (GitHub public) or private?
3. What is the sender email address for invoices? (e.g. `invoices@invoiceforge.app`)
4. Should the app support right-to-left languages (Arabic, Hebrew) in v1, or is that v2?
5. Which Supabase region should the database be in? (Choose closest to your primary user base — e.g. `us-east-1` or `eu-west-1` for global reach.)

---

*End of developer brief. All questions → reply to this document or open a GitHub issue.*
