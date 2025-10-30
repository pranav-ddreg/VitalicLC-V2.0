'use client'
import { DataTable } from '@/common/table/data-table'
import React from 'react'
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { useColumns } from './columns'
import { useDebounce } from '@/hooks/use-debounce'
type RowData = {
  id?: string | number
  [key: string]: unknown
}
type ApiResponse = {
  code: string
  data: {
    data: RowData[]
    count: number
  }
}
import axios from 'axios'
import useSWR from 'swr'
const fetcher = async (url: string): Promise<ApiResponse | null> => {
  if (!url || url.includes('null')) return null
  const { data } = await axios.get(url)
  return data
}

const RenewalTable: React.FC = () => {
  const columns = useColumns()
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const [sort, setSort] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [query, setQuery] = React.useState<string>('')
  const searchQuery = useDebounce(query, 500)

  const apiUrl = `/api/renewal?page=${pagination?.pageIndex + 1}&limit=${pagination?.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${sort[0]?.id}&order=${
    sort[0]?.desc ? 'descending' : 'ascending'
  }&startDate=${''}&endDate=${''}`

  const { data: preregistration, isLoading } = useSWR<ApiResponse | null>(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  console.log(preregistration, 'Recycle Bin Data')

  return (
    <>
      <DataTable
        columns={columns}
        data={preregistration?.data?.data || []}
        pagination={pagination}
        setPagination={setPagination}
        count={preregistration?.data?.count || 0}
        sorting={sort}
        setSorting={setSort}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        query={query}
        setQuery={setQuery}
        isLoading={isLoading}
        showSearch={true}
        showView={true}
      />
    </>
  )
}

export default RenewalTable
