/**
 * Centralised entity definitions: schemas, enum maps, and shape functions.
 *
 * All service-layer shape functions live here so there is one source of truth.
 * Services import only what they need from this file.
 *
 * Schema format — each key maps to a list of source field names to try
 * (in priority order, first match wins):
 *
 *   { targetCamelCase: ['camelCase', 'PascalCase', 'snake_case'] }
 *
 * normalizeFields() in apiShapers.js resolves these at runtime.
 */

// ─── Re-export helpers ────────────────────────────────────────────────────────

import {
  safeString,
  safeNumber,
  safeArray,
  pickFirst,
  unwrapList,
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  normalizeFields,
  formatTime,
  formatMoney,
  safeLower,
  badgeClass,
  deriveStats,
} from '../utils/apiShapers'

export {
  safeString,
  safeNumber,
  safeArray,
  pickFirst,
  unwrapList,
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  normalizeFields,
  formatTime,
  formatMoney,
  safeLower,
  badgeClass,
  deriveStats,
}

// ─── Enum maps ────────────────────────────────────────────────────────────────

export const PASS_STATUS_MAP = {
  ACTIVE: 'Active',
  EXPIRING_SOON: 'ExpiringSoon',
  PENDING_APPROVAL: 'PendingApproval',
  PENDING: 'PendingApproval',
  EXPIRED: 'Expired',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
  'Active': 'Active',
  'Expiring Soon': 'ExpiringSoon',
  'Pending Approval': 'PendingApproval',
  'Expired': 'Expired',
  'Suspended': 'Suspended',
}

export const NOTIFICATION_TYPE_MAP = {
  INFO: 'Info',
  WARNING: 'Warning',
  ALERT: 'Alert',
  ERROR: 'Error',
  RESERVATION: 'Reservation',
  PAYMENT: 'Payment',
  TICKET: 'Ticket',
  SYSTEM: 'System',
  PARKING: 'Parking',
  'Info': 'Info',
  'Warning': 'Warning',
  'Alert': 'Alert',
  'Reservation': 'Reservation',
  'Payment': 'Payment',
  'Ticket': 'Ticket',
}

export const NOTIFICATION_STATUS_MAP = {
  UNREAD: 'Unread',
  READ: 'Read',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
  ARCHIVED: 'Archived',
  'Unread': 'Unread',
  'Read': 'Read',
  'Acknowledged': 'Acknowledged',
  'Resolved': 'Resolved',
}

export const NOTIFICATION_PRIORITY_MAP = {
  LOW: 'Low',
  NORMAL: 'Normal',
  MEDIUM: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
  CRITICAL: 'Urgent',
  'Low': 'Low',
  'Normal': 'Normal',
  'High': 'High',
  'Urgent': 'Urgent',
}

export const RESERVATION_STATUS_MAP = {
  PENDING: 'Pending',
  PENDING_CHECK_IN: 'PendingCheckIn',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'CheckedIn',
  CHECKEDIN: 'CheckedIn',
  WAITING: 'Waiting',
  LATE: 'Late',
  LATE_ARRIVAL: 'Late',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  PAID: 'Paid',
  EXPIRED: 'Expired',
  'Pending Check-in': 'PendingCheckIn',
  'Checked In': 'CheckedIn',
  Waiting: 'Waiting',
  'Late Arrival': 'Late',
  Paid: 'Paid',
}

export const TICKET_STATUS_MAP = {
  ISSUED: 'Issued',
  ACTIVE: 'Active',
  PENDING_EXIT: 'PendingExit',
  PENDING_PAYMENT: 'PendingPayment',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  LOST: 'Lost',
  'Active': 'Active',
  'Pending Exit': 'PendingExit',
  'Pending Payment': 'PendingPayment',
  'Closed': 'Closed',
  'Lost Ticket': 'Lost',
}

export const TICKET_TYPE_MAP = {
  NORMAL: 'Hourly',
  HOURLY: 'Hourly',
  DAILY: 'Daily',
  MONTHLY: 'MonthlyPass',
  MONTHLY_PASS: 'MonthlyPass',
  RESERVATION: 'Reservation',
  'Normal': 'Hourly',
  'Monthly': 'MonthlyPass',
  'Reservation': 'Reservation',
  'Lost Ticket': 'Complimentary',
}

export const PAYMENT_STATUS_MAP = {
  PAID: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUND_PENDING: 'Refunded',
  REFUNDED: 'Refunded',
  WAIVED: 'Waived',
  CANCELLED: 'Cancelled',
}

export const PAYMENT_METHOD_MAP = {
  'QR Payment': 'EWallet',
  'Cash': 'Cash',
  'Card': 'Card',
  'Monthly Pass': 'MonthlyBilling',
}

