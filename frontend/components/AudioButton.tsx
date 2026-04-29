'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'loading' | 'ready' | 'error'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function AudioButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Revoke blob URL when component unmounts to free memory
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function handleGenerate() {
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'idle') {
    return (
      <button
        onClick={handleGenerate}
        className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
      >
        🔊 Listen
      </button>
    )
  }

  if (status === 'loading') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-3 h-3 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
        Generating audio…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <button
        onClick={() => setStatus('idle')}
        className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        ⚠ Audio unavailable — retry
      </button>
    )
  }

  // ready — show native audio player (autoPlay on first load)
  return (
    <div className="mt-3">
      <audio
        ref={audioRef}
        src={audioUrl!}
        controls
        autoPlay
        className="h-8 w-full max-w-sm rounded"
      />
    </div>
  )
}
