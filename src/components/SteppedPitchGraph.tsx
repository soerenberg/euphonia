import { useEffect, useRef } from 'react'
import { isVoiced, type PitchSample, type TargetRange } from '../audio/pitchStats'
import './SteppedPitchGraph.css'

interface SteppedPitchGraphProps {
  samples: PitchSample[]
  windowSeconds: number
  targetRange: TargetRange
}

const MIN_HZ = 60
const MAX_HZ = 400

export function SteppedPitchGraph({ samples, windowSeconds, targetRange }: SteppedPitchGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const draw = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      const style = getComputedStyle(container)
      const roseAccent = style.getPropertyValue('--rose-accent').trim()
      const amberWarn = style.getPropertyValue('--amber-warn').trim()

      const yMin = Math.min(MIN_HZ, targetRange.min ?? MIN_HZ)
      const yMax = Math.max(MAX_HZ, targetRange.max ?? MAX_HZ)
      const yFor = (hz: number) => height - ((hz - yMin) / (yMax - yMin)) * height

      const now = Date.now()
      const windowStart = now - windowSeconds * 1000
      const xFor = (t: number) => ((t - windowStart) / (windowSeconds * 1000)) * width

      if (targetRange.min != null || targetRange.max != null) {
        const top = yFor(targetRange.max ?? yMax)
        const bottom = yFor(targetRange.min ?? yMin)
        ctx.fillStyle = amberWarn
        ctx.globalAlpha = 0.2
        ctx.fillRect(0, top, width, bottom - top)
        ctx.globalAlpha = 1
      }

      const visible = samples.filter((s) => s.t >= windowStart)
      ctx.strokeStyle = roseAccent
      ctx.lineWidth = 2
      ctx.beginPath()
      let pathOpen = false
      let prevY = 0
      for (const sample of visible) {
        if (!isVoiced(sample)) {
          pathOpen = false
          continue
        }
        const x = xFor(sample.t)
        const y = yFor(sample.pitch)
        if (!pathOpen) {
          ctx.moveTo(x, y)
          pathOpen = true
        } else {
          ctx.lineTo(x, prevY)
          ctx.lineTo(x, y)
        }
        prevY = y
      }
      ctx.stroke()
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [samples, windowSeconds, targetRange])

  return (
    <div className="stepped-pitch-graph" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  )
}
