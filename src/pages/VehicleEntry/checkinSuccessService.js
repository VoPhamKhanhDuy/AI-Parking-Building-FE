export const formatSessionTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return String(value)
  }
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(date)
}

export const getCheckinNextSteps = ({ slotId, floor, zone }) => [
  'Allow the vehicle to pass through Entry Gate A.',
  `Guide the driver to ${floor}, Zone ${zone.split(' · ')[0]}, slot ${slotId}.`,
  'Provide the printed ticket and remind the driver to keep it for exit.',
]
