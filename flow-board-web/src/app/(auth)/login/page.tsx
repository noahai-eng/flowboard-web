import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { login } from '../actions'
import { AuthForm } from '../auth-form'

export default async function LoginPage() {
  // Bereits eingeloggte direkt zum Board (Route ist nicht im proxy-matcher).
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    redirect('/board')
  }

  return <AuthForm mode="login" action={login} />
}
