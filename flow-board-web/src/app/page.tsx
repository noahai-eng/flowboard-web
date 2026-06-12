import { redirect } from 'next/navigation'

// Root leitet in die App. Nicht-eingeloggte faengt der Proxy ab (-> /login).
export default function Home() {
  redirect('/board')
}
