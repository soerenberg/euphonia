import { useCallback, useEffect, useRef, useState } from 'react'
import { useClipRecorder } from '../audio/useClipRecorder'
import { computeSessionStats } from '../audio/pitchStats'
import { useSettings } from '../store/SettingsContext'
import { SteppedPitchGraph } from '../components/SteppedPitchGraph'
import {
  saveClip,
  getAllClips,
  deleteClip,
  deleteAllClips,
  totalStoredBytes,
  type StoredClip,
} from '../storage/clipsDb'
import { downloadBlob, exportClipAsWav, extensionForMimeType } from '../utils/audioExport'
import './CompareTab.css'

// Colorblind-considerate qualitative palette (Okabe-Ito derived), distinct
// from the app's single rose accent since here color is the only thing
// separating multiple overlaid clips.
const CLIP_COLORS = ['#C97B84', '#56B4E9', '#009E73', '#0072B2', '#D55E00']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function safeFilename(label: string): string {
  return label.trim().replace(/[^a-z0-9-_ ]+/gi, '_') || 'clip'
}

interface CompareTabProps {
  registerAction: (action: () => void) => void
}

export function CompareTab({ registerAction }: CompareTabProps) {
  const { status, error, start, stop } = useClipRecorder()
  const { targetRangeHz } = useSettings()
  const [clips, setClips] = useState<StoredClip[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const refreshClips = useCallback(async () => {
    setClips(await getAllClips())
  }, [])

  useEffect(() => {
    refreshClips()
  }, [refreshClips])

  const handleToggleRecording = useCallback(async () => {
    if (status === 'recording') {
      const clip = await stop()
      if (clip) {
        const id = crypto.randomUUID()
        await saveClip({
          id,
          label: new Date().toLocaleTimeString(),
          createdAt: Date.now(),
          durationMs: clip.durationMs,
          mimeType: clip.mimeType,
          blob: clip.blob,
          samples: clip.samples,
        })
        setSelectedIds((prev) => new Set(prev).add(id))
        await refreshClips()
      }
    } else {
      await start()
    }
  }, [status, start, stop, refreshClips])

  useEffect(() => {
    registerAction(handleToggleRecording)
  }, [handleToggleRecording, registerAction])

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleLabelChange = (id: string, label: string) => {
    setClips((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)))
  }

  const handleLabelBlur = async (clip: StoredClip) => {
    await saveClip(clip)
  }

  const handleDelete = async (id: string) => {
    await deleteClip(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    await refreshClips()
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all clips? This cannot be undone.')) return
    await deleteAllClips()
    setSelectedIds(new Set())
    await refreshClips()
  }

  const handlePlayToggle = (clip: StoredClip) => {
    audioRef.current?.pause()
    if (playingId === clip.id) {
      setPlayingId(null)
      return
    }
    const url = URL.createObjectURL(clip.blob)
    const audio = new Audio(url)
    audio.onended = () => {
      setPlayingId(null)
      URL.revokeObjectURL(url)
    }
    audio.play()
    audioRef.current = audio
    setPlayingId(clip.id)
  }

  const handleDownloadWav = async (clip: StoredClip) => {
    const wav = await exportClipAsWav(clip.blob)
    downloadBlob(wav, `${safeFilename(clip.label)}.wav`)
  }

  const handleDownloadNative = (clip: StoredClip) => {
    downloadBlob(clip.blob, `${safeFilename(clip.label)}.${extensionForMimeType(clip.mimeType)}`)
  }

  const selectedClips = clips.filter((c) => selectedIds.has(c.id))
  const overlaySeries = selectedClips.map((clip, i) => {
    const firstT = clip.samples[0]?.t ?? 0
    return {
      samples: clip.samples.map((s) => ({ ...s, t: s.t - firstT })),
      color: CLIP_COLORS[i % CLIP_COLORS.length],
    }
  })
  const windowSeconds = Math.max(5, ...selectedClips.map((c) => c.durationMs / 1000))
  const colorForClip = (id: string): string | null => {
    const index = selectedClips.findIndex((c) => c.id === id)
    return index === -1 ? null : CLIP_COLORS[index % CLIP_COLORS.length]
  }

  return (
    <div className="compare-tab">
      <div className="compare-tab-controls">
        <button
          type="button"
          className="compare-tab-button"
          onClick={handleToggleRecording}
          disabled={status === 'requesting-permission'}
        >
          {status === 'recording' ? 'Stop' : 'Record'}
        </button>
        <span className="compare-tab-status">status: {status}</span>
        {clips.length > 0 && (
          <button type="button" className="compare-tab-button" onClick={handleDeleteAll}>
            Delete all
          </button>
        )}
      </div>

      {error && <p className="compare-tab-error">error: {error}</p>}

      <SteppedPitchGraph series={overlaySeries} windowSeconds={windowSeconds} targetRange={targetRangeHz} mode="replay" />

      <div className="compare-tab-clips">
        {clips.length === 0 && <p className="compare-tab-status">No clips recorded yet.</p>}
        {clips.map((clip) => {
          const { average, percentInRange } = computeSessionStats(clip.samples, targetRangeHz)
          return (
            <div key={clip.id} className="compare-tab-clip-row">
              <input
                type="checkbox"
                checked={selectedIds.has(clip.id)}
                onChange={() => toggleSelected(clip.id)}
                aria-label="Include in overlay"
              />
              <span className="compare-tab-swatch" style={{ background: colorForClip(clip.id) ?? 'transparent' }} />
              <input
                type="text"
                className="compare-tab-clip-label"
                value={clip.label}
                onChange={(e) => handleLabelChange(clip.id, e.target.value)}
                onBlur={() => handleLabelBlur(clip)}
              />
              <span className="compare-tab-clip-stat">{(clip.durationMs / 1000).toFixed(1)}s</span>
              <span className="compare-tab-clip-stat">{average != null ? `${average.toFixed(0)} Hz avg` : '—'}</span>
              <span className="compare-tab-clip-stat">
                {percentInRange != null ? `${percentInRange.toFixed(0)}% in range` : '—'}
              </span>
              <div className="compare-tab-clip-actions">
                <button type="button" className="compare-tab-clip-button" onClick={() => handlePlayToggle(clip)}>
                  {playingId === clip.id ? 'Pause' : 'Play'}
                </button>
                <button type="button" className="compare-tab-clip-button" onClick={() => handleDownloadWav(clip)}>
                  WAV
                </button>
                <button type="button" className="compare-tab-clip-button" onClick={() => handleDownloadNative(clip)}>
                  {extensionForMimeType(clip.mimeType).toUpperCase()}
                </button>
                <button type="button" className="compare-tab-clip-button" onClick={() => handleDelete(clip.id)}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="compare-tab-storage">Storage used: {formatBytes(totalStoredBytes(clips))}</p>
    </div>
  )
}
