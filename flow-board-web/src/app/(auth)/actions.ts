'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

// Typisiertes Result fuer inline Fehleranzeige via useActionState.
export type AuthState = { error: string } | null

const credentialsSchema = z.object({
  email: z.email({ error: 'Bitte eine gueltige E-Mail-Adresse eingeben.' }),
  password: z
    .string()
    .min(8, { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' }),
})

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungueltige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    // Keine Auth-Internals nach aussen geben.
    return { error: 'E-Mail oder Passwort ist falsch.' }
  }

  revalidatePath('/', 'layout')
  redirect('/board')
}

export async function signup(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungueltige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp(parsed.data)
  if (error) {
    return { error: 'Registrierung fehlgeschlagen. Bitte spaeter erneut versuchen.' }
  }

  revalidatePath('/', 'layout')
  redirect('/board')
}

export async function signout() {
  const supabase = await createClient()

  // Nur abmelden, wenn ueberhaupt eine gueltige Session vorliegt.
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
