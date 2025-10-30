import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
// import moment from 'moment'

type RowData = {
  id?: string | number
  role?: {
    title?: string
  }
  company?: {
    title?: string
  }
  deletedBy?: {
    user?: {
      fullName?: string
    }
    time?: Date
  }
  product?: {
    title?: string
  }
  permission?: string | unknown
  [key: string]: unknown
}

export const useColumns = () => {
  return React.useMemo<ColumnDef<RowData, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },

      {
        accessorKey: 'company',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.company?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'permissions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Permissions" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.permissions)}</span>
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
            <button className="text-red-500 hover:text-red-600">Edit</button>
            <button className="text-red-500 hover:text-red-600">Delete</button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )
}
