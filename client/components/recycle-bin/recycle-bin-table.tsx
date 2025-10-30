'use client'
import { DataTable } from '@/common/table/data-table'
import React from 'react'
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { useColumns } from './columns'
import { useDebounce } from '@/hooks/use-debounce'
import Header from '@/common/header'
import { Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const RecycleBinTable: React.FC = () => {
  const columns = useColumns()
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const [sort, setSort] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [query, setQuery] = React.useState<string>('')
  const searchQuery = useDebounce(query, 500)

  const handleDescriptionClick = () => {
    alert('Recycle Bin Description: This section contains deleted items that can be restored.')
  }

  const handleExportClick = () => {
    alert('Exporting recycle bin data.')
  }

  const apiUrl = `/api/recyclebin/get?page=${pagination?.pageIndex + 1}&limit=${pagination?.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${sort[0]?.id}&order=${
    sort[0]?.desc ? 'descending' : 'ascending'
  }&startDate=${''}&endDate=${''}`

  const { data: recycleBin, isLoading } = useSWR<ApiResponse | null>(apiUrl, fetcher, {
    keepPreviousData: true,
  })
  return (
    <>
      <Header
        title={'Recycle Bin'}
        description={'Manage your deleted items. You can restore items or permanently delete them here.'}
      >
        <div className="flex space-x-2">
          <Button
            onClick={handleDescriptionClick}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white cursor-pointer"
          >
            <Trash2 className="mr-1 h-8 w-8" />
            Empty Recycle Bin
          </Button>
          <Button
            onClick={handleExportClick}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer"
          >
            <Download className="mr-1 h-8 w-8" />
            Export
          </Button>
        </div>
      </Header>
      <DataTable
        columns={columns}
        data={recycleBin?.data?.data || []}
        pagination={pagination}
        setPagination={setPagination}
        count={recycleBin?.data?.count || 0}
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

export default RecycleBinTable
