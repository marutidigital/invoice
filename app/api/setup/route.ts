import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ONE-TIME SETUP ROUTE — creates the first admin user
// Visit: /api/setup once, then DELETE this file!
// Protected by a secret token so no one else can use it.

const SETUP_TOKEN = 'proinvoice-setup-2024'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const password = searchParams.get('password')

  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (!email || !password) {
    return NextResponse.json({
      message: 'Add ?token=proinvoice-setup-2024&email=you@email.com&password=YourPassword to the URL'
    })
  }

  // Use service role key — bypasses all email confirmation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm, no email sent
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: `✅ User created! You can now sign in at /login with: ${email}`,
    userId: data.user.id,
    warning: '⚠️ DELETE the file app/api/setup/route.ts after using this!'
  })
}