export const PAYMENT_TYPE_MAP = {
  'Parking Fee': 'Hourly',
  'Daily Pass': 'Daily',
  'Monthly Pass': 'MonthlyPass',
  'Reservation': 'Reservation',
  'Complimentary': 'Complimentary',
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const STATS_SCHEMA = {
  activeSessions: ['activeSessions', 'ActiveSessions'],
  todayEntries: ['todayEntries', 'TodayEntries'],
  todayExits: ['todayExits', 'TodayExits'],
  todayRevenue: ['todayRevenue', 'TodayRevenue'],
  availableSlots: ['availableSlots', 'AvailableSlots'],
  totalSlots: ['totalSlots', 'TotalSlots'],
  occupiedSlots: ['occupiedSlots', 'OccupiedSlots'],
  occupancyRate: ['occupancyRate', 'OccupancyRate'],
  monthlyPassesActive: ['monthlyPassesActive', 'MonthlyPassesActive'],
  pendingReservations: ['pendingReservations', 'PendingReservations'],
  pendingPayments: ['pendingPayments', 'PendingPayments'],
}

export const ACTIVITY_SCHEMA = {
  id: ['id', 'Id'],
  ticketCode: ['ticketCode', 'TicketCode'],
  licensePlate: ['licensePlate', 'LicensePlate'],
  slotCode: ['slotCode', 'SlotCode'],
  action: ['action', 'Action'],
  time: ['time', 'Time'],
  status: ['status', 'Status'],
}

export const PASS_SCHEMA = {
  id: ['id', 'Id'],
  passCode: ['passCode', 'PassCode'],
  driver: ['driver', 'Driver', 'customerName', 'CustomerName'],
  licensePlate: ['licensePlate', 'LicensePlate', 'vehiclePlate'],
  vehicleType: ['vehicleType', 'VehicleType', 'vehicleTypeName'],
  passType: ['passType', 'PassType'],
  status: ['status', 'Status'],
  validFrom: ['validFrom', 'ValidFrom', 'startDate', 'StartDate'],
  validUntil: ['validUntil', 'ValidUntil', 'endDate', 'EndDate'],
  paymentStatus: ['paymentStatus', 'PaymentStatus'],
  assignedLocation: ['assignedLocation', 'AssignedLocation'],
  lastVerified: ['lastVerified', 'LastVerified', 'lastVerifiedAt'],
  vehicleId: ['vehicleId', 'VehicleId'],
}

export const NOTIFICATION_SCHEMA = {
  id: ['id', 'Id'],
  type: ['type', 'Type', 'notificationType'],
  message: ['message', 'Message', 'title', 'Title'],
  description: ['description', 'Description', 'body'],
  reference: ['reference', 'Reference', 'referenceCode'],
  ticketCode: ['ticketCode', 'TicketCode'],
  licensePlate: ['licensePlate', 'LicensePlate', 'plate'],
  priority: ['priority', 'Priority'],
  status: ['status', 'Status'],
  staff: ['staff', 'Staff', 'processedBy'],
  gate: ['gate', 'Gate'],
  createdAt: ['createdAt', 'CreatedAt'],
  readAt: ['readAt', 'ReadAt'],
}

export const LOG_SCHEMA = {
  id: ['id', 'Id'],
  module: ['module', 'Module'],
  activity: ['activity', 'Activity', 'message', 'Message'],
  reference: ['reference', 'Reference', 'referenceCode'],
  receiptId: ['receiptId', 'ReceiptId'],
  ticketCode: ['ticketCode', 'TicketCode'],
  licensePlate: ['licensePlate', 'LicensePlate'],
  staff: ['staff', 'Staff', 'user', 'User'],
  gate: ['gate', 'Gate'],
  status: ['status', 'Status', 'severity', 'Severity'],
  description: ['description', 'Description', 'details'],
  time: ['time', 'Time', 'timestamp', 'Timestamp'],
  createdAt: ['createdAt', 'CreatedAt'],
}

export const STAFF_SCHEMA = {
  id: ['id', 'Id'],
  staffId: ['staffId', 'StaffId'],
  name: ['name', 'Name', 'fullName', 'FullName'],
  role: ['role', 'Role', 'roleName', 'RoleName'],
  area: ['area', 'Area'],
  status: ['status', 'Status'],
  entries: ['entries', 'Entries', 'entryCount'],
  exits: ['exits', 'Exits', 'exitCount'],
  payments: ['payments', 'Payments', 'paymentCount'],
  pending: ['pending', 'Pending'],
  shiftTime: ['shiftTime', 'ShiftTime'],
  lastActivity: ['lastActivity', 'LastActivity'],
}

export const WORKLOAD_SCHEMA = {
  area: ['area', 'Area'],
  label: ['label', 'Label', 'role'],
  value: ['value', 'Value'],
}

export const RULE_SCHEMA = {
  id: ['id', 'Id'],
  code: ['code', 'Code', 'pricingRuleCode'],
  name: ['name', 'Name', 'pricingRuleName', 'PricingRuleName'],
  type: ['type', 'Type'],
  ticketType: ['ticketType', 'TicketType'],
  category: ['category', 'Category'],
  vehicleType: ['vehicleType', 'VehicleType', 'vehicleTypeName'],
  vehicleTypeId: ['vehicleTypeId', 'VehicleTypeId'],
  baseFee: ['baseFee', 'BaseFee', 'unitPrice', 'UnitPrice', 'unitPricePerHour'],
  additionalFee: ['additionalFee', 'AdditionalFee', 'overtimeFee', 'OvertimeFee'],
  gracePeriod: ['gracePeriod', 'GracePeriod', 'graceMinutes'],
  rate: ['rate', 'Rate', 'price', 'Price'],
  appliedTo: ['appliedTo', 'AppliedTo'],
  status: ['status', 'Status', 'isActive', 'IsActive'],
  effectiveDate: ['effectiveDate', 'EffectiveDate', 'effectiveFrom'],
  effectiveTo: ['effectiveTo', 'EffectiveTo'],
}

export const USER_SCHEMA = {
  id: ['id', 'Id'],
  fullName: ['fullName', 'FullName', 'name', 'Name'],
  email: ['email', 'Email'],
  role: ['role', 'Role', 'roleName', 'RoleName'],
  status: ['status', 'Status'],
  lastLoginAt: ['lastLoginAt', 'LastLoginAt', 'lastLogin'],
  createdAt: ['createdAt', 'CreatedAt'],
  area: ['area', 'Area'],
}

export const RESERVATION_SCHEMA = {
  id: ['id', 'Id'],
  code: ['code', 'Code', 'reservationCode', 'ReservationCode'],
  driver: ['driver', 'Driver', 'customerName', 'CustomerName'],
  plate: ['plate', 'Plate', 'licensePlate', 'LicensePlate', 'vehiclePlate'],
  vehicleType: ['vehicleType', 'VehicleType', 'vehicleTypeName', 'VehicleTypeName'],
  slot: ['slot', 'Slot', 'slotCode', 'SlotCode', 'assignedSlotCode', 'AssignedSlotCode'],
  slotId: ['slotId', 'SlotId'],
  status: ['status', 'Status'],
  window: ['window', 'Window', 'arrivalWindow', 'ArrivalWindow'],
  floorZone: ['floorZone', 'FloorZone'],
  payment: ['payment', 'Payment', 'paymentStatus', 'PaymentStatus'],
  phone: ['phone', 'Phone', 'customerPhone', 'CustomerPhone'],
  vehicleId: ['vehicleId', 'VehicleId'],
  startTime: ['startTime', 'StartTime'],
  endTime: ['endTime', 'EndTime'],
}

export const TICKET_SCHEMA = {
  id: ['id', 'Id'],
  ticketCode: ['ticketCode', 'TicketCode'],
  licensePlate: ['licensePlate', 'VehiclePlate', 'vehiclePlate'],
  ticketType: ['ticketType', 'Type'],
  rawType: ['type', 'Type'],
  status: ['status', 'Status'],
  entryTime: ['entryTime', 'EntryTime'],
  exitTime: ['exitTime', 'ExitTime'],
  issuedAt: ['issuedAt', 'IssuedAt'],
  computedAmount: ['computedAmount', 'ComputedAmount'],
  sessionId: ['sessionId', 'SessionId'],
  vehicleId: ['vehicleId', 'VehicleId'],
}

export const VEHICLE_SCHEMA = {
  id: ['id', 'Id'],
  licensePlate: ['licensePlate', 'LicensePlate'],
  vehicleType: ['vehicleType', 'VehicleType', 'vehicleTypeName', 'VehicleTypeName'],
  vehicleTypeId: ['vehicleTypeId', 'VehicleTypeId'],
  ownerName: ['ownerName', 'OwnerName', 'fullName', 'FullName'],
  ownerUserId: ['ownerUserId', 'OwnerUserId'],
  status: ['status', 'Status'],
  createdAt: ['createdAt', 'CreatedAt'],
  updatedAt: ['updatedAt', 'UpdatedAt'],
}

export const REC_SCHEMA = {
  recommendedSlotId: ['recommendedSlotId', 'RecommendedSlotId'],
  recommendedSlotCode: ['recommendedSlotCode', 'RecommendedSlotCode'],
  recommendedZoneName: ['recommendedZoneName', 'RecommendedZoneName'],
  recommendedFloorName: ['recommendedFloorName', 'RecommendedFloorName'],
  score: ['score', 'Score'],
  explanation: ['explanation', 'Explanation'],
}

export const REC_ALT_SCHEMA = {
  slotId: ['slotId', 'SlotId'],
  slotCode: ['slotCode', 'SlotCode'],
  zoneName: ['zoneName', 'ZoneName'],
  floorName: ['floorName', 'FloorName'],
  score: ['score', 'Score'],
  reason: ['reason', 'Reason'],
}

export const SLOT_SCHEMA = {
  id: ['id', 'Id'],
  slotCode: ['slotCode', 'SlotCode'],
  status: ['status', 'Status'],
  vehicleType: ['vehicleType', 'VehicleType', 'vehicleTypeName'],
  zoneId: ['zoneId', 'ZoneId'],
  distance: ['distanceToExitOrElevator', 'DistanceToExitOrElevator'],
}

export const ZONE_SCHEMA = {
  id: ['id', 'Id'],
  name: ['name', 'Name'],
  vehicleTypeName: ['vehicleTypeName', 'VehicleTypeName'],
  capacity: ['capacity', 'Capacity'],
  occupied: ['occupied', 'Occupied'],
  available: ['available', 'Available'],
  distanceToExitOrElevator: ['distanceToExitOrElevator', 'DistanceToExitOrElevator'],
}

export const ZONE_STRUCTURE_SCHEMA = {
  id: ['id', 'Id'],
  name: ['name', 'Name', 'zone', 'Zone'],
  location: ['location', 'Location'],
  type: ['type', 'Type'],
  capacity: ['capacity', 'Capacity'],
  occupied: ['occupied', 'Occupied'],
  available: ['available', 'Available'],
  status: ['status', 'Status'],
  reserved: ['reserved', 'Reserved'],
  maintenance: ['maintenance', 'Maintenance'],
}

export const FLOOR_SCHEMA = {
  id: ['id', 'Id'],
  name: ['name', 'Name'],
  floorNumber: ['floorNumber', 'FloorNumber'],
}

export const BUILDING_SCHEMA = {
  id: ['id', 'Id'],
  name: ['name', 'Name'],
  floors: ['floors', 'Floors'],
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SLOT_STATUS_LABELS = ['Available', 'Occupied', 'Reserved', 'Maintenance']

// ─── Fallback defaults ────────────────────────────────────────────────────────

export const FALLBACK_STATS = {
  activeSessions: 0,
  todayEntries: 0,
  todayExits: 0,
  todayRevenue: 0,
  availableSlots: 0,
  totalSlots: 0,
  occupiedSlots: 0,
  occupancyRate: 0,
  monthlyPassesActive: 0,
  pendingReservations: 0,
  pendingPayments: 0,
}

export const FALLBACK_DASHBOARD = {
  stats: { ...FALLBACK_STATS },
  recentEntries: [],
  recentExits: [],
  currentTime: null,
}

export const FALLBACK_STAFF = {
  staff: [],
  summaries: [],
  shift: {
    status: 'Active',
    name: 'Morning Shift',
    facility: 'Building A',
    time: '8:00 AM - 4:00 PM',
    supervisor: 'Manager',
    coverage: '—',
    note: 'Coverage data unavailable.',
  },
  workload: [],
  pendingReviews: [],
  activities: [],
  managerNote: 'Manager notes unavailable.',
}

export const FALLBACK_STRUCTURE = {
  buildings: [{ id: null, name: 'Building A', floors: [] }],
  zones: [],
  kpis: [],
  slotTypes: [],
  recentUpdates: [],
}

export const OFFLINE_RECOMMENDATION = {
  recommendedSlotId: 'mock-1',
  recommendedSlotCode: 'B2-18',
  recommendedZoneName: 'Zone B',
  recommendedFloorName: 'Floor 2',
  score: 92,
  explanation: 'Optimal based on vehicle type and availability (offline).',
  alternatives: [
    { slotId: 'mock-2', slotCode: 'C-005', zoneName: 'Zone B', floorName: 'Floor 2', score: 72, reason: 'Good alternative' },
    { slotId: 'mock-3', slotCode: 'D-008', zoneName: 'Zone B', floorName: 'Floor 3', score: 65, reason: 'Backup option' },
  ],
}

export const MOCK_PRICING_RULES = {
  rules: [
    { code: 'PRC-001', name: 'Standard Parking', category: 'Car Parking', vehicleType: 'Car', baseFee: '50.000 ₫', additionalFee: '20.000 ₫/hour', gracePeriod: '15 mins', status: 'Active', effectiveDate: '—', appliedTo: 'All vehicles' },
    { code: 'PRC-002', name: 'Motorcycle Parking', category: 'Motorcycle Parking', vehicleType: 'Motorcycle', baseFee: '20.000 ₫', additionalFee: '10.000 ₫/hour', gracePeriod: '15 mins', status: 'Active', effectiveDate: '—', appliedTo: 'Motorcycles' },
    { code: 'PRC-003', name: 'EV Charging', category: 'EV Charging', vehicleType: 'EV', baseFee: '100.000 ₫', additionalFee: '50.000 ₫/hour', gracePeriod: '30 mins', status: 'Active', effectiveDate: '—', appliedTo: 'Electric vehicles' },
  ],
  categories: ['Car Parking', 'Motorcycle Parking', 'EV Charging', 'Monthly Pass'],
  summaries: [
    { label: 'Active Rules', value: '0', note: 'Currently applied', tone: 'success' },
    { label: 'Inactive Rules', value: '0', note: 'Disabled', tone: 'warning' },
  ],
  monthlyPasses: [],
  recentUpdates: [],
}

// ─── Normaliser helpers ───────────────────────────────────────────────────────

function safeNum(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseVehicleType(vt) {
  return vt?.Name || vt?.name || vt || '—'
}

function parseTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
  })
}

