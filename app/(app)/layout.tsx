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

  // Check if onboarding is needed (no active business profile or business name is empty)
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user.id)
    .single()

  let needsOnboarding = true

  if (profile?.active_business_id) {
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', profile.active_business_id)
      .single()

    if (business?.name && business.name.trim() !== '') {
      needsOnboarding = false
    }
  }

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
