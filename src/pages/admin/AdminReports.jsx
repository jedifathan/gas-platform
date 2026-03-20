import { useState, useMemo } from 'react'
import { useNavigate }     from 'react-router-dom'
import { FileText, Download } from 'lucide-react'
import { useReports }      from '../../hooks/useReports'
import { useApp }          from '../../hooks/useApp'
import Card                from '../../components/ui/Card'
import StatusPill          from '../../components/ui/StatusPill'
import Button              from '../../components/ui/Button'
import EmptyState          from '../../components/ui/EmptyState'
import DataTable           from '../../components/ui/DataTable'
import ReportFilterBar     from '../../components/reports/ReportFilterBar'
import schoolsData         from '../../data/schools.json'
import regionsData         from '../../data/regions.json'
import { downloadCSV }     from '../../utils/csvExport'
import { formatPeriod, formatRelativeTime, formatDateTime } from '../../utils/formatters'

// ── TanStack column definitions ───────────────────────────────────────────────

const COLUMNS = [
  {
    header: 'Sekolah',
    accessorKey: 'school_name',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900 text-sm">{row.original.school_name}</p>
        <p className="text-xs text-gray-400">{row.original.school_district}</p>
      </div>
    ),
  },
  {
    header: 'Kegiatan',
    accessorKey: 'activity_label',
    cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
  },
  {
    header: 'Periode',
    accessorKey: 'report_period',
    size: 110,
    cell: ({ getValue }) => <span className="text-xs text-gray-600">{formatPeriod(getValue())}</span>,
  },
  {
    header: 'Peserta',
    accessorKey: 'participant_count',
    size: 80,
    cell: ({ getValue }) => <span className="text-sm text-center block">{getValue()}</span>,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    size: 110,
    cell: ({ getValue }) => (
      <div className="flex justify-center">
        <StatusPill status={getValue()} size="sm" />
      </div>
    ),
  },
  {
    header: 'Dikirim',
    accessorKey: 'submitted_at',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-xs text-gray-500">
        {getValue() ? formatRelativeTime(getValue()) : '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    size: 80,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status === 'submitted' ? (
        <div onClick={e => e.stopPropagation()}>
          <ReviewButton reportId={row.original.id} />
        </div>
      ) : null,
  },
]

function ReviewButton({ reportId }) {
  const navigate = useNavigate()
  return (
    <Button size="sm" variant="primary"
      onClick={() => navigate(`/app/admin/reports/${reportId}`)}>
      Review
    </Button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const navigate = useNavigate()
  const { toast } = useApp()

  // BUG FIX: single hook instance — was previously called twice, breaking filters
  const { getFiltered, loading, filters, applyFilters } = useReports()

  const [search, setSearch] = useState('')

  // Apply all filters through a single derived computation
  const displayed = useMemo(() => {
    let list = getFiltered({})

    if (filters.status)    list = list.filter(r => r.status === filters.status)
    if (filters.period)    list = list.filter(r => r.report_period === filters.period)
    if (filters.school_id) list = list.filter(r => r.school_id === filters.school_id)
    if (filters.region_id) {
      const ids = schoolsData.filter(s => s.region_id === filters.region_id).map(s => s.id)
      list = list.filter(r => ids.includes(r.school_id))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.school_name?.toLowerCase().includes(q) ||
        r.activity_label?.toLowerCase().includes(q)
      )
    }
    return list
  }, [getFiltered, filters, search])

  const pendingCount = displayed.filter(r => r.status === 'submitted').length

  // ── CSV Export ──────────────────────────────────────────────────────────────

  function handleExport() {
    downloadCSV(`laporan-gas-${filters.period ?? 'semua'}.csv`, displayed, [
      { key: 'school_name',       label: 'Nama Sekolah' },
      { key: 'school_district',   label: 'Kecamatan' },
      { key: 'activity_label',    label: 'Jenis Kegiatan' },
      { key: 'report_period',     label: 'Periode' },
      { key: 'participant_count', label: 'Jumlah Peserta' },
      { key: 'status',            label: 'Status' },
      { key: 'teacher_name',      label: 'Guru' },
      { key: 'submitted_at',      label: 'Dikirim' },
      { key: 'validated_at',      label: 'Divalidasi' },
      { key: 'admin_notes',       label: 'Catatan Admin' },
    ])
    toast.success(`${displayed.length} laporan diekspor.`)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Semua Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {displayed.length} laporan
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {pendingCount} menunggu validasi
              </span>
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<Download size={14} />}
          onClick={handleExport}
          disabled={displayed.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ReportFilterBar
          filters={filters}
          onChange={(key, value) => applyFilters({ [key]: value })}
          schools={schoolsData.map(s => ({ id: s.id, name: s.name }))}
          regions={regionsData}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {/* Table with built-in pagination via DataTable */}
      <Card noPadding>
        <DataTable
          columns={COLUMNS}
          data={displayed}
          loading={loading}
          emptyMessage="Tidak ada laporan ditemukan"
          pageSize={20}
          onRowClick={(row) => navigate(`/app/admin/reports/${row.id}`)}
        />
      </Card>
    </div>
  )
}