// ─── Shape functions ─────────────────────────────────────────────────────────

export function shapeStats(raw) {
  if (!raw || typeof raw !== 'object') return { ...FALLBACK_STATS }
  return { ...FALLBACK_STATS, ...normalizeFields(raw, STATS_SCHEMA) }
}

export function shapeActivity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, ACTIVITY_SCHEMA)
  return {
    id: n.id,
    ticketCode: n.ticketCode || '—',
    licensePlate: n.licensePlate || '—',
    slotCode: n.slotCode || '—',
    action: n.action || '—',
    time: n.time ? new Date(n.time) : null,
    status: n.status || '—',
  }
}

export function shapeDashboard(raw) {
  if (!raw || typeof raw !== 'object') return { ...FALLBACK_DASHBOARD }
  const stats = shapeStats(raw.stats || raw.Stats)
  const entries = Array.isArray(raw.recentEntries)
    ? raw.recentEntries
    : Array.isArray(raw.RecentEntries) ? raw.RecentEntries : []
  const exits = Array.isArray(raw.recentExits)
    ? raw.recentExits
    : Array.isArray(raw.RecentExits) ? raw.RecentExits : []
  return {
    stats,
    recentEntries: entries.map(shapeActivity).filter(Boolean),
    recentExits: exits.map(shapeActivity).filter(Boolean),
    currentTime: raw.currentTime || raw.CurrentTime || null,
  }
}

