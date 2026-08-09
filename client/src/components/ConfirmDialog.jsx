import './ConfirmDialog.css'

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog__backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="confirm-dialog__confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
