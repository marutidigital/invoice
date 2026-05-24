import Link from 'next/link'
import { FileText, Download, Send, History, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-lg">ProInvoice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Check className="w-3.5 h-3.5" />
            Free forever — no credit card required
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
            Create professional invoices{' '}
            <span className="text-blue-600">in minutes.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            No watermarks. No limits. No credit card. Just a fast, beautiful invoice tool that remembers everything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              id="hero-cta-primary"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
            >
              Create your first invoice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-secondary"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-6 py-3.5 rounded-xl font-medium text-base border border-slate-200 hover:border-slate-300 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Done in under 2 minutes</h2>
            <p className="text-slate-500">Three steps. Every time.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                title: 'Pick a template',
                desc: 'Choose from 35 professionally designed invoice templates.',
              },
              {
                step: '02',
                icon: <History className="w-6 h-6 text-blue-600" />,
                title: 'Fill the form',
                desc: 'Your business details auto-fill. Select a client from your book.',
              },
              {
                step: '03',
                icon: <Download className="w-6 h-6 text-blue-600" />,
                title: 'Download or send',
                desc: 'Export a pixel-perfect PDF or email it directly to your client.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-blue-400 tracking-widest mb-4">{item.step}</div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need, nothing you don&apos;t</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: <History className="w-5 h-5 text-blue-600" />,
                title: 'Smart memory',
                desc: 'Set up once. Every invoice after that auto-fills your business details, clients, and preferences.',
              },
              {
                icon: <Download className="w-5 h-5 text-blue-600" />,
                title: 'PDF download',
                desc: 'Pixel-perfect PDFs that look exactly like the preview. Works on mobile and desktop.',
              },
              {
                icon: <Send className="w-5 h-5 text-blue-600" />,
                title: 'Email to client',
                desc: 'Send the invoice PDF directly from the app. No external tools needed.',
              },
              {
                icon: <FileText className="w-5 h-5 text-blue-600" />,
                title: 'Invoice history',
                desc: 'Track every invoice — Draft, Sent, Paid, Overdue. Search, filter, sort.',
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-5 p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center bg-blue-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Start invoicing for free</h2>
          <p className="text-blue-100 mb-8">No watermarks. No limits. Free forever.</p>
          <Link
            href="/login"
            id="bottom-cta"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
          >
            Create your first invoice
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">ProInvoice</span>
            <span className="text-slate-400 text-sm">· Free forever</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy policy</Link>
            <a href="https://proinvoice.shop" className="hover:text-slate-900 transition-colors">proinvoice.shop</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
