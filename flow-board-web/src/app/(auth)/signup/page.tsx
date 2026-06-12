import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { signup } from '../actions'
import { AuthForm } from '../auth-form'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    redirect('/board')
  }

  return <AuthForm mode="signup" action={signup} />
}
