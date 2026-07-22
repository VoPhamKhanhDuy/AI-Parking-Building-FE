/**
 * Shared validation helpers for vehicle flow (Entry & Exit).
 * Keeps rules in lock-step between the two pages so the same plate
 * is accepted on both ends.
 */

const PLATE_PATTERN = /^[0-9A-ZÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ-]{4,15}$/i

const TICKET_PATTERN = /^[A-Z0-9-]{3,30}$/i

export const normalizePlate = (plate) =>
  String(plate || '').trim().toUpperCase().replace(/\s+/g, '')

export const validateLicensePlate = (plate, { strict = true } = {}) => {
  const clean = normalizePlate(plate)
  if (!clean) return 'Vui lòng nhập biển số xe'
  if (clean.length < 4 || clean.length > 15) return 'Biển số xe phải từ 4-15 ký tự'
  if (strict && !PLATE_PATTERN.test(clean)) {
    return 'Biển số xe không hợp lệ (VD: 51A-12345)'
  }
  return null
}

export const validateTicketCode = (code) => {
  const clean = String(code || '').trim()
  if (!clean) return 'Vui lòng nhập mã vé'
  if (!TICKET_PATTERN.test(clean)) {
    return 'Mã vé không hợp lệ (VD: TKT-001)'
  }
  return null
}

/**
 * Decide whether the user typed a plate or a ticket code so that
 * downstream lookups can route the request to the right endpoint.
 */
export const classifyQuery = (raw) => {
  const value = String(raw || '').trim()
  if (!value) return { kind: 'empty', value: '', plate: null, ticket: null }
  const plate = normalizePlate(value)
  const looksLikePlate = PLATE_PATTERN.test(plate)
  const looksLikeTicket = TICKET_PATTERN.test(value)
  if (looksLikeTicket && !looksLikePlate) return { kind: 'ticket', value, plate: null, ticket: value.toUpperCase() }
  return { kind: 'plate', value, plate, ticket: null }
}
