import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { RotateCcw, Trash2 } from 'lucide-react'

type RowData = {
  id?: string | number
  deletedBy?: {
    user?: {
      fullName?: string
    }
    time?: Date
  }
  product?: {
    title?: string
  }
  [key: string]: unknown
}

export const useColumns = () => {
  return React.useMemo<ColumnDef<RowData, unknown>[]>(
    () => [
      {
        accessorKey: 'product',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product Name" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.product?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'deletedBy',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Deleted By" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[120px] flex gap-2 py-2 ">
            <span>{String(row?.original?.deletedBy?.user?.fullName)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'deletedBy.time',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Deleted on" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[120px] flex gap-2 py-2">
            <span>
              {String(row?.original?.deletedBy?.time ? moment(row?.original?.deletedBy?.time).format('LLL') : 'N/A')}
            </span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'action',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" className="text-neutral-500" />,
        cell: () => (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className="p-2 cursor-pointer text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                title="Restore"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Restore
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-800"></div>
              </div>
            </div>
            <div className="relative group">
              <button
                className="p-2 text-red-700 cursor-pointer bg-red-100 hover:bg-red-200 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
                title="Delete Permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Delete Permanently
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
