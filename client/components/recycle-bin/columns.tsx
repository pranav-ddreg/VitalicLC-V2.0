import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'

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
          <div className="w-[130px] flex gap-2 py-2">
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
          <div className="w-[130px] flex gap-2 py-2">
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
          <div className="w-[100px] flex gap-2 py-2">
            <button className="text-red-500 hover:text-red-600">Restore</button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )
}