export function shapePass(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, PASS_SCHEMA)
  return {
    id: n.id,
    passCode: n.passCode || '—',
    driver: n.driver || '—',
    licensePlate: n.licensePlate || '—',
    vehicleType: n.vehicleType || '—',
    passType: n.passType || '—',
    status: n.status || 'Active',
    validFrom: n.validFrom ? new Date(n.validFrom).toLocaleDateString('en-GB') : '—',
    validUntil: n.validUntil ? new Date(n.validUntil).toLocaleDateString('en-GB') : '—',
    paymentStatus: n.paymentStatus || 'Pending',
    assignedLocation: n.assignedLocation || '—',
    lastVerified: n.lastVerified ? new Date(n.lastVerified).toLocaleString('en-GB') : '—',
    vehicleId: n.vehicleId,
  }
}

export function shapeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, NOTIFICATION_SCHEMA)
  const createdAt = n.createdAt ? new Date(n.createdAt) : null
  return {
    id: n.id,
    type: n.type || 'Info',
    message: n.message || '—',
    description: n.description || n.message || '—',
    reference: n.reference || '—',
    ticketCode: n.ticketCode || '—',
    licensePlate: n.licensePlate || '—',
    priority: n.priority || 'Normal',
    status: n.status || 'Unread',
    staff: n.staff || '—',
    gate: n.gate || '—',
    createdAt,
    time: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
      : '—',
    fullTime: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString('en-GB')
      : '—',
  }
}

