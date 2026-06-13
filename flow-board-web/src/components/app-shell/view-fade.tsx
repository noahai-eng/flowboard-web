'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'

// Echter Cross-Fade beim Wechsel Board <-> Heute <-> Focus (Spec 10/11).
// Liegt im persistenten (app)-Layout, damit AnimatePresence den alten Inhalt
// kennt: mode="popLayout" nimmt die ausgehende View aus dem Flow (absolut),
// die neue rueckt nach -> alte blendet aus, neue ein, gleichzeitig.
// reduced-motion: kein Fade, direkter Wechsel.
export function ViewFade({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  if (reduce) return <div className="h-full">{children}</div>

  return (
    <div className="relative h-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
