import { useEffect, useRef, useState } from 'react'

const DRAG_DISMISS_THRESHOLD = 60

export function Notification({ id, message, duration, onDismiss }) {
  const [dragOffset, setDragOffset] = useState(0)
  const [dismissing, setDismissing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const timeoutRef = useRef(null)
  const startYRef = useRef(0)

  const startTimer = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => dismiss(), duration)
  }

  const dismiss = () => {
    clearTimeout(timeoutRef.current)
    setDismissing(true)
    setTimeout(() => onDismiss(id), 200)
  }

  useEffect(() => {
    startTimer()
    return () => clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePointerDown = (e) => {
    if (dismissing) return
    e.currentTarget.setPointerCapture(e.pointerId)
    clearTimeout(timeoutRef.current)
    setDragging(true)
    startYRef.current = e.clientY
  }

  const handlePointerMove = (e) => {
    if (!dragging || dismissing) return
    const delta = Math.min(0, e.clientY - startYRef.current)
    setDragOffset(delta)
    if (delta <= -DRAG_DISMISS_THRESHOLD) {
      dismiss()
    }
  }

  const handlePointerUp = () => {
    if (dismissing) return
    setDragging(false)
    setDragOffset(0)
    startTimer()
  }

  return (
    <div
      className={`notification${dismissing ? ' notification--dismissing' : ''}`}
      style={{
        transform: `translateY(${dragOffset}px)`,
        transition: dragging ? 'none' : undefined
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="alert"
    >
      {message}
    </div>
  )
}
