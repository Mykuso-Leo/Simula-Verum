import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './QrCodeButton.css'

export function QrCodeButton() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  const handleOpen = () => {
    setClosing(false)
    setOpen(true)
  }

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 200)
  }

  return (
    <>
      <button className="qr-button" type="button" onClick={handleOpen} aria-label="Mostrar QR code do site">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <line x1="14" y1="14" x2="14" y2="21" />
          <line x1="21" y1="14" x2="21" y2="21" />
          <line x1="14" y1="17.5" x2="21" y2="17.5" />
        </svg>
      </button>

      {open && (
        <div className={`qr-overlay${closing ? ' qr-overlay--closing' : ''}`} onClick={handleClose}>
          <div className="qr-overlay__content">
            <QRCodeSVG value={window.location.origin} size={280} />
            <p className="qr-overlay__hint">Aperte em qualquer lugar para sair</p>
          </div>
        </div>
      )}
    </>
  )
}
