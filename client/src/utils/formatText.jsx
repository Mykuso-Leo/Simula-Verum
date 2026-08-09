let keyCounter = 0

function applyPattern(nodes, regex, render) {
  const result = []
  for (const node of nodes) {
    if (typeof node !== 'string') {
      result.push(node)
      continue
    }
    let lastIndex = 0
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(node))) {
      if (match.index > lastIndex) result.push(node.slice(lastIndex, match.index))
      result.push(render(match))
      lastIndex = regex.lastIndex
    }
    if (lastIndex < node.length) result.push(node.slice(lastIndex))
  }
  return result
}

export function parseFormattedText(text) {
  let nodes = [text]
  nodes = applyPattern(nodes, /\*\*(.+?)\*\*/g, (m) => <strong key={`b-${keyCounter++}`}>{m[1]}</strong>)
  nodes = applyPattern(nodes, /\*(.+?)\*/g, (m) => <em key={`i-${keyCounter++}`}>{m[1]}</em>)
  nodes = applyPattern(nodes, /_(.+?)_/g, (m) => <u key={`u-${keyCounter++}`}>{m[1]}</u>)
  nodes = applyPattern(nodes, /(https?:\/\/[^\s]+)/g, (m) => (
    <a key={`l-${keyCounter++}`} href={m[1]} target="_blank" rel="noopener noreferrer" className="formatted-link">
      {m[1]}
    </a>
  ))
  return nodes
}