export function shapeLog(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, LOG_SCHEMA)
  const createdAtRaw = n.createdAt || raw.createdAt || raw.CreatedAt
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null
  const id = n.id || raw.id || raw.Id || `LOG-${Date.now()}`
  const moduleName = n.module || raw.module || raw.Module || raw.targetEntity || raw.TargetEntity || 'System'
  const activityName = n.activity || raw.activity || raw.Activity || raw.action || raw.Action || n.description || 'System Activity'
  const staffName = n.staff || raw.staff || raw.Staff || raw.userName || raw.UserName || 'System Staff'
  const statusName = n.status || raw.status || raw.Status || 'Completed'
  const descriptionText = n.description || raw.description || raw.Description || activityName
  const refText = n.reference || raw.reference || raw.Reference || (raw.targetEntityId || raw.TargetEntityId ? String(raw.targetEntityId || raw.TargetEntityId).slice(0, 8) : 'SYS-LOG')
  const timeStr = n.time || (createdAt ? createdAt.toLocaleTimeString('vi-VN') : '14:20:00')

  return {
    id,
    module: moduleName,
    activity: activityName,
    reference: refText,
    receiptId: n.receiptId || raw.receiptId || '—',
    ticketCode: n.ticketCode || raw.ticketCode || '—',
    licensePlate: n.licensePlate || raw.licensePlate || '—',
    staff: staffName,
    gate: n.gate || raw.gate || raw.ipAddress || raw.IpAddress || 'Entry Gate A',
    status: statusName,
    description: descriptionText,
    time: timeStr,
    createdAt,
  }
}

export function shapeStaff(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, STAFF_SCHEMA)
  return {
    id: n.id || n.staffId || `STF-${String(index + 1).padStart(3, '0')}`,
    staffId: n.staffId || `STF-${String(index + 1).padStart(3, '0')}`,
    name: n.name || `Staff ${index + 1}`,
    role: n.role || 'Staff',
    area: n.area || 'Building A',
    status: n.status || 'Active',
    entries: safeNum(n.entries),
    exits: safeNum(n.exits),
    payments: safeNum(n.payments),
    pending: safeNum(n.pending),
    shiftTime: n.shiftTime || '8:00 AM - 4:00 PM',
    lastActivity: n.lastActivity || 'Recently',
  }
}

