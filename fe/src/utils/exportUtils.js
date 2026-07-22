/**
 * Export data array to a CSV file and trigger browser download.
 * @param {string} filename Name of the file to save, e.g. "report.csv"
 * @param {Array<Object>} data Array of objects to export
 * @param {Array<{key: string, label: string}>} [headers] Optional headers mapping
 */
export function downloadCSV(filename, data, headers) {
  if (!data || !data.length) return

  const keys = headers ? headers.map((h) => h.key) : Object.keys(data[0])
  const headerNames = headers ? headers.map((h) => h.label) : keys

  const csvRows = []
  csvRows.push(headerNames.join(','))

  for (const row of data) {
    const values = keys.map((key) => {
      const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : ''
      const escaped = val.replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
