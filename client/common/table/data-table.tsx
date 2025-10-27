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
    onRowSelectionChange: setRowSelection,
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
      />
      <div className="rounded-md overflow-hidden  bg-white dark:bg-neutral-800 border dark:border-neutral-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {pagination && <TableHead className="text-neutral-500">S.no</TableHead>}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {pagination && <TableCell>{pagination.pageIndex * pagination.pageSize + row?.index + 1}</TableCell>}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[32rem] text-center">
                  {isLoading ? '' : 'No results.'}
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
