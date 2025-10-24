'use client'

import React, { useState, useEffect } from 'react'
import DataTable, { TableColumn } from 'react-data-table-component'
import { MdOutlineFilterList, MdOutlineFilterListOff } from 'react-icons/md'
import ExportSelectedFields from './ExportSelectedFields'

interface FilterObject {
  title: string
  value: string
  type?: 'date'
}

interface FilterBySelectOption {
  _id?: string
  [key: string]: unknown
}

interface FilterBySelect {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options?: FilterBySelectOption[]
  placeholder?: string
  matchField?: string
  renderField?: string
}

interface CustomTableBaseProps<T extends Record<string, unknown>> {
  filterBySelect?: FilterBySelect
  name: string
  data: T[]
  columns: TableColumn<T>[]
  count?: number
  isLoading?: boolean
  page: number
  limit: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  filter?: FilterObject
  query?: string
  setFilter?: (filter: FilterObject) => void
  filterByDate?: { startDate: string; endDate: string }
  setFilterByDate?: (dates: { startDate: string; endDate: string }) => void
  setQuery?: (query: string) => void
  setSort?: (sort: string) => void
  setOrder?: (order: 'ascending' | 'descending') => void
  filterObject?: FilterObject[]
  header?: boolean
  exportUrl?: string
  showSearch?: boolean
  apiUrlExportPdf?: string
  apiUrlExportExcel?: string
}

export default function CustomTable<T extends Record<string, unknown>>({
  filterBySelect,
  name,
  data,
  columns,
  count = 10,
  isLoading = false,
  page,
  limit,
  setPage,
  setLimit,
  filter,
  setFilter,
  filterByDate,
  setFilterByDate,
  setQuery,
  setSort,
  setOrder,
  filterObject,
  header = true,
  exportUrl,
  showSearch = true,
  apiUrlExportPdf,
  apiUrlExportExcel,
}: CustomTableBaseProps<T>) {
  const [search, setSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      setQuery?.(search)
    }, 500)
    return () => clearTimeout(timeout)
  }, [search, setPage, setQuery])

  return (
    <div className="shadow bg-white rounded-lg">
      {/* Header */}
      {header && (
        <div className="flex flex-wrap justify-between items-center gap-2 px-3 py-3">
          <div className="flex flex-wrap gap-2">
            {exportUrl && (
              <ExportSelectedFields
                count={count}
                name={name}
                // ExportSelectedFields expects columns with name/key/export fields.
                // We derive a minimal shape from the provided columns.
                columns={(
                  columns as unknown as Array<{ name?: string | number | React.ReactNode; selector?: unknown }>
                ).map((c) => {
                  const name =
                    typeof c?.name === 'string' || typeof c?.name === 'number'
                      ? String(c.name)
                      : typeof c?.selector === 'function'
                        ? 'Column'
                        : 'Column'
                  return { name, key: name, export: true }
                })}
                exportUrl={exportUrl}
                apiUrlExportPdf={apiUrlExportPdf}
                apiUrlExportExcel={apiUrlExportExcel}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdown */}
            {filterObject && setFilter && setFilterByDate && (
              <div className="relative group">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  onClick={() => {
                    setSearch('')
                    setFilterByDate({ startDate: '', endDate: '' })
                    setFilter(filterObject[0])
                  }}
                >
                  {filter === filterObject[0] ? (
                    <MdOutlineFilterListOff size={20} />
                  ) : (
                    <MdOutlineFilterList size={20} />
                  )}
                </button>
                <div className="absolute z-10 hidden group-hover:block bg-white border rounded shadow mt-1">
                  {filterObject.map((f) => (
                    <button
                      key={f.title}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-100 ${
                        filter?.value === f.value ? 'font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterByDate({ startDate: '', endDate: '' })
                        setFilter(f)
                      }}
                    >
                      {f.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter by Select */}
            {filterBySelect && (
              <select
                value={filterBySelect.value}
                onChange={filterBySelect.onChange}
                className="border rounded px-2 py-1"
              >
                <option value="">{filterBySelect.placeholder}</option>
                {filterBySelect.options?.map((option) => {
                  const key = option?._id ?? String(option?.['id'] ?? '')
                  const matchKey = filterBySelect.matchField ?? ''
                  const renderKey = filterBySelect.renderField ?? ''
                  const optionValue = String((option?.[matchKey] as string | number | undefined) ?? '')
                  const optionLabel = String((option?.[renderKey] as string | number | undefined) ?? '')
                  return (
                    <option key={key} value={optionValue}>
                      {optionLabel}
                    </option>
                  )
                })}
              </select>
            )}

            {/* Search */}
            {showSearch && filter?.type !== 'date' && (
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={filter?.title ? `Search on ${filter.title}` : 'Search...'}
                className="border rounded px-2 py-1"
              />
            )}

            {/* Date filter */}
            {showSearch && filter?.type === 'date' && setFilterByDate && filterByDate && (
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1">
                  From:
                  <input
                    type="date"
                    value={filterByDate.startDate}
                    onChange={(e) => setFilterByDate({ ...filterByDate, startDate: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex items-center gap-1">
                  To:
                  <input
                    type="date"
                    value={filterByDate.endDate}
                    onChange={(e) => setFilterByDate({ ...filterByDate, endDate: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        pagination
        paginationServer
        persistTableHead
        progressPending={isLoading}
        paginationTotalRows={count}
        paginationDefaultPage={page}
        paginationPerPage={limit}
        onChangePage={(p) => setPage(p)}
        onChangeRowsPerPage={(r, p) => {
          setLimit(r)
          setPage(p)
        }}
        sortServer
        onSort={(column, direction) => {
          if (!column?.name) return

          const nameStr = String(column.name)
          const stringWithoutSpace = nameStr.split(' ').join('')
          const camelCaseName = stringWithoutSpace.charAt(0).toLowerCase() + stringWithoutSpace.slice(1)

          setSort?.(camelCaseName)
          setOrder?.(direction === 'asc' ? 'ascending' : 'descending')
        }}
        noDataComponent={
          <div className="flex justify-center items-center w-full h-[40vh] bg-gray-400 text-white text-lg">
            Data not found
          </div>
        }
        columns={columns}
        data={data || []}
        customStyles={customStyles}
        progressComponent={<ProgressComponent />}
      />
    </div>
  )
}

// Tailwind placeholder for loading
function ProgressComponent() {
  return (
    <div className="w-full h-full p-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-8 mb-2 bg-gray-300 animate-pulse rounded"></div>
      ))}
    </div>
  )
}

// Custom styles placeholder (you can adjust further)
const customStyles = {
  headRow: {
    style: {
      borderTop: '1px solid #dee2e6',
      backgroundColor: '#f8f9fa',
    },
  },
}
