import './NumberStepper.css'

export function NumberStepper({ value, onChange, min = 0, placeholder }) {
  const numValue = value === '' ? null : Number(value)
  const atMin = numValue !== null && numValue <= min

  const decrement = () => {
    if (atMin) return
    onChange(String((numValue ?? min + 1) - 1))
  }

  const increment = () => {
    onChange(String((numValue ?? min - 1) + 1))
  }

  const handleInput = (e) => {
    const v = e.target.value
    if (v === '' || /^\d+$/.test(v)) onChange(v)
  }

  return (
    <div className="number-stepper">
      <button type="button" className="number-stepper__btn" onClick={decrement} disabled={atMin} aria-label="Diminuir">
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="number-stepper__input"
        value={value}
        placeholder={placeholder}
        onChange={handleInput}
      />
      <button type="button" className="number-stepper__btn" onClick={increment} aria-label="Aumentar">
        +
      </button>
    </div>
  )
}
