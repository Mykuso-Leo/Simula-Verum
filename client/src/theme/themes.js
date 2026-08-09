export const THEMES = [
  { id: 'white', label: 'Branco', bg: '#FFFFFF', sidebar: '#F0F0F0', text: '#111111' },
  { id: 'black', label: 'Preto', bg: '#000000', sidebar: '#1A1A1A', text: '#F5F5F5' },
  { id: 'dark_blue', label: 'Azul escuro', bg: '#15202B', sidebar: '#1E2732', text: '#E7E9EA' },
  { id: 'light_blue', label: 'Azul claro', bg: '#BAF1FF', sidebar: '#87E7FF', text: '#0B3B45' },
  { id: 'yellow', label: 'Amarelo', bg: '#FFE475', sidebar: '#FFBB1D', text: '#3A2E00' },
  { id: 'green', label: 'Verde', bg: '#7AF6A0', sidebar: '#A2E84A', text: '#0B3B0B' },
  { id: 'purple', label: 'Roxo', bg: '#EB96FD', sidebar: '#ED38FD', text: '#2B0036' },
  { id: 'red', label: 'Vermelho', bg: '#FF5C5C', sidebar: '#D64343', text: '#3A0000' }
]

export const VALID_THEME_IDS = THEMES.map((t) => t.id)
