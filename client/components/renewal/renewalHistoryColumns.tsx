import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'

export type RowData = {
  id?: string | number
  stage?: string
  product?: { title?: string }
  country?: { title?: string }
  approval?: string
  POS?: string
  notificationNumber?: string
  renewDate?: Date | string
  [key: string]: unknown
}

export const useRenewalHistoryColumns = (onEdit: (rowData: RowData) => void): ColumnDef<RowData, unknown>[] => {
  return React.useMemo<ColumnDef<RowData, unknown>[]>(
    () => [
      {
        accessorKey: 'stage',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.stage)}</span>
          </div>
        ),
      },
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
      },
      {
        accessorKey: 'country',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Country" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.country?.title)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'approval',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Approval" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.approval)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'POS',
        header: ({ column }) => <DataTableColumnHeader column={column} title="POS" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.POS)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'notificationNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Notification Number" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.notificationNumber || 'N/A')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'renewDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Renewal Date" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{row?.original?.renewDate ? moment(row?.original?.renewDate).format('LLL') : 'N/A'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[100px] flex gap-2 py-2">
            <button className="text-blue-600 hover:text-blue-700" onClick={() => onEdit(row.original)}>
              Edit
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
  )
}
