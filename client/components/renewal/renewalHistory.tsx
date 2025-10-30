'use client'

import { DataTable } from '@/common/table/data-table'
import React from 'react'
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { useDebounce } from '@/hooks/use-debounce'
import axios from 'axios'
import useSWR from 'swr'
import { useRenewalHistoryColumns } from './renewalHistoryColumns'

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

const fetcher = async (url: string): Promise<ApiResponse | null> => {
  if (!url || url.includes('null')) return null
  const { data } = await axios.get(url)
  return data
}

const RenewalHistoryTable: React.FC<{
  preregistrationId: string
  onEdit: (rowData: RowData) => void // 👈 receive onEdit prop from parent
}> = ({ preregistrationId, onEdit }) => {
  // pagination + filters
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sort, setSort] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [query, setQuery] = React.useState<string>('')
  const searchQuery = useDebounce(query, 500)

  // API URL
  const apiUrl = `/api/renewal/${preregistrationId}?page=${
    pagination.pageIndex + 1
  }&limit=${pagination.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${
    sort[0]?.id || ''
  }&order=${sort[0]?.desc ? 'descending' : 'ascending'}&startDate=${''}&endDate=${''}`

  const { data: renewalHistory, isLoading } = useSWR<ApiResponse | null>(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  // 🧩 Pass onEdit into the hook
  const columns = useRenewalHistoryColumns(onEdit)

  console.log('renewalHistory:', renewalHistory)
  console.log('apiUrl:', apiUrl)
  console.log('preregistrationId:', preregistrationId)

  return (
    <div className="mb-3">
      <h2 className="font-bold mb-2">Renewal History</h2>
      <DataTable
        columns={columns}
        data={renewalHistory?.data?.data || []}
        pagination={pagination}
        setPagination={setPagination}
        count={renewalHistory?.data?.count || 0}
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
    </div>
  )
}

export default RenewalHistoryTable

// 'use client'
// import { DataTable } from '@/common/table/data-table'
// import React from 'react'
// import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'

// import { useDebounce } from '@/hooks/use-debounce'
// type RowData = {
//   id?: string | number
//   [key: string]: unknown
// }
// type ApiResponse = {
//   code: string
//   data: {
//     data: RowData[]
//     count: number
//   }
// }
// import axios from 'axios'
// import useSWR from 'swr'
// import { useRenewalHistoryColumns } from './renewalHistoryColumns'
// const fetcher = async (url: string): Promise<ApiResponse | null> => {
//   if (!url || url.includes('null')) return null
//   const { data } = await axios.get(url)
//   return data
// }

// const RenewalHistoryTable: React.FC<{ preregistrationId: string }> = ({ preregistrationId }) => {
//   const columns = useRenewalHistoryColumns()
//   const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

//   const [sort, setSort] = React.useState<SortingState>([])
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
//   const [query, setQuery] = React.useState<string>('')
//   const searchQuery = useDebounce(query, 500)

//   // const apiUrl = `/api/variation?page=${pagination?.pageIndex + 1}&limit=${pagination?.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${sort[0]?.id}&order=${
//   //   sort[0]?.desc ? 'descending' : 'ascending'
//   // }&startDate=${''}&endDate=${''}`

//   const apiUrl = `/api/renewal/${preregistrationId}?page=${pagination?.pageIndex + 1}&limit=${pagination?.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${sort[0]?.id}&order=${
//     sort[0]?.desc ? 'descending' : 'ascending'
//   }&startDate=${''}&endDate=${''}`

//   const { data: renewalHistory, isLoading } = useSWR<ApiResponse | null>(apiUrl, fetcher, {
//     keepPreviousData: true,
//   })

//      console.log(renewalHistory, 'renewalHistory Data')
//      console.log("apiUrl:", apiUrl)
// console.log("preregistrationId:", preregistrationId)

//   return (
//     <>
//      <div className="mb-3 d-flex justify-content-between align-items-center">
//         <h2 className="font-bold">Renewal History</h2>
//       <DataTable
//         columns={columns}
//         data={renewalHistory?.data?.data || []}
//         pagination={pagination}
//         setPagination={setPagination}
//         count={renewalHistory?.data?.count || 0}
//         sorting={sort}
//         setSorting={setSort}
//         columnFilters={columnFilters}
//         setColumnFilters={setColumnFilters}
//         query={query}
//         setQuery={setQuery}
//         isLoading={isLoading}
//         showSearch={true}
//         showView={true}
//       />
//       </div>
//     </>
//   )
// }

// export default RenewalHistoryTable
