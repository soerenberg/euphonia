import type { ReactNode } from 'react'
import './Panel.css'

interface PanelProps {
  title?: string
  children: ReactNode
}

export function Panel({ title, children }: PanelProps) {
  return (
    <div className="panel">
      {title && <span className="panel-title">{title}</span>}
      {children}
    </div>
  )
}
