/**
 * csvExport.js
 * Pure utility for CSV generation and browser download.
 */

function escapeCSV(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Build a CSV string from an array of row objects.
 * @param {object[]} rows
 * @param {{ key: string, label: string }[]} columns
 * @returns {string}
 */
export function buildCSV(rows, columns) {
  const header = columns.map(c => escapeCSV(c.label)).join(',')
  const lines  = rows.map(row => columns.map(c => escapeCSV(row[c.key])).join(','))
  return [header, ...lines].join('\n')
}

/**
 * Trigger a browser CSV download.
 * Prefixes BOM so Excel opens Indonesian text correctly.
 * @param {string} filename  e.g. "laporan-2025-02.csv"
 * @param {object[]} rows
 * @param {{ key: string, label: string }[]} columns
 */
export function downloadCSV(filename, rows, columns) {
  const csv  = buildCSV(rows, columns)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
