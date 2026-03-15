/**
 * formatters.js
 * Date, period, label, and status formatting utilities.
 * All locale-specific text is in Bahasa Indonesia.
 */

const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

/** "2025-02" → "Februari 2025" */
export function formatPeriod(period) {
  if (!period) return '—'
  const [year, month] = period.split('-')
  return `${MONTHS_ID[parseInt(month) - 1]} ${year}`
}

/** ISO string → "15 Maret 2025" */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/** ISO string → "15 Mar 2025, 09:30" */
export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** ISO string → "2 hari yang lalu" */
export function formatRelativeTime(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7)  return `${days} hari yang lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan yang lalu`
  return `${Math.floor(days / 365)} tahun yang lalu`
}

/** Report status → { label, className, dotColor } */
export function getStatusConfig(status) {
  const map = {
    draft:     { label: 'Draft',        className: 'pill-gray',   dotColor: 'bg-gray-400' },
    submitted: { label: 'Menunggu',     className: 'pill-yellow', dotColor: 'bg-amber-400' },
    validated: { label: 'Tervalidasi',  className: 'pill-green',  dotColor: 'bg-teal-500' },
    rejected:  { label: 'Ditolak',      className: 'pill-red',    dotColor: 'bg-red-500' },
  }
  return map[status] || { label: status, className: 'pill-gray', dotColor: 'bg-gray-400' }
}

/** Badge tier → { label, emoji, className } */
export function getBadgeConfig(tier) {
  const map = {
    bronze:   { label: 'Bronze',   emoji: '🥉', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
    silver:   { label: 'Silver',   emoji: '🥈', className: 'bg-gray-100  text-gray-700  border border-gray-300' },
    gold:     { label: 'Gold',     emoji: '🥇', className: 'bg-amber-50  text-amber-700 border border-amber-200' },
    platinum: { label: 'Platinum', emoji: '💎', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
  }
  return map[tier] || { label: tier, emoji: '—', className: 'bg-gray-50 text-gray-600' }
}

/** Rank number → medal emoji or "#N" */
export function getRankEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

/** Role key → Indonesian display label */
export function getRoleLabel(role) {
  const map = {
    admin:        'Administrator',
    teacher:      'Guru',
    gov_observer: 'Pengamat Dinas',
  }
  return map[role] || role
}

/** Generate last N period options for dropdowns */
export function getPeriodOptions(n = 6) {
  const options = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: formatPeriod(value) })
  }
  return options
}

/** Trim text to max length with ellipsis */
export function truncate(text, max = 80) {
  if (!text) return '—'
  return text.length > max ? text.slice(0, max) + '…' : text
}

/** Uppercase first character */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** 42 → "42 pts" */
export function formatScore(score) {
  return `${score} pts`
}

/** 0.82 → "82%" */
export function formatPct(ratio) {
  return `${Math.round(ratio * 100)}%`
}
