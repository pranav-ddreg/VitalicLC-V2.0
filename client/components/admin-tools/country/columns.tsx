import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'

type RowData = {
  id?: string | number
  logo?: {
    Location?: string
  }
  title?: string
  email?: string
  secondaryEmail?: string
  plan?: {
    plan?: string
  }
  purchasedOn?: string | Date
  expiredOn?: string | Date
  [key: string]: unknown
}

export const useColumns = () => {
  return React.useMemo<ColumnDef<RowData, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.title)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },

      {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.email)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'secondaryEmail',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Secondary Email" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.secondaryEmail ? row?.original?.secondaryEmail : 'N/A')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },

      {
        accessorKey: 'plan',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.plan?.plan)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },

      {
        accessorKey: 'purchasedOn',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Purchased On" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.purchasedOn ? moment(row?.original?.purchasedOn).format('L') : 'N/A')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },

      {
        accessorKey: 'expiredOn',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expired On" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.expiredOn ? moment(row?.original?.expiredOn).format('L') : 'N/A')}</span>
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
