'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  PaginationState,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter, useSearchParams } from 'next/navigation'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { Spinner } from '@/components/ui/spinner'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  count: number
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  facetedFilters?: {
    name: string
    title: string
    options: { label: string; value: string }[]
    isMultiple: boolean
    matchField: string
    renderField: string
  }[]
  query?: string
  setQuery?: (query: string) => void
  isLoading?: boolean
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  mutate?: () => void
  params?: never
  role?: string
  currentUser?: never
  info?: never
  folderName?: string
  showSearch?: boolean
  showView?: boolean
  export?: () => void
}

export function DataTable<TData>({
  columns,
  data,
  pagination,
  setPagination,
  count,
  sorting,
  setSorting,
  facetedFilters,
  query,
  setQuery,
  isLoading,
  columnFilters,
  setColumnFilters,
  mutate,
  params,
  role,
  currentUser,
  info,
  folderName,
  showSearch = true,
  showView = true,
  export: exportData,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const searchParams = useSearchParams()
  const router = useRouter()

  const page = parseInt(searchParams.get('page') || '') || 0
  const limit = parseInt(searchParams.get('limit') || '') || 10

  const table = useReactTable({
    data,
    columns,
    rowCount: count,
    meta: {
      mutate: mutate,
      role: role,
      currentUser: currentUser,
      folderName: folderName,
      params: params,
      info: info,
    },
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    manualPagination: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  React.useEffect(() => {
    // Sync table's pagination state only if different from URL
    setPagination({
      pageIndex: page,
      pageSize: limit,
    })
  }, [page, limit, setPagination])

  const updatedCurrentPage = () => {
    const updatedPageIndex = table.getState().pagination.pageIndex
    const updatePageSize = table.getState().pagination?.pageSize

    router.push(`?page=${updatedPageIndex}&limit=${updatePageSize}`)
  }
  return (
    <div className="space-y-4 mt-5">
      <DataTableToolbar
        showView={showView}
        showSearch={showSearch}
        table={table}
        query={query || ''}
        setQuery={setQuery || ((query: string) => console.log(query))}
        facetedFilters={facetedFilters}
        export={exportData}
      />
      <div className="rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <Table>
          <TableHeader className="bg-sky-100 dark:bg-neutral-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-sky-100 dark:border-neutral-600  hover:bg-transparent"
              >
                {pagination && (
                  <TableHead className="font-semibold text-neutral-800 dark:text-neutral-200">S.no</TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="font-semibold text-neutral-800 dark:text-neutral-200"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel()?.rows?.length ? (
              table.getRowModel()?.rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
                >
                  {pagination && (
                    <TableCell className="text-neutral-600 dark:text-neutral-300">
                      {pagination.pageIndex * pagination.pageSize + row?.index + 1}
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-neutral-700 dark:text-neutral-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-96 text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center ">
                      <Spinner className="text-sky-500 size-16 mb-4" />
                      <span className="text-sky-700 font-medium text-xl">Loading...</span>
                    </div>
                  ) : (
                    'No results.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} updatedCurrentPage={updatedCurrentPage} />}
    </div>
  )
}
