'use client'
import { DataTable } from '@/common/table/data-table'
import React, { useState, useMemo } from 'react'
import { PaginationState, SortingState, ColumnFiltersState, ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import { useDebounce } from '@/hooks/use-debounce'
import Header from '@/common/header'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import useSWR from 'swr'
import CustomModal from '@/common/CustomModal'
import ProductForm from './productForm'
import ProductInfoForm from './productInfoForm'
import CustomConfirm from '@/common/CustomConfirm'

type RowData = {
  id?: string | number
  title?: string | unknown
  country?:
    | {
        title?: string | unknown
      }
    | unknown
  status?: string | unknown
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

const ProductInfoTable: React.FC = () => {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const [sort, setSort] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [query, setQuery] = React.useState<string>('')
  const searchQuery = useDebounce(query, 500)

  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAdd = () => {
    setMode('add')
    setSelectedRow(null)
    setShowModal(true)
  }

  const handleEdit = (row: RowData) => {
    setMode('edit')
    setSelectedRow(row)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await axios.delete(`/api/product/${deleteId}`)
      mutate()
      setShowDeleteConfirm(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRow(null)
  }

  const apiUrl = `/api/product/get?page=${pagination?.pageIndex + 1}&limit=${pagination?.pageSize}&searchTitle=${''}&search=${searchQuery}&sort=${sort[0]?.id}&order=${
    sort[0]?.desc ? 'descending' : 'ascending'
  }&startDate=${''}&endDate=${''}`

  const {
    data: products,
    isLoading,
    mutate,
  } = useSWR<ApiResponse | null>(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  const columns = useMemo<ColumnDef<RowData, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[100px] flex gap-2 py-2">
            <span>{String(row?.original?.id)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product Name" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'country',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Country" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[150px] flex gap-2 py-2">
            <span>{String((row?.original?.country as any)?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[100px] flex gap-2 py-2">
            <span>{String(row?.original?.status)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'action',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className="p-2 cursor-pointer text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                title="Edit"
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Edit
              </div>
            </div>
            <div className="relative group">
              <button
                className="p-2 text-red-700 cursor-pointer bg-red-100 hover:bg-red-200 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                title="Delete"
                onClick={() => handleDelete(String(row.original.id))}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Delete
              </div>
            </div>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  return (
    <>
      <Header title={'Product Info by Country'} description={'Manage product information with full CRUD operations.'}>
        <div className="flex space-x-2">
          <Button
            onClick={handleAdd}
            className="bg-sky-800 hover:bg-sky-800/90 dark:bg-sky-700 dark:hover:bg-sky-700/90 text-white cursor-pointer"
          >
            <Plus className="mr-1 h-8 w-8" />
            Add New
          </Button>
        </div>
      </Header>
      <DataTable
        columns={columns}
        data={products?.data?.data || []}
        pagination={pagination}
        setPagination={setPagination}
        count={products?.data?.count || 0}
        sorting={sort}
        setSorting={setSort}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        query={query}
        setQuery={setQuery}
        isLoading={isLoading}
        showSearch={true}
        showView={false}
      />
      {showModal && (
        <CustomModal show={showModal} setShow={setShowModal} title={`${mode === 'add' ? 'Add' : 'Edit'} Product`}>
          {mode === 'add' ? (
            <ProductForm
              onSuccess={() => {
                handleCloseModal()
                mutate()
              }}
            />
          ) : (
            <ProductInfoForm
              data={selectedRow}
              onSuccess={() => {
                handleCloseModal()
                mutate()
              }}
            />
          )}
        </CustomModal>
      )}
      {showDeleteConfirm && (
        <CustomConfirm
          show={showDeleteConfirm}
          setShow={setShowDeleteConfirm}
          title="Delete Product"
          content="Are you sure you want to delete this product?"
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default ProductInfoTable