export function shapeRule(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, RULE_SCHEMA)
  const baseFee = safeNum(n.baseFee)
  // n.status may be a boolean if the API sends isActive instead of a string status
  const rawIsActive = raw.isActive ?? raw.IsActive
  let status
  if (typeof n.status === 'boolean') {
    status = n.status ? 'Active' : 'Inactive'
  } else if (typeof rawIsActive === 'boolean') {
    status = rawIsActive ? 'Active' : 'Inactive'
  } else {
    status = n.status || 'Active'
  }
  return {
    id: n.id,
    code: n.code || `PRC-${String(index + 1).padStart(3, '0')}`,
    name: n.name || `Rule ${index + 1}`,
    type: n.type || 'Standard',
    category: n.category || n.type || 'Standard',
    vehicleType: parseVehicleType(n.vehicleType),
    baseFee: formatMoney(baseFee),
    baseFeeRaw: baseFee,
    additionalFee: n.additionalFee != null ? formatMoney(n.additionalFee) : '—',
    gracePeriod: n.gracePeriod != null ? `${n.gracePeriod} mins` : '—',
    appliedTo: n.appliedTo || 'All vehicles',
    status,
    effectiveDate: n.effectiveDate ? new Date(n.effectiveDate).toLocaleDateString('en-GB') : '—',
    effectiveTo: n.effectiveTo ? new Date(n.effectiveTo).toLocaleDateString('en-GB') : '—',
  }
}

export function shapeUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, USER_SCHEMA)
  const roleName = typeof n.role === 'string' ? n.role : n.role?.name || n.role?.Name
  return {
    id: n.id,
    fullName: n.fullName || n.email || '—',
    email: n.email || '—',
    role: roleName || 'Staff',
    status: n.status === 1 || n.status === 'Active' ? 'Active'
      : (n.status === 0 ? 'Inactive' : (n.status || 'Active')),
    lastLoginAt: n.lastLoginAt,
    createdAt: n.createdAt,
    area: n.area || '—',
  }
}

export function formatRangeTime(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
}

export function shapeReservation(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, RESERVATION_SCHEMA)
  let window = n.window
  if (!window && (n.startTime || n.endTime)) {
    const start = n.startTime ? formatRangeTime(n.startTime) : ''
    const end = n.endTime ? formatRangeTime(n.endTime) : ''
    window = [start, end].filter(Boolean).join(' – ')
  }
  return {
    id: n.id,
    code: n.code || '—',
    driver: n.driver || '—',
    plate: n.plate || '—',
    vehicleType: n.vehicleType || '—',
    slot: n.slot || '—',
    slotId: n.slotId,
    status: n.status || 'Pending',
    window: window || '—',
    floorZone: n.floorZone || '—',
    payment: n.payment || 'Pending',
    phone: n.phone || '—',
    vehicleId: n.vehicleId,
  }
}

export function typeLabel(type) {
  const map = {
    Hourly: 'Normal',
    Daily: 'Daily',
    MonthlyPass: 'Monthly',
    Reservation: 'Reservation',
    Complimentary: 'Lost Ticket',
  }
  if (type === undefined || type === null) return '—'
  return map[String(type)] ?? String(type)
}

export function shapeTicket(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, TICKET_SCHEMA)
  const slotSeed = n.sessionId ? String(n.sessionId).replace(/-/g, '').slice(0, 8).toUpperCase() : null
  return {
    id: n.id,
    ticketCode: n.ticketCode || '—',
    licensePlate: n.licensePlate || '—',
    ticketType: typeLabel(n.ticketType ?? n.rawType),
    rawType: n.rawType ?? n.ticketType,
    status: n.status,
    entryTime: n.entryTime ? new Date(n.entryTime).toISOString() : null,
    exitTime: n.exitTime ? new Date(n.exitTime).toISOString() : null,
    issuedAt: n.issuedAt ? new Date(n.issuedAt).toISOString() : null,
    slotId: slotSeed || '—',
    vehicleType: '—',
    floorZone: '—',
    entryGate: '—',
    method: '—',
    staff: '—',
    paymentStatus: n.computedAmount != null ? 'Computed' : 'Pending',
    vehicleId: n.vehicleId,
  }
}

export function shapeVehicle(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, VEHICLE_SCHEMA)
  return {
    id: n.id,
    licensePlate: n.licensePlate || '—',
    vehicleType: parseVehicleType(n.vehicleType),
    vehicleTypeId: n.vehicleTypeId,
    ownerName: n.ownerName || '—',
    ownerUserId: n.ownerUserId,
    status: n.status || 'Active',
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }
}

