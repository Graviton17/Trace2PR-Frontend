import { Waypoints } from 'lucide-react'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand-mark" href="#top" aria-label="Trace2PR home">
      <span className="brand-mark__icon" aria-hidden="true"><Waypoints size={compact ? 17 : 19} strokeWidth={2.25} /></span>
      <span>Trace<span className="brand-mark__accent">2</span>PR</span>
    </a>
  )
}
