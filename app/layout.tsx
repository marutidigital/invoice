import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'ProInvoice — Free Invoice Generator',
    template: '%s | ProInvoice',
  },
  description:
    'Create professional invoices in minutes. Free forever. No watermarks, no limits, no credit card required.',
  keywords: ['invoice generator', 'free invoice', 'invoice maker', 'PDF invoice', 'online invoice'],
  openGraph: {
    title: 'ProInvoice — Free Invoice Generator',
    description:
      'Create professional invoices in minutes. Free forever. No watermarks, no limits.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ProInvoice',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '8px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />
      </body>
    </html>
  )
}
