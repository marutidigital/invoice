/**
 * lib/invoice-renderer.tsx
 * 6 visually distinct invoice layout renderers.
 * Each receives the same InvoiceRenderProps and produces a unique visual design.
 */

import type { InvoiceCustomization } from '@/components/invoice/InvoiceCustomizer'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

export interface InvoiceRenderProps {
  from: { name: string; email: string; phone: string; address: string; logo_url: string }
  to: { name: string; company: string; email: string; phone: string; address: string }
  details: { invoice_number: string; issue_date: string; due_date: string; currency: string; po_number: string }
  items: LineItem[]
  subtotal: number
  taxTotal: number
  discountAmount: number
  grandTotal: number
  notes: string
  paymentInfo: string
  fmt: (n: number) => string
  accent: string
  customization: InvoiceCustomization
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function TotalsBlock({ subtotal, taxTotal, discountAmount, grandTotal, fmt, accent, textColor }: {
  subtotal: number; taxTotal: number; discountAmount: number; grandTotal: number
  fmt: (n: number) => string; accent: string; textColor: string
}) {
  return (
    <div className="ml-auto w-52 space-y-1 text-xs">
      <div className="flex justify-between" style={{ color: textColor + 'aa' }}>
        <span>Subtotal</span><span>{fmt(subtotal)}</span>
      </div>
      {taxTotal > 0 && (
        <div className="flex justify-between" style={{ color: textColor + 'aa' }}>
          <span>Tax</span><span>{fmt(taxTotal)}</span>
        </div>
      )}
      {discountAmount > 0 && (
        <div className="flex justify-between" style={{ color: textColor + 'aa' }}>
          <span>Discount</span><span>-{fmt(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-sm border-t pt-2 mt-1" style={{ borderColor: accent + '40', color: accent }}>
        <span>Total Due</span><span>{fmt(grandTotal)}</span>
      </div>
    </div>
  )
}

function ItemsTable({ items, fmt, accent, textColor, tableStyle, tableHeaderBg, tableStripeBg }: {
  items: LineItem[]
  fmt: (n: number) => string
  accent: string
  textColor: string
  tableStyle: string
  tableHeaderBg: string
  tableStripeBg: string
}) {
  const filtered = items.filter((i) => i.description || i.unit_price > 0)
  return (
    <table className="w-full text-xs">
      <thead>
        <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `2px solid ${accent}30` }}>
          <th className="text-left py-2 pr-2 font-bold uppercase tracking-wide text-[9px]" style={{ color: accent }}>Description</th>
          <th className="text-right py-2 px-2 font-bold uppercase tracking-wide text-[9px]" style={{ color: accent }}>Qty</th>
          <th className="text-right py-2 px-2 font-bold uppercase tracking-wide text-[9px]" style={{ color: accent }}>Price</th>
          <th className="text-right py-2 font-bold uppercase tracking-wide text-[9px]" style={{ color: accent }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((item, idx) => (
          <tr
            key={item.id}
            style={{
              backgroundColor: tableStyle === 'striped' && idx % 2 === 1 ? tableStripeBg : 'transparent',
              borderBottom: tableStyle !== 'minimal' ? `1px solid ${accent}10` : 'none',
              color: textColor,
            }}
          >
            <td className="py-2 pr-2">{item.description || '—'}</td>
            <td className="py-2 px-2 text-right opacity-70">{item.quantity}</td>
            <td className="py-2 px-2 text-right opacity-70">{fmt(item.unit_price)}</td>
            <td className="py-2 text-right font-semibold">{fmt(item.quantity * item.unit_price)}</td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr><td colSpan={4} className="py-4 text-center opacity-30 text-xs">No items yet</td></tr>
        )}
      </tbody>
    </table>
  )
}

function Logo({ url, position, size = 'h-10' }: { url: string; position?: string; size?: string }) {
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Logo" className={`${size} max-w-[140px] object-contain ${position}`} />
}

function NotesRow({ notes, paymentInfo, accent, textColor }: {
  notes: string; paymentInfo: string; accent: string; textColor: string
}) {
  if (!notes && !paymentInfo) return null
  return (
    <div className="grid grid-cols-2 gap-6 text-xs" style={{ color: textColor }}>
      {notes && (
        <div>
          <p className="font-bold uppercase tracking-widest text-[9px] mb-1.5 opacity-50">Notes</p>
          <p className="opacity-75 leading-relaxed">{notes}</p>
        </div>
      )}
      {paymentInfo && (
        <div>
          <p className="font-bold uppercase tracking-widest text-[9px] mb-1.5 opacity-50">Payment details</p>
          <p className="opacity-75 whitespace-pre-line leading-relaxed">{paymentInfo}</p>
        </div>
      )}
    </div>
  )
}

function Watermark({ text, color }: { text: string; color: string }) {
  if (!text) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 select-none rotate-[-25deg]">
      <span className="text-5xl font-black tracking-widest opacity-10" style={{ color }}>{text}</span>
    </div>
  )
}

function SignatureLine({ show, color }: { show: boolean; color: string }) {
  if (!show) return null
  return (
    <div className="flex justify-end mt-6">
      <div className="text-center">
        <div className="w-36 border-t border-dashed mt-10 mb-1" style={{ borderColor: color + '50' }} />
        <p className="text-[9px] opacity-40 uppercase tracking-wide">Authorised Signature</p>
      </div>
    </div>
  )
}

function FooterSection({ text, imageUrl, bg, accent }: { text: string; imageUrl: string; bg: string; accent: string }) {
  if (!text && !imageUrl) return null
  return (
    <div className="px-6 py-3 text-center space-y-1.5" style={{ backgroundColor: bg, borderTop: `1px solid ${accent}20` }}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="footer" className="h-8 mx-auto object-contain" />
      )}
      {text && <p className="text-[10px] opacity-60 leading-relaxed">{text}</p>}
    </div>
  )
}

// ─── LAYOUT 1: SPLIT (Classic two-column header) ──────────────────────────────
export function LayoutSplit(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: c.backgroundColor, color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />
      {c.showTopBorder && <div style={{ height: `${c.borderWidth}px`, backgroundColor: accent }} />}

      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <Logo url={p.from.logo_url} />
            <p className="text-xl font-bold mt-2" style={{ color: accent }}>{p.from.name || 'Your Business'}</p>
            {p.from.email && <p className="text-xs opacity-60 mt-0.5">{p.from.email}</p>}
            {p.from.phone && <p className="text-xs opacity-60">{p.from.phone}</p>}
            {p.from.address && <p className="text-xs opacity-60 mt-1 max-w-[200px]">{p.from.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tracking-tight" style={{ color: c.headingColor }}>INVOICE</p>
            <p className="text-base font-bold mt-1" style={{ color: accent }}>{p.details.invoice_number}</p>
            <div className="mt-3 space-y-0.5 text-xs opacity-60">
              <p>Issued: {p.details.issue_date}</p>
              {p.details.due_date && <p>Due: <span className="font-semibold">{p.details.due_date}</span></p>}
              {p.details.po_number && <p>PO: {p.details.po_number}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bill to */}
      <div className="px-8 py-4 mx-8 mb-6 rounded-xl text-xs" style={{ backgroundColor: c.tableHeaderBg }}>
        <p className="font-bold uppercase tracking-widest text-[9px] mb-1.5 opacity-50">Bill to</p>
        <p className="font-bold text-sm" style={{ color: c.headingColor }}>{p.to.name || '—'}</p>
        {p.to.company && <p className="opacity-70">{p.to.company}</p>}
        {p.to.email && <p className="opacity-60">{p.to.email}</p>}
        {p.to.address && <p className="opacity-60 mt-0.5">{p.to.address}</p>}
      </div>

      {/* Items */}
      <div className="px-8 pb-4">
        <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
        </div>
      </div>

      {/* Notes + Signature */}
      {(p.notes || p.paymentInfo) && (
        <div className="px-8 py-4 border-t" style={{ borderColor: accent + '15' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color={c.textColor} />

      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      {!c.footerText && !c.footerImageUrl && (
        <p className="text-center text-[9px] py-3 opacity-30" style={{ borderTop: `1px solid ${accent}15` }}>Generated with ProInvoice · proinvoice.shop</p>
      )}
    </div>
  )
}

// ─── LAYOUT 2: BAR (Full-width coloured header) ───────────────────────────────
export function LayoutBar(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  const logoPos = c.logoPosition
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: c.backgroundColor, color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Full-width coloured header */}
      <div className="px-8 py-7" style={{ backgroundColor: accent }}>
        <div className={`flex items-center justify-between ${logoPos === 'right' ? 'flex-row-reverse' : ''}`}>
          <div className={logoPos === 'center' ? 'flex flex-col items-center w-full' : ''}>
            <Logo url={p.from.logo_url} size="h-12" />
            <p className="text-xl font-black text-white mt-1">{p.from.name || 'Your Business'}</p>
            <p className="text-xs text-white/70 mt-0.5">{p.from.email}</p>
          </div>
          {logoPos !== 'center' && (
            <div className="text-right text-white">
              <p className="text-3xl font-black tracking-tight opacity-90">INVOICE</p>
              <p className="text-sm font-bold opacity-70 mt-1">{p.details.invoice_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info band */}
      <div className="grid grid-cols-3 text-xs py-3 px-8 border-b" style={{ backgroundColor: accent + '12', borderColor: accent + '20' }}>
        <div><p className="opacity-40 uppercase tracking-wide text-[9px]">Bill to</p><p className="font-bold mt-0.5" style={{ color: c.headingColor }}>{p.to.name || '—'}</p>{p.to.company && <p className="opacity-60">{p.to.company}</p>}</div>
        <div><p className="opacity-40 uppercase tracking-wide text-[9px]">Issue date</p><p className="font-semibold mt-0.5">{p.details.issue_date}</p></div>
        <div className="text-right"><p className="opacity-40 uppercase tracking-wide text-[9px]">Due date</p><p className="font-bold mt-0.5" style={{ color: accent }}>{p.details.due_date || '—'}</p>{p.details.invoice_number && <p className="opacity-50">#{p.details.invoice_number}</p>}</div>
      </div>

      {/* Items */}
      <div className="px-8 py-5">
        <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
        </div>
      </div>

      {(p.notes || p.paymentInfo) && (
        <div className="px-8 py-4 border-t" style={{ borderColor: accent + '15' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color={c.textColor} />
      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      {!c.footerText && !c.footerImageUrl && (
        <p className="text-center text-[9px] py-3 opacity-30">Generated with ProInvoice · proinvoice.shop</p>
      )}
    </div>
  )
}

// ─── LAYOUT 3: DARK (Dark header, white text) ─────────────────────────────────
export function LayoutDark(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  const darkHeader = c.backgroundColor === '#ffffff' ? '#0f172a' : c.backgroundColor
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#f8fafc', color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Dark header */}
      <div className="px-8 py-8" style={{ backgroundColor: darkHeader }}>
        <div className="flex justify-between items-start">
          <div>
            <Logo url={p.from.logo_url} size="h-10" />
            <p className="text-2xl font-black text-white mt-2">{p.from.name || 'Your Business'}</p>
            <p className="text-xs text-white/50 mt-1">{p.from.email}</p>
            <p className="text-xs text-white/50">{p.from.phone}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: accent, color: '#fff' }}>INVOICE</span>
            <p className="text-2xl font-black text-white mt-2">{p.details.invoice_number}</p>
            <p className="text-xs text-white/40 mt-1">Issued {p.details.issue_date}</p>
            {p.details.due_date && <p className="text-xs text-white/60">Due <span className="text-white font-semibold">{p.details.due_date}</span></p>}
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div style={{ height: '4px', backgroundColor: accent }} />

      {/* Bill to card */}
      <div className="px-8 py-5 bg-white">
        <div className="flex gap-8">
          <div className="flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Bill to</p>
            <p className="font-bold text-sm" style={{ color: c.headingColor }}>{p.to.name || '—'}</p>
            {p.to.company && <p className="text-xs opacity-60">{p.to.company}</p>}
            {p.to.email && <p className="text-xs opacity-50">{p.to.email}</p>}
            {p.to.address && <p className="text-xs opacity-50 mt-0.5">{p.to.address}</p>}
          </div>
          {p.from.address && (
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">From</p>
              <p className="text-xs opacity-60 leading-relaxed">{p.from.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-8 pb-5 bg-white">
        <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
        </div>
      </div>

      {(p.notes || p.paymentInfo) && (
        <div className="px-8 py-4 bg-white border-t" style={{ borderColor: accent + '15' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color={c.textColor} />
      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      {!c.footerText && !c.footerImageUrl && (
        <p className="text-center text-[9px] py-3 opacity-30">Generated with ProInvoice · proinvoice.shop</p>
      )}
    </div>
  )
}

// ─── LAYOUT 4: SIDEBAR (Left sidebar with company info) ───────────────────────
export function LayoutSidebar(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  return (
    <div className="relative overflow-hidden flex min-h-[600px]" style={{ backgroundColor: c.backgroundColor, color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Sidebar */}
      <div className="w-44 shrink-0 flex flex-col py-8 px-5" style={{ backgroundColor: accent }}>
        <Logo url={p.from.logo_url} size="h-8 max-w-[100px]" />
        <p className="text-sm font-black text-white mt-3 leading-tight">{p.from.name || 'Your Business'}</p>
        <div className="w-8 h-0.5 bg-white/30 mt-3 mb-3" />
        {p.from.email && <p className="text-[9px] text-white/60 break-all leading-relaxed">{p.from.email}</p>}
        {p.from.phone && <p className="text-[9px] text-white/60 mt-1">{p.from.phone}</p>}
        {p.from.address && <p className="text-[9px] text-white/50 mt-2 leading-relaxed">{p.from.address}</p>}

        <div className="mt-auto pt-6">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mb-1">Bill to</p>
          <p className="text-xs font-bold text-white">{p.to.name || '—'}</p>
          {p.to.company && <p className="text-[9px] text-white/60 mt-0.5">{p.to.company}</p>}
          {p.to.email && <p className="text-[9px] text-white/50 mt-0.5 break-all">{p.to.email}</p>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Invoice header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-start">
          <div>
            <p className="text-3xl font-black tracking-tight" style={{ color: c.headingColor }}>INVOICE</p>
            <p className="font-bold text-base mt-0.5" style={{ color: accent }}>{p.details.invoice_number}</p>
          </div>
          <div className="text-right text-xs opacity-60 space-y-0.5">
            <p>Issued: <span className="font-semibold">{p.details.issue_date}</span></p>
            {p.details.due_date && <p>Due: <span className="font-semibold" style={{ color: accent }}>{p.details.due_date}</span></p>}
            {p.details.po_number && <p>PO: {p.details.po_number}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="px-6 flex-1">
          <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
          <div className="mt-4">
            <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
          </div>
        </div>

        {(p.notes || p.paymentInfo) && (
          <div className="px-6 py-4 border-t" style={{ borderColor: accent + '15' }}>
            <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
          </div>
        )}
        <SignatureLine show={c.showSignatureLine} color={c.textColor} />
        <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      </div>
    </div>
  )
}

// ─── LAYOUT 5: CENTERED (Logo + name centered, formal) ────────────────────────
export function LayoutCentered(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: c.backgroundColor, color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />
      {c.showTopBorder && <div style={{ height: `${c.borderWidth}px`, backgroundColor: accent }} />}

      {/* Centered header */}
      <div className="text-center pt-8 pb-6 px-8 border-b" style={{ borderColor: accent + '20' }}>
        <Logo url={p.from.logo_url} position="mx-auto mb-3" />
        <p className="text-2xl font-black" style={{ color: accent }}>{p.from.name || 'Your Business'}</p>
        <p className="text-xs opacity-50 mt-0.5">{[p.from.email, p.from.phone].filter(Boolean).join(' · ')}</p>
        {p.from.address && <p className="text-xs opacity-40 mt-0.5">{p.from.address}</p>}
      </div>

      {/* Invoice title */}
      <div className="text-center py-5">
        <p className="text-xl font-black tracking-widest uppercase" style={{ color: c.headingColor }}>Tax Invoice</p>
        <p className="text-sm font-semibold mt-1" style={{ color: accent }}>{p.details.invoice_number}</p>
      </div>

      {/* Bill to + dates — two columns */}
      <div className="grid grid-cols-2 gap-4 px-8 pb-5 text-xs">
        <div className="rounded-xl p-4" style={{ backgroundColor: c.tableHeaderBg }}>
          <p className="font-bold uppercase tracking-widest text-[9px] opacity-40 mb-1.5">Bill to</p>
          <p className="font-bold text-sm" style={{ color: c.headingColor }}>{p.to.name || '—'}</p>
          {p.to.company && <p className="opacity-60">{p.to.company}</p>}
          {p.to.email && <p className="opacity-50 mt-0.5">{p.to.email}</p>}
          {p.to.address && <p className="opacity-40 mt-0.5">{p.to.address}</p>}
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: c.tableHeaderBg }}>
          <p className="font-bold uppercase tracking-widest text-[9px] opacity-40 mb-1.5">Invoice details</p>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="opacity-50">Issue date</span><span className="font-semibold">{p.details.issue_date}</span></div>
            {p.details.due_date && <div className="flex justify-between"><span className="opacity-50">Due date</span><span className="font-semibold" style={{ color: accent }}>{p.details.due_date}</span></div>}
            {p.details.po_number && <div className="flex justify-between"><span className="opacity-50">PO#</span><span>{p.details.po_number}</span></div>}
            <div className="flex justify-between"><span className="opacity-50">Currency</span><span>{p.details.currency}</span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-8 pb-5">
        <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
        </div>
      </div>

      {(p.notes || p.paymentInfo) && (
        <div className="px-8 py-4 border-t" style={{ borderColor: accent + '15' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color={c.textColor} />
      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      {!c.footerText && !c.footerImageUrl && (
        <p className="text-center text-[9px] py-3 opacity-30 border-t" style={{ borderColor: accent + '10' }}>Generated with ProInvoice · proinvoice.shop</p>
      )}
    </div>
  )
}

// ─── LAYOUT 6: BORDERED (Minimal, thin accent line) ───────────────────────────
export function LayoutBordered(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily}, sans-serif`
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: c.backgroundColor, color: c.textColor, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />

      <div className="pl-8 pr-8 pt-8 pb-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Logo url={p.from.logo_url} />
            <p className="font-black text-2xl mt-2" style={{ color: c.headingColor }}>{p.from.name || 'Your Business'}</p>
            <p className="text-xs opacity-50 mt-0.5">{p.from.email}</p>
            {p.from.phone && <p className="text-xs opacity-50">{p.from.phone}</p>}
            {p.from.address && <p className="text-xs opacity-40 mt-1 max-w-[180px] leading-relaxed">{p.from.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest opacity-30">Invoice</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: accent }}>{p.details.invoice_number}</p>
            <p className="text-xs opacity-40 mt-2">Issued: {p.details.issue_date}</p>
            {p.details.due_date && <p className="text-xs mt-0.5">Due: <span className="font-semibold" style={{ color: accent }}>{p.details.due_date}</span></p>}
          </div>
        </div>

        {/* Bill to strip */}
        <div className="py-3 px-4 mb-5 rounded-lg border-l-4 text-xs" style={{ borderColor: accent, backgroundColor: accent + '08' }}>
          <p className="font-bold uppercase tracking-widest text-[9px] opacity-40 mb-1">Billed to</p>
          <p className="font-bold" style={{ color: c.headingColor }}>{p.to.name || '—'}</p>
          {p.to.company && <span className="opacity-60 mr-2">{p.to.company}</span>}
          {p.to.email && <span className="opacity-50">{p.to.email}</span>}
        </div>

        {/* Items */}
        <ItemsTable items={p.items} fmt={p.fmt} accent={accent} textColor={c.textColor} tableStyle={c.tableStyle} tableHeaderBg={c.tableHeaderBg} tableStripeBg={c.tableStripeBg} />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={accent} textColor={c.textColor} />
        </div>

        {(p.notes || p.paymentInfo) && (
          <div className="pt-4 mt-4 border-t" style={{ borderColor: accent + '15' }}>
            <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={accent} textColor={c.textColor} />
          </div>
        )}
        <SignatureLine show={c.showSignatureLine} color={c.textColor} />
      </div>

      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={accent} />
      {!c.footerText && !c.footerImageUrl && (
        <p className="text-center text-[9px] py-3 opacity-30 border-t" style={{ borderColor: accent + '10' }}>Generated with ProInvoice · proinvoice.shop</p>
      )}
    </div>
  )
}


// ─── LAYOUT 7: LEGAL (Formal document style — law firms, solicitors) ──────────
export function LayoutLegal(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = c.fontFamily !== 'Inter' ? `${c.fontFamily}, serif` : 'Georgia, "Times New Roman", serif'
  const navy = '#0f2044'
  const gold = accent

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#fefefe', color: '#1a1a1a', fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Top double border */}
      <div style={{ height: '6px', backgroundColor: navy }} />
      <div style={{ height: '2px', backgroundColor: gold }} />

      {/* Header — law firm style */}
      <div className="px-10 pt-7 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <Logo url={p.from.logo_url} size="h-10 max-w-[120px]" />
            <p className="text-xl font-black mt-2 tracking-tight uppercase" style={{ color: navy }}>{p.from.name || 'Your Firm'}</p>
            <p className="text-[10px] tracking-widest uppercase opacity-50 mt-0.5">Solicitors &amp; Legal Advisors</p>
            <div className="text-xs mt-2 space-y-0.5 opacity-60">
              {p.from.email && <p>{p.from.email}</p>}
              {p.from.phone && <p>{p.from.phone}</p>}
              {p.from.address && <p className="max-w-[180px] leading-snug">{p.from.address}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 px-4 py-2" style={{ borderColor: navy }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: navy }}>Tax Invoice</p>
              <p className="text-xl font-black mt-0.5" style={{ color: gold }}>{p.details.invoice_number}</p>
            </div>
            <div className="mt-3 text-xs space-y-0.5 opacity-60 text-right">
              <p>Date of Issue: <span className="font-semibold">{p.details.issue_date}</span></p>
              {p.details.due_date && <p>Payment Due: <span className="font-semibold">{p.details.due_date}</span></p>}
              {p.details.po_number && <p>Matter Ref: {p.details.po_number}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-10 border-t-2" style={{ borderColor: navy + '20' }} />

      {/* Client section */}
      <div className="px-10 py-5 grid grid-cols-2 gap-6 text-xs">
        <div>
          <p className="font-bold uppercase tracking-widest text-[9px] mb-2" style={{ color: navy }}>Client / Billed to</p>
          <p className="font-bold text-sm">{p.to.name || '—'}</p>
          {p.to.company && <p className="opacity-70">{p.to.company}</p>}
          {p.to.email && <p className="opacity-60 mt-1">{p.to.email}</p>}
          {p.to.address && <p className="opacity-60 mt-0.5 leading-snug">{p.to.address}</p>}
        </div>
        <div className="bg-slate-50 p-3 rounded text-xs space-y-1.5">
          <p className="font-bold uppercase tracking-widest text-[9px] mb-1" style={{ color: navy }}>Invoice summary</p>
          <div className="flex justify-between"><span className="opacity-50">Invoice No.</span><span className="font-semibold">{p.details.invoice_number}</span></div>
          <div className="flex justify-between"><span className="opacity-50">Issue date</span><span>{p.details.issue_date}</span></div>
          {p.details.due_date && <div className="flex justify-between"><span className="opacity-50">Due date</span><span className="font-semibold" style={{ color: gold }}>{p.details.due_date}</span></div>}
          <div className="flex justify-between"><span className="opacity-50">Currency</span><span>{p.details.currency}</span></div>
        </div>
      </div>

      {/* Services rendered */}
      <div className="px-10 pb-5">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: navy }}>Services rendered</p>
        <ItemsTable items={p.items} fmt={p.fmt} accent={gold} textColor="#1a1a1a" tableStyle={c.tableStyle} tableHeaderBg="#f1f5f9" tableStripeBg="#f8fafc" />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={gold} textColor="#1a1a1a" />
        </div>
      </div>

      {/* Notes */}
      {(p.notes || p.paymentInfo) && (
        <div className="px-10 py-4 border-t" style={{ borderColor: navy + '15' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={gold} textColor="#1a1a1a" />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color="#1a1a1a" />

      {/* Legal footer */}
      <div className="px-10 py-3 border-t text-[9px] opacity-40" style={{ borderColor: navy + '20' }}>
        <div className="flex justify-between">
          <span>This invoice is legally binding. Payment by due date is required.</span>
          <span>{p.from.name}</span>
        </div>
      </div>

      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={gold} />
      <div style={{ height: '6px', backgroundColor: navy }} />
    </div>
  )
}

// ─── LAYOUT 8: MEDICAL (Clinical, clean — doctors, clinics, labs) ─────────────
export function LayoutMedical(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily !== 'Inter' ? c.fontFamily : 'Inter'}, sans-serif`
  const blue = accent

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#f0f9ff', color: '#0c1a2e', fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Header */}
      <div className="px-8 py-6 bg-white" style={{ borderBottom: `3px solid ${blue}` }}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {/* Cross symbol */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-black shrink-0 mt-1" style={{ backgroundColor: blue }}>
              ✚
            </div>
            <div>
              <Logo url={p.from.logo_url} size="h-8 max-w-[100px]" />
              <p className="font-black text-lg" style={{ color: blue }}>{p.from.name || 'Your Clinic'}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40 mt-0.5">Healthcare &amp; Medical Services</p>
              <div className="text-xs mt-1 opacity-60">
                {p.from.email && <span className="mr-3">{p.from.email}</span>}
                {p.from.phone && <span>{p.from.phone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-xl px-4 py-2 text-white" style={{ backgroundColor: blue }}>
              <p className="text-xs font-bold uppercase tracking-wide">Receipt / Invoice</p>
              <p className="text-lg font-black mt-0.5">{p.details.invoice_number}</p>
            </div>
            <div className="mt-2 text-xs space-y-0.5 opacity-60">
              <p>Date: <span className="font-semibold">{p.details.issue_date}</span></p>
              {p.details.due_date && <p>Due: <span className="font-semibold">{p.details.due_date}</span></p>}
            </div>
          </div>
        </div>
      </div>

      {/* Patient / client card */}
      <div className="px-8 py-4 grid grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: blue + '20' }}>
          <p className="font-bold uppercase tracking-widest text-[9px] mb-2" style={{ color: blue }}>Patient / Client</p>
          <p className="font-bold text-sm text-slate-900">{p.to.name || '—'}</p>
          {p.to.company && <p className="opacity-60">{p.to.company}</p>}
          {p.to.email && <p className="opacity-60 mt-0.5">{p.to.email}</p>}
          {p.to.address && <p className="opacity-50 mt-0.5 leading-snug">{p.to.address}</p>}
        </div>
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: blue + '20' }}>
          <p className="font-bold uppercase tracking-widest text-[9px] mb-2" style={{ color: blue }}>Invoice details</p>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="opacity-50">Invoice#</span><span className="font-semibold">{p.details.invoice_number}</span></div>
            <div className="flex justify-between"><span className="opacity-50">Issued</span><span>{p.details.issue_date}</span></div>
            {p.details.due_date && <div className="flex justify-between"><span className="opacity-50">Due</span><span className="font-bold" style={{ color: blue }}>{p.details.due_date}</span></div>}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="px-8 pb-4 bg-white mx-8 mb-4 rounded-xl border" style={{ borderColor: blue + '20' }}>
        <p className="pt-4 pb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: blue }}>Medical services &amp; charges</p>
        <ItemsTable items={p.items} fmt={p.fmt} accent={blue} textColor="#0c1a2e" tableStyle={c.tableStyle} tableHeaderBg="#f0f9ff" tableStripeBg="#e0f2fe" />
        <div className="mt-4">
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={blue} textColor="#0c1a2e" />
        </div>
      </div>

      {/* Notes */}
      {(p.notes || p.paymentInfo) && (
        <div className="px-8 pb-4">
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={blue} textColor="#0c1a2e" />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color="#0c1a2e" />
      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={blue} />
      <div className="px-8 py-2 text-center text-[9px] opacity-40 bg-white border-t" style={{ borderColor: blue + '15' }}>
        This is a computer-generated receipt. For any queries, contact us at {p.from.email || 'reception@clinic.com'}
      </div>
    </div>
  )
}

// ─── LAYOUT 9: CONSTRUCTION (Bold industrial — builders, contractors, trades) ──
export function LayoutConstruction(p: InvoiceRenderProps) {
  const { accent, customization: c } = p
  const font = `${c.fontFamily !== 'Inter' ? c.fontFamily : 'Inter'}, sans-serif`
  const orange = accent
  const dark = '#111827'

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: '#f9fafb', color: dark, fontFamily: font }}>
      <Watermark text={c.watermark} color={c.watermarkColor} />

      {/* Bold dark header */}
      <div className="px-8 py-6" style={{ backgroundColor: dark }}>
        <div className="flex justify-between items-center">
          <div>
            <Logo url={p.from.logo_url} size="h-10 max-w-[120px]" />
            <p className="text-2xl font-black text-white mt-2 uppercase tracking-tight">{p.from.name || 'Your Company'}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              {p.from.email && <span>{p.from.email}</span>}
              {p.from.phone && <span>· {p.from.phone}</span>}
            </div>
          </div>
          {/* Orange diagonal badge */}
          <div className="text-right">
            <div className="inline-block px-5 py-3 skew-x-[-6deg]" style={{ backgroundColor: orange }}>
              <p className="text-white font-black text-sm uppercase tracking-widest skew-x-[6deg]">INVOICE</p>
              <p className="text-white font-black text-xl skew-x-[6deg]">{p.details.invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orange info band */}
      <div className="px-8 py-3 grid grid-cols-4 gap-4 text-xs text-white" style={{ backgroundColor: orange }}>
        <div><p className="opacity-70 uppercase tracking-wide text-[9px]">Billed to</p><p className="font-bold mt-0.5 truncate">{p.to.name || '—'}</p></div>
        <div><p className="opacity-70 uppercase tracking-wide text-[9px]">Project / Ref</p><p className="font-bold mt-0.5">{p.details.po_number || '—'}</p></div>
        <div><p className="opacity-70 uppercase tracking-wide text-[9px]">Issue date</p><p className="font-bold mt-0.5">{p.details.issue_date}</p></div>
        <div><p className="opacity-70 uppercase tracking-wide text-[9px]">Due date</p><p className="font-black mt-0.5">{p.details.due_date || '—'}</p></div>
      </div>

      {/* Client details */}
      {(p.to.address || p.to.email || p.to.company) && (
        <div className="px-8 py-4 text-xs border-b" style={{ borderColor: orange + '30', backgroundColor: '#fff' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: orange }}>Client details</p>
          <div className="flex gap-8">
            {p.to.company && <div><span className="opacity-50">Company: </span><span className="font-semibold">{p.to.company}</span></div>}
            {p.to.email && <div><span className="opacity-50">Email: </span><span>{p.to.email}</span></div>}
            {p.to.address && <div><span className="opacity-50">Address: </span><span>{p.to.address}</span></div>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-8 py-5 bg-white">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: orange }}>Work / Materials breakdown</p>
        <ItemsTable items={p.items} fmt={p.fmt} accent={orange} textColor={dark} tableStyle={c.tableStyle} tableHeaderBg="#fff7ed" tableStripeBg="#fff7ed" />
        <div className="mt-5 border-t-2 pt-4" style={{ borderColor: orange }}>
          <TotalsBlock subtotal={p.subtotal} taxTotal={p.taxTotal} discountAmount={p.discountAmount} grandTotal={p.grandTotal} fmt={p.fmt} accent={orange} textColor={dark} />
        </div>
      </div>

      {/* Terms & notes */}
      {(p.notes || p.paymentInfo) && (
        <div className="px-8 py-4 bg-white border-t" style={{ borderColor: orange + '20' }}>
          <NotesRow notes={p.notes} paymentInfo={p.paymentInfo} accent={orange} textColor={dark} />
        </div>
      )}
      <SignatureLine show={c.showSignatureLine} color={dark} />

      <FooterSection text={c.footerText} imageUrl={c.footerImageUrl} bg={c.footerBg} accent={orange} />

      {/* Bottom bar */}
      <div className="px-8 py-2 text-xs text-white flex justify-between" style={{ backgroundColor: dark }}>
        <span className="opacity-50">Thank you for your business</span>
        <span className="font-bold opacity-70">{p.from.name}</span>
      </div>
    </div>
  )
}

// ─── Layout resolver ──────────────────────────────────────────────────────────
export function resolveLayout(headerStyle: string): (p: InvoiceRenderProps) => JSX.Element {
  switch (headerStyle) {
    case 'bar':          return LayoutBar
    case 'dark':         return LayoutDark
    case 'sidebar':      return LayoutSidebar
    case 'centered':     return LayoutCentered
    case 'bordered':     return LayoutBordered
    case 'legal':        return LayoutLegal
    case 'medical':      return LayoutMedical
    case 'construction': return LayoutConstruction
    case 'split':
    default:             return LayoutSplit
  }
}
