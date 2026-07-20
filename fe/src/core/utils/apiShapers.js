/**
 * Safe data shapers used across page services.
 *
 * Backend responses are inconsistent: some controllers return
 * PascalCase DTOs (the application-layer convention), some return
 * lowercase-camelCase DTOs (the ParkingStructureController special
 * case), some wrap payloads in `{ items, data, reservations }`.
 *
 * These helpers aim to normalise everything into a stable shape so
 * components can render defensively without crashing on undefined.
 */

const ALL_SENTINELS = new Set([
  '',
  'All Statuses',
  'All Methods',
  'All Types',
  'All Vehicles',
  'All Buildings',
  'All Floors',
  'All Zones',
  'All Roles',
  'All Categories',
  'All',
  'Today',
  'Tomorrow',
  'Yesterday',
  'Last 7 days',
  'Last 30 days',
  'Custom'
])

export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

export function safeString(value, fallback = '') {
  if (value === undefined || value === null) return fallback
  return String(value)
}

export function safeNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function safeArray(value) {
  return Array.isArray(value) ? value : []
}

export function pickFirst(payload, keys) {
  if (!payload || typeof payload !== 'object') return undefined
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) return payload[key]
  }
  return undefined
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of ['items', 'data', 'results', 'records', 'list']) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

export function sanitizeParams(params = {}) {
  const cleaned = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && ALL_SENTINELS.has(value.trim())) continue
    if (typeof value === 'string' && value.trim() === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    cleaned[key] = value
  }
  return cleaned
}

/**
 * Drop keys the backend cannot bind (GUIDs would otherwise 400).
 * Provide an explicit whitelist via `keep` or a blacklist via `drop`.
 */
export function stripUnsupportedParams(params, keep = null, drop = []) {
  if (keep && Array.isArray(keep)) {
    const out = {}
    for (const key of keep) if (params[key] !== undefined) out[key] = params[key]
    return out
  }
  const out = {}
  for (const [key, value] of Object.entries(params)) {
    if (drop.includes(key)) continue
    out[key] = value
  }
  return out
}

/**
 * Translate enum-like display strings into backend enums.
 * map = { FE_KEY: BACKEND_ENUM, ... } — lookup is case-insensitive.
 */
export function translateEnum(value, map = {}) {
  if (value === undefined || value === null) return value
  const raw = safeString(value)
  if (map[raw] !== undefined) return map[raw]
  const norm = raw.toUpperCase().replace(/[\s-]+/g, '_')
  if (map[norm] !== undefined) return map[norm]
  return value
}

/**
 * Normalise a DTO that may arrive as PascalCase or camelCase into
 * the camelCase shape components expect.
 */
export function normalizeFields(dto, schema) {
  if (!dto || typeof dto !== 'object') return dto
  const out = {}
  for (const [target, sources] of Object.entries(schema)) {
    const list = Array.isArray(sources) ? sources : [sources]
    let value
    for (const source of list) {
      if (dto[source] !== undefined && dto[source] !== null) {
        value = dto[source]
        break
      }
    }
    out[target] = value
  }
  return out
}

export function formatTime(value, { locale = 'en-GB', withDate = false } = {}) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(locale, withDate
    ? { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }
    : { hour: '2-digit', minute: '2-digit' })
}

export function formatMoney(value, { currency = 'VND', locale = 'vi-VN' } = {}) {
  const num = safeNumber(value, 0)
  return new Intl.NumberFormat(locale, {
    style: currency ? 'currency' : 'decimal',
    currency: currency || undefined,
    minimumFractionDigits: 0
  }).format(num)
}

export function safeLower(value) {
  return safeString(value).toLowerCase()
}

export function badgeClass(value, aliases = {}) {
  const raw = safeString(value) || '—'
  const lowered = raw.toLowerCase().replace(/[\s_-]+/g, '')
  const friendly = aliases[lowered] || raw
  return friendly.toLowerCase().replaceAll(' ', '-')
}

export function deriveStats(list, reducers, initial = {}) {
  const result = { ...initial }
  for (const [key, reducer] of Object.entries(reducers)) {
    result[key] = list.reduce(reducer, initial[key] ?? 0)
  }
  return result
}