import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'

type RowData = {
  id?: string | number
  title?: string
  country?: {
    title?: string
  }
  status?: string
  [key: string]: unknown
}

export const useColumns = () => {
  return React.useMemo<ColumnDef<RowData, unknown>[]>(
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
            <span>{String(row?.original?.country?.title)}</span>
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
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-800"></div>
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
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-800"></div>
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
}

// These handlers need to be defined in the parent component and passed somehow
// For simplicity, they are placed here but will be handled differently
const handleEdit = (row: RowData) => {
  // Placeholder, this will be handled in the table component
}

const handleDelete = (id: string) => {
  // Placeholder
}
