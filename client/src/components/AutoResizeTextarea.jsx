import { useEffect, useRef } from 'react'

export function AutoResizeTextarea({ className, value, onChange, ...rest }) {
  const ref = useRef(null)

  const resize = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    resize(ref.current)
  }, [value])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={(e) => {
        resize(e.target)
        onChange(e)
      }}
      rows={1}
      {...rest}
    />
  )
}
