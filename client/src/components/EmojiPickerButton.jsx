import { lazy, Suspense, useState } from 'react'
import { Emoji } from './Emoji.jsx'
import './EmojiPickerButton.css'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export function EmojiPickerButton({ value, onSelect, onClear }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="emoji-picker-button">
      <div className="emoji-picker-button__row">
        <button type="button" className="emoji-picker-button__trigger" onClick={() => setOpen((o) => !o)}>
          {value ? <Emoji text={value} /> : '➕'} Escolher emoji
        </button>
        {value && (
          <button type="button" className="emoji-picker-button__clear" onClick={onClear}>
            Remover
          </button>
        )}
      </div>

      {open && (
        <div className="emoji-picker-button__backdrop" onClick={() => setOpen(false)}>
          <div className="emoji-picker-button__popover" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<p className="emoji-picker-button__loading">Carregando seletor...</p>}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onSelect(emojiData.emoji)
                  setOpen(false)
                }}
                autoFocusSearch={false}
                width="100%"
                height={360}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