export function shapeRecommendation(raw) {
  if (!raw || typeof raw !== 'object') return OFFLINE_RECOMMENDATION
  const n = normalizeFields(raw, REC_SCHEMA)
  const alternatives = Array.isArray(raw.alternatives)
    ? raw.alternatives
    : Array.isArray(raw.Alternatives) ? raw.Alternatives : []
  return {
    recommendedSlotId: n.recommendedSlotId,
    recommendedSlotCode: n.recommendedSlotCode,
    recommendedZoneName: n.recommendedZoneName,
    recommendedFloorName: n.recommendedFloorName,
    score: safeNum(n.score, 0),
    explanation: n.explanation,
    alternatives: alternatives.map((alt) => normalizeFields(alt, REC_ALT_SCHEMA)),
  }
}

export function shapeSlot(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, SLOT_SCHEMA)
  return {
    id: n.id,
    slotCode: n.slotCode || '—',
    status: typeof n.status === 'number' ? SLOT_STATUS_LABELS[n.status] : (n.status || 'Available'),
    rawStatus: n.status,
    vehicleType: n.vehicleType || 'Car',
    zoneId: n.zoneId,
    distance: n.distance,
  }
}

export function shapeZone(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, ZONE_SCHEMA)
  return {
    id: n.id,
    name: n.name || '—',
    vehicleTypeName: n.vehicleTypeName || '',
    capacity: safeNum(n.capacity),
    occupied: safeNum(n.occupied),
    available: safeNum(n.available),
    distanceToExitOrElevator: n.distanceToExitOrElevator,
  }
}

export function shapeZoneStructure(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, ZONE_STRUCTURE_SCHEMA)
  const capacity = safeNum(n.capacity)
  const occupied = safeNum(n.occupied)
  return {
    id: n.id,
    name: n.name || '—',
    zone: n.name || '—',
    location: n.location || '—',
    type: n.type || 'Standard',
    capacity,
    occupied,
    available: safeNum(n.available, Math.max(0, capacity - occupied)),
    reserved: safeNum(n.reserved),
    maintenance: safeNum(n.maintenance),
    status: n.status || (capacity && occupied >= capacity ? 'Full' : 'Available'),
  }
}

export function shapeFloor(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, FLOOR_SCHEMA)
  return {
    id: n.id,
    name: n.name || (n.floorNumber != null ? `Floor ${n.floorNumber}` : '—'),
    floorNumber: n.floorNumber,
  }
}

export function shapeBuilding(raw) {
  if (!raw || typeof raw !== 'object') return null
  const n = normalizeFields(raw, BUILDING_SCHEMA)
  const floors = Array.isArray(n.floors)
    ? n.floors
    : Array.isArray(raw.Floors) ? raw.Floors : []
  return {
    id: n.id,
    name: n.name || 'Building',
    floors: floors.map((f) =>
      typeof f === 'string' ? f : (f?.name || f?.Name || `Floor ${f?.floorNumber || ''}`),
    ),
  }
}

// ─── Aggregate helpers ────────────────────────────────────────────────────────

export function pickCategory(zone) {
  const raw = zone?.vehicleTypeName || zone?.vehicleType || ''
  const normalized = String(raw).trim().toLowerCase()
  if (normalized.includes('motor') || normalized.includes('bike')) return 'Motorcycle'
  if (normalized.includes('electric') || normalized.includes('ev')) return 'Electric Vehicle'
  return 'Car'
}

export function summarizeSlots(slots) {
  const available = slots.filter((s) => s.status === 'Available').length
  const occupied = slots.filter((s) => s.status === 'Occupied').length
  const reserved = slots.filter((s) => s.status === 'Reserved').length
  const maintenance = slots.filter((s) => s.status === 'Maintenance').length
  const total = slots.length
  const occupiedLike = occupied + reserved + maintenance
  return {
    totalSlots: total,
    available,
    occupied,
    reserved,
    maintenance,
    occupancyRate: total ? Math.round((occupiedLike / total) * 100) : 0,
  }
}

export function buildStructureKpis(zones) {
  const capacity = zones.reduce((sum, z) => sum + z.capacity, 0)
  const occupied = zones.reduce((sum, z) => sum + z.occupied, 0)
  const available = Math.max(0, capacity - occupied)
  return [
    { label: 'Total Slots', value: String(capacity), note: 'Across all zones' },
    { label: 'Occupied', value: String(occupied), note: 'Currently parked', tone: 'warning' },
    { label: 'Available', value: String(available), note: 'Ready to use', tone: 'success' },
    { label: 'Utilization', value: capacity ? `${Math.round((occupied * 100) / capacity)}%` : '0%', note: 'Current rate' },
  ]
}

export function buildStructureSlotTypes(zones) {
  return zones.map((z) => ({
    type: z.type || 'Standard',
    total: z.capacity,
    available: z.available,
  }))
}

export function methodDisplay(method) {
  if (method === undefined || method === null) return '—'
  const m = String(method)
  if (m === 'EWallet' || m === '3') return 'QR Payment'
  if (m === 'MonthlyBilling' || m === '4') return 'Monthly Pass'
  if (m === 'Cash' || m === '0') return 'Cash'
  if (m === 'Card' || m === '1') return 'Card'
  if (m === 'BankTransfer' || m === '2') return 'Bank Transfer'
  return m
}

