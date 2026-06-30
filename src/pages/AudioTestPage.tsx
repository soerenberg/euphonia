import { usePitchStream } from '../audio/usePitchStream'

export function AudioTestPage() {
  const { status, pitch, clarity, rms, error, sampleRate, start, stop } = usePitchStream()

  return (
    <main style={{ fontFamily: 'monospace', padding: 16, lineHeight: 1.6 }}>
      <h1>Euphonia — mic/pitch test harness</h1>

      {status === 'idle' || status === 'stopped' ? (
        <button onClick={start}>Start mic</button>
      ) : (
        <button onClick={stop} disabled={status === 'requesting-permission'}>
          Stop
        </button>
      )}

      <p>status: {status}</p>
      {error && <p style={{ color: 'red' }}>error: {error}</p>}

      <p>pitch: {pitch != null ? `${pitch.toFixed(1)} Hz` : '—'}</p>
      <p>clarity: {clarity != null ? clarity.toFixed(2) : '—'}</p>
      <p>
        rms: {rms != null ? rms.toFixed(3) : '—'}
        {rms != null && (
          <span
            style={{
              display: 'inline-block',
              marginLeft: 8,
              width: Math.min(rms * 400, 200),
              height: 10,
              background: 'green',
              verticalAlign: 'middle',
            }}
          />
        )}
      </p>

      <hr />
      <p>AudioContext.sampleRate: {sampleRate ?? '—'}</p>
      <p>worklet load: {status === 'error' ? 'failed (see error above)' : status === 'running' ? 'ok' : 'pending'}</p>
    </main>
  )
}
