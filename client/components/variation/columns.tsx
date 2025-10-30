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
  country?: {
    title?: string
  }
  renewalDate?: Date
  remark?: Date
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
        accessorKey: 'localPartner',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Local Partner" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.localPartner || 'N/A')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'apiName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="API Name" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original?.apiName || 'N/A ')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'country.title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Country" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original.country?.title || 'N/A ')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'submissionDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Submission Date" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[200px] flex gap-2 py-2">
            <span>{String(row?.original.submissionDate || 'N/A ')}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'registrationDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Approval Date" className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.registrationDate)}</span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'renewalDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Renewal Date    " className="text-neutral-500" />
        ),
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>
              {String(row?.original?.deletedBy?.time ? moment(row?.original?.renewalDate).format('LLL') : 'N/A')}
            </span>
          </div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'remark',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Remark" className="text-neutral-500" />,
        cell: ({ row }) => (
          <div className="w-[130px] flex gap-2 py-2">
            <span>{String(row?.original?.deletedBy?.time ? moment(row?.original?.remark).format('LLL') : 'N/A')}</span>
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
        enableSorting: true,
        enableHiding: true,
      },
    ],
    []
  )
}