export function normalizePaymentDto(raw) {
  if (!raw || typeof raw !== 'object') return raw
  const id = raw.id ?? raw.Id
  const amount = raw.amount ?? raw.Amount ?? 0
  const method = raw.method ?? raw.Method
  const status = raw.status ?? raw.Status
  const paidAt = raw.paidAt ?? raw.PaidAt
  const receiptId = raw.receiptId ?? raw.ReceiptId ?? raw.transactionReference ?? raw.TransactionReference
  const ticketCode = raw.ticketCode ?? raw.TicketCode
  const licensePlate = raw.licensePlate ?? raw.LicensePlate
  const vehicleType = raw.vehicleType ?? raw.VehicleType
  const type = raw.type ?? raw.Type
  const createdAt = raw.createdAt ?? raw.CreatedAt
  const updatedAt = raw.updatedAt ?? raw.UpdatedAt
  const staff = raw.staff ?? raw.Staff ?? raw.processedByUserName ?? raw.ProcessedByUserName
  let time = raw.time ?? raw.Time
  if (!time) {
    const base = paidAt || createdAt || updatedAt
    time = base ? new Date(base).toISOString() : ''
  }
  return {
    id,
    amount,
    method: methodDisplay(method),
    status,
    paidAt: paidAt ? new Date(paidAt).toISOString() : null,
    receiptId,
    ticketCode,
    licensePlate: licensePlate || '—',
    vehicleType: vehicleType || '—',
    type: type || methodDisplay(method),
    time,
    staff: staff || '—',
  }
}

export function shapeSession(dto) {
  if (!dto) return null
  // Backend .NET returns PascalCase; fall back to camelCase for mock/older shapes.
  const id = dto.id ?? dto.Id
  const ticketCode = dto.ticketCode ?? dto.TicketCode
  const ticketId = dto.ticketId ?? dto.TicketId
  const licensePlate = dto.licensePlate ?? dto.LicensePlate
  const vehicleType = dto.vehicleType ?? dto.VehicleType ?? ''
  const slotCode = dto.slotCode ?? dto.SlotCode
  const slotId = dto.slotId ?? dto.SlotId
  const entryTime = dto.entryTime ?? dto.EntryTime
  const status = dto.status ?? dto.Status
  const paymentStatus = dto.paymentStatus ?? dto.PaymentStatus
  return {
    id,
    ticketCode,
    ticketId,
    licensePlate,
    vehiclePlate: licensePlate,
    vehicleType,
    slotCode,
    slotId,
    entryTime,
    status,
    paymentStatus,
    paymentMethod: 'QR Payment',
  }
}

export function formatVnd(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + ' VND'
}

// ─── Filter translators ───────────────────────────────────────────────────────

export function translatePassFilters(params) {
  const out = { ...params }
  if (typeof out.status === 'string') {
    out.status = translateEnum(out.status, PASS_STATUS_MAP)
  }
  return out
}

export function translateNotificationFilters(params) {
  const out = { ...params }
  if (typeof out.type === 'string') out.type = translateEnum(out.type, NOTIFICATION_TYPE_MAP)
  if (typeof out.status === 'string') out.status = translateEnum(out.status, NOTIFICATION_STATUS_MAP)
  if (typeof out.priority === 'string') out.priority = translateEnum(out.priority, NOTIFICATION_PRIORITY_MAP)
  return out
}

export function translateReservationFilters(params) {
  const out = { ...params }
  if (typeof out.status === 'string') {
    out.status = translateEnum(out.status, RESERVATION_STATUS_MAP)
  }
  return out
}

export function translateTicketFilters(params) {
  const out = { ...params }
  if (typeof out.status === 'string') {
    out.status = translateEnum(out.status, TICKET_STATUS_MAP)
  }
  if (typeof out.type === 'string') {
    out.type = translateEnum(out.type, TICKET_TYPE_MAP)
  }
  return out
}

export function translatePaymentFilters(params) {
  const out = { ...params }
  if (typeof out.status === 'string') {
    out.status = PAYMENT_STATUS_MAP[out.status.toUpperCase()] ?? out.status
  }
  if (typeof out.method === 'string') {
    out.method = PAYMENT_METHOD_MAP[out.method] ?? out.method
  }
  if (typeof out.type === 'string') {
    out.type = PAYMENT_TYPE_MAP[out.type] ?? out.type
  }
  return out
}

// ─── AI recommendation helpers ────────────────────────────────────────────────

export function normalizeVehicleType(value) {
  if (value === undefined || value === null) return 0
  if (typeof value === 'number') return value
  const v = String(value).trim()
  if (v.includes('Electric') || v.toLowerCase().includes('ev')) return 2
  if (v.toLowerCase().includes('motor') || v.toLowerCase().includes('bike')) return 1
  return 0
}

export function normalizeTicketType(value) {
  if (value === undefined || value === null) return 0
  if (typeof value === 'number') return value
  return { Normal: 0, Hourly: 0, Daily: 1, Monthly: 2, MonthlyPass: 2, VIP: 1, Reservation: 3, 'Lost Ticket': 4 }[value] ?? 0
}
