import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/settings/SettingsForm'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch active business ID from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_business_id')
    .eq('id', user!.id)
    .single()

  let activeBiz = null
  if (profile?.active_business_id) {
    const { data: b } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', profile.active_business_id)
      .single()
    activeBiz = b
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Update your business profile and invoice defaults</p>
      </div>
      <SettingsForm business={activeBiz} userId={user!.id} userEmail={user!.email!} />
    </div>
  )
}
