'use client'

import { createElement, useEffect, useRef, useState } from 'react'

const PLACEHOLDER_SRC = '/images/3Dplaceholder.jpg'

type Props = {
  src: string
  active: boolean
  playLabel: string
  playTheme?: 'light' | 'dark'
  onActivate: () => void
  onDeactivate: () => void
}

export default function SpotlightModelViewer({
  src,
  active,
  playLabel,
  playTheme = 'light',
  onActivate,
  onDeactivate,
}: Props) {
  const viewerRef = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void import('@google/model-viewer')
  }, [])

  useEffect(() => {
    if (!active) {
      setReady(false)
      return
    }

    const viewer = viewerRef.current
    if (!viewer) return

    viewer.setAttribute('camera-controls', '')
    viewer.setAttribute('auto-rotate', '')
    viewer.setAttribute('auto-rotate-delay', '0')
    viewer.setAttribute('disable-zoom', '')

    function handleLoad() {
      setReady(true)
    }

    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('poster-dismissed', handleLoad)

    if ((viewer as HTMLElement & { loaded?: boolean }).loaded) {
      setReady(true)
    }

    return () => {
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('poster-dismissed', handleLoad)
    }
  }, [active])

  return (
    <>
      {active ? (
        <div
          className={`spotlight__model-wrap${ready ? ' is-ready' : ''}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {createElement('model-viewer', {
            ref: viewerRef,
            className: 'spotlight__media-el spotlight__media-el--model',
            src,
            alt: 'X40 smart toilet 3D model',
            poster: PLACEHOLDER_SRC,
            'camera-controls': true,
            'disable-zoom': true,
            'auto-rotate': true,
            'auto-rotate-delay': '0',
            'rotation-per-second': '45deg',
            'interaction-prompt': 'none',
            'touch-action': 'pan-y',
            'environment-image': 'neutral',
            'shadow-intensity': '0.18',
            'shadow-softness': '1',
            exposure: '0.6',
            reveal: 'auto',
            loading: 'eager',
          })}
        </div>
      ) : null}

      <button
        type="button"
        className={[
          'spotlight__play',
          playTheme === 'light' && 'spotlight__play--light',
          playTheme === 'dark' && 'spotlight__play--dark',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => (active ? onDeactivate() : onActivate())}
        aria-label={active ? 'Close 3D view' : 'Open 3D view'}
      >
        <span className="spotlight__play-icon" aria-hidden="true">
          {active ? (
            <svg viewBox="0 0 24 24">
              <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
        <span className="spotlight__play-label">{playLabel}</span>
      </button>
    </>
  )
}
