import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, School, MapPin, Phone, User, Calendar } from 'lucide-react'
import schoolsData  from '../../data/schools.json'
import usersData    from '../../data/users.json'
import regionsData  from '../../data/regions.json'
import { getReports }       from '../../services/reportService'
import { getSchoolScore }   from '../../services/leaderboardService'
import { getLMSCompletionRate } from '../../services/lmsService'
import Card          from '../../components/ui/Card'
import Button        from '../../components/ui/Button'
import Badge         from '../../components/ui/Badge'
import StatusPill    from '../../components/ui/StatusPill'
import ProgressBar   from '../../components/ui/ProgressBar'
import { formatDate, formatPeriod, getBadgeConfig } from '../../utils/formatters'

const CURRENT_PERIOD = '2025-02'

export default function SchoolDetail() {
  const { schoolId } = useParams()
  const navigate     = useNavigate()

  const school  = schoolsData.find(s => s.id === schoolId)
  const region  = school ? regionsData.find(r => r.id === school.region_id) : null
  const teachers = usersData.filter(u => u.role === 'teacher' && u.school_id === schoolId)
  const reports  = getReports({ school_id: schoolId })
  const score    = getSchoolScore(schoolId, CURRENT_PERIOD)
  const lmsData  = getLMSCompletionRate(schoolId, teachers)

  if (!school) {
    return (
      <div className="page-wrapper text-center py-20 text-gray-400">
        <p>Sekolah tidak ditemukan.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/app/admin/schools')}>Kembali</Button>
      </div>
    )
  }

  const badgeCfg = score?.badge ? getBadgeConfig(score.badge.tier) : null

  return (
    <div className="page-wrapper max-w-4xl">
      <div className="mb-5">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}
          onClick={() => navigate('/app/admin/schools')}>
          Kembali ke Daftar Sekolah
        </Button>
      </div>

      {/* Header */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
            <School size={24} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-gray-900">{school.name}</h1>
              <Badge color={school.status === 'active' ? 'green' : 'gray'} size="sm">
                {school.status === 'active' ? 'Aktif' : school.status}
              </Badge>
              {badgeCfg && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeCfg.className}`}>
                  {badgeCfg.emoji} {badgeCfg.label}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={13} /> {school.district}, {region?.name}</span>
              {school.phone && <span className="flex items-center gap-1"><Phone size={13} /> {school.phone}</span>}
              <span className="flex items-center gap-1"><User size={13} /> {school.principal_name}</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> Mulai {formatDate(school.program_start_date)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Score breakdown */}
        {score && (
          <Card title={`Skor ${formatPeriod(CURRENT_PERIOD)}`} className="lg:col-span-1">
            <div className="space-y-3">
              {[
                { label: 'LMS',        value: score.lms_score,        max: 40, color: 'teal' },
                { label: 'Kegiatan',   value: score.activity_score,   max: 40, color: 'blue' },
                { label: 'Konsistensi',value: score.consistency_bonus,max: 20, color: 'amber' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span><span className="font-semibold">{value}/{max}</span>
                  </div>
                  <ProgressBar value={(value / max) * 100} size="xs" color={color} />
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Total</span>
                <span className="text-teal-700">{score.total_score}/100</span>
              </div>
            </div>
          </Card>
        )}

        {/* LMS stats */}
        <Card title="Progres LMS Guru" className="lg:col-span-1">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Guru</span><span className="font-medium">{teachers.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bersertifikat</span><span className="font-medium text-teal-700">{lmsData.certified}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sedang Belajar</span><span className="font-medium text-amber-600">{lmsData.in_progress}</span></div>
            <div className="pt-2">
              <ProgressBar value={lmsData.rate} showPct size="sm" color="teal" />
            </div>
          </div>
        </Card>

        {/* Teachers list */}
        <Card title="Daftar Guru" className="lg:col-span-1">
          {teachers.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">Belum ada guru terdaftar.</p>
          ) : (
            <div className="space-y-2">
              {teachers.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center
                                  text-teal-700 text-xs font-semibold shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{t.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Reports history */}
      <Card title="Riwayat Laporan" noPadding>
        {reports.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Belum ada laporan.</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Periode</th>
                <th className="th">Kegiatan</th>
                <th className="th w-20 text-center">Peserta</th>
                <th className="th w-28 text-center">Status</th>
                <th className="th w-16 text-center">Poin</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="td text-sm">{formatPeriod(r.report_period)}</td>
                  <td className="td text-sm">{r.activity_label}</td>
                  <td className="td text-center text-sm">{r.participant_count}</td>
                  <td className="td text-center"><StatusPill status={r.status} size="sm" /></td>
                  <td className="td text-center text-sm font-medium text-teal-700">
                    {r.status === 'validated' ? `+${r.score_weight}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
