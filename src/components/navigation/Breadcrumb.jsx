import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Route segment → human-readable label mapping.
 * Extend this map as new routes are added.
 */
const LABEL_MAP = {
  app:         null,          // omit "app" from crumbs
  teacher:     null,          // omit role prefix
  admin:       null,
  gov:         null,
  dashboard:   'Dashboard',
  lms:         'Kursus',
  reports:     'Laporan',
  new:         'Buat Baru',
  monitoring:  'Monitoring',
  schools:     'Sekolah',
  users:       'Pengguna',
  leaderboard: 'Peringkat',
  profile:     'Profil',
  login:       'Masuk',
  about:       'Tentang Program',
}

function segmentLabel(seg) {
  // Dynamic segments (IDs) get a generic label
  if (seg.startsWith('crs-') || seg.startsWith('les-') || seg.startsWith('tp-'))
    return 'Detail'
  if (seg.startsWith('rpt-'))  return 'Laporan'
  if (seg.startsWith('sch-'))  return 'Sekolah'
  if (seg.startsWith('usr-'))  return 'Pengguna'
  if (LABEL_MAP[seg] !== undefined) return LABEL_MAP[seg]
  // Capitalise unknown segment
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const segments     = pathname.split('/').filter(Boolean)

  // Build crumb list, skipping null-mapped segments
  const crumbs = []
  let   path   = ''

  for (const seg of segments) {
    path += `/${seg}`
    const label = segmentLabel(seg)
    if (label !== null) {
      crumbs.push({ label, path })
    }
  }

  if (crumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={crumb.path} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-gray-400 shrink-0" />}
            {isLast ? (
              <span className="font-medium text-gray-900 truncate">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-primary-700 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
