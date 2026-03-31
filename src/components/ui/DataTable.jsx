/**
 * DataTable — sortable, filterable table built on TanStack Table v8.
 *
 * Props:
 *   columns      ColumnDef[]  — TanStack column definitions
 *   data         object[]
 *   searchable   boolean  — show top search box (default false)
 *   searchPlaceholder string
 *   loading      boolean
 *   emptyMessage string
 *   onRowClick   (row) => void  (optional)
 *   pageSize     number  (default 10)
 */
import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Spinner from './Spinner'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data = [],
  searchable      = false,
  searchPlaceholder = 'Cari...',
  loading         = false,
  emptyMessage    = 'Tidak ada data',
  onRowClick,
  pageSize        = 10,
  className       = '',
}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting,      setSorting]      = useState([])

  const table = useReactTable({
    data,
    columns,
    state:          { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange:      setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="input pl-8 py-1.5 text-xs"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="th whitespace-nowrap"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc'  ? <ChevronUp size={12} /> :
                          header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                          <ChevronsUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <Spinner center />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyMessage} compact />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`hover:bg-alabaster transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="td">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
          <span>
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
            {' '}({table.getFilteredRowModel().rows.length} data)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
