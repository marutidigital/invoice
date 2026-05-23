import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile is complete (onboarding done)
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name')
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if profile has only the auto-created minimal row
  // (business_name will be set to email prefix initially, but country is required)
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single()

  const needsOnboarding = !profile || !fullProfile?.country

  if (needsOnboarding) redirect('/onboarding')

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
