/** Tiny, safe markdown → HTML for task briefs and version notes (headings, lists, bold, code, links). */
function escapeHtml(text: string): string {
   return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
}

function inline(text: string): string {
   return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
}

export function renderMarkdown(source: string): string {
   const html: string[] = []
   let list: 'ul' | 'ol' | null = null

   const closeList = () => {
      if (list) html.push(`</${list}>`)
      list = null
   }

   for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trimEnd()
      const heading = line.match(/^(#{1,4})\s+(.*)$/)
      const bullet = line.match(/^\s*[-*]\s+(.*)$/)
      const numbered = line.match(/^\s*\d+\.\s+(.*)$/)

      if (heading) {
         closeList()
         const level = Math.min(heading[1].length + 2, 6)
         html.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      }
      else if (bullet || numbered) {
         const kind = bullet ? 'ul' : 'ol'
         if (list !== kind) {
            closeList()
            html.push(`<${kind}>`)
            list = kind
         }
         html.push(`<li>${inline((bullet ?? numbered)![1])}</li>`)
      }
      else if (!line.trim()) {
         closeList()
      }
      else {
         closeList()
         html.push(`<p>${inline(line)}</p>`)
      }
   }

   closeList()
   return html.join('\n')
}
