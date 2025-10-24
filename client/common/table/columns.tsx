'use client'

import { ColumnDef } from '@tanstack/react-table' // Type your columns for better DX
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
// import { DataTableRowActions } from "./data-table-row-actions";

// Example type for a row
type Task = {
  id: string
  title: string
  status: string
  priority: string
  label: string
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id', // field in your data
    header: ({ column }) => <DataTableColumnHeader column={column} title="Task" className="" />,
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" className="" />,
    cell: ({ row }) => {
      const label = [{ label: 'A', value: 'a' }].find((l) => l.value === row.original.label)
      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">{row.getValue('title')}</span>
        </div>
      )
    },
    // Optional: you could add filtering/sorting logic here
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" className="" />,
    cell: ({ row }) => {
      const status = [{ label: 'A', value: 'a', icon: X }].find((s) => s.value === row.getValue('status'))
      return status ? (
        <div className="flex items-center w-[100px]">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      ) : null
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" className="" />,
    cell: ({ row }) => {
      const priority = [{ label: 'A', value: 'a', icon: X }].find((p) => p.value === row.getValue('priority'))
      return priority ? (
        <div className="flex items-center">
          {priority.icon && <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{priority.label}</span>
        </div>
      ) : null
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  //   {
  //     id: "actions",
  //     cell: ({ row }) => <DataTableRowActions row={row} />,
  //     enableHiding: false,
  //   },
]
