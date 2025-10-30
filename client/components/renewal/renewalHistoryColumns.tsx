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

// "use client";

// import { DataTableColumnHeader } from "@/common/table/data-table-column-header";
// import React from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import moment from "moment";

// type RowData = {
//   id?: string | number;
//   stage?: string;
//   product?: { title?: string };
//   country?: { title?: string };
//   approval?: string;
//   POS?: string;
//   notificationNumber?: string;
//   renewDate?: Date;
//   [key: string]: unknown;
// };

// export const useRenewalHistoryColumns = (
//   onEdit: (rowData: RowData) => void
// ) => {
//   return React.useMemo<ColumnDef<RowData, unknown>[]>(
//     () => [
//       {
//         accessorKey: "stage",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Stage"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.stage || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "product",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Product Name"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.product?.title || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "country",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Country"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.country?.title || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "approval",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Approval"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.approval || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "POS",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="POS"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.POS || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "notificationNumber",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Notification Number"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row.original?.notificationNumber || "N/A")}</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "renewDate",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Renewal Date"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>
//               {row.original?.renewDate
//                 ? moment(row.original.renewDate).format("LLL")
//                 : "N/A"}
//             </span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "action",
//         header: ({ column }) => (
//           <DataTableColumnHeader
//             column={column}
//             title="Action"
//             className="text-neutral-500"
//           />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[100px] flex gap-2 py-2">
//             <button
//               onClick={() => onEdit(row.original)}
//               className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
//             >
//               Edit
//             </button>
//           </div>
//         ),
//       },
//     ],
//     [onEdit]
//   );
// };

// import { DataTableColumnHeader } from '@/common/table/data-table-column-header'
// import React from 'react'
// import { ColumnDef } from '@tanstack/react-table'
// import moment from 'moment'

// type RowData = {
//   id?: string | number
//   deletedBy?: {
//     user?: {
//       fullName?: string
//     }
//     time?: Date
//   }
//   product?: {
//     title?: string
//   }
//   country?: {
//     title?: string
//   }
//   renewalDate?: Date
//   remark?: Date
//   [key: string]: unknown
// }

// export const useRenewalHistoryColumns = () => {
//   return React.useMemo<ColumnDef<RowData, unknown>[]>(
//     () => [
//       {
//         accessorKey: 'stage',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="Stage" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.stage)}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//     //   {
//     //     accessorKey: 'title',
//     //     header: ({ column }) => (
//     //       <DataTableColumnHeader column={column} title="Title" className="text-neutral-500" />
//     //     ),
//     //     cell: ({ row }) => (
//     //       <div className="w-[200px] flex gap-2 py-2">
//     //         <span>{String(row?.original?.title)}</span>
//     //       </div>
//     //     ),
//     //     enableSorting: true,
//     //     enableHiding: true,
//     //   },
//       {
//         accessorKey: 'product',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="Product Name" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.product?.title)}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },

//       {
//         accessorKey: 'country',
//         header: ({ column }) => <DataTableColumnHeader column={column} title="Country" className="text-neutral-500" />,
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original.country?.title)}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//     //      {
//     //     accessorKey: 'category',
//     //     header: ({ column }) => (
//     //       <DataTableColumnHeader column={column} title="Category" className="text-neutral-500" />
//     //     ),
//     //     cell: ({ row }) => (
//     //       <div className="w-[200px] flex gap-2 py-2">
//     //         <span>{String(row?.original?.category)}</span>
//     //       </div>
//     //     ),
//     //     enableSorting: true,
//     //     enableHiding: true,
//     //   },
//          {
//         accessorKey: 'approval',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="Approval" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.approval)}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//          {
//         accessorKey: 'POS',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="POS" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.POS)}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//          {
//         accessorKey: 'notificationNumber',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="Notification Number" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.notificationNumber || 'N/A')}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//       {
//         accessorKey: 'renewDate',
//         header: ({ column }) => (
//           <DataTableColumnHeader column={column} title="Renewal Date" className="text-neutral-500" />
//         ),
//         cell: ({ row }) => (
//           <div className="w-[200px] flex gap-2 py-2">
//             <span>{String(row?.original?.renewDate ? moment(row?.original?.renewDate).format('LLL') : 'N/A ')}</span>
//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//     //      {
//     //     accessorKey: 'expApprovalDate',
//     //     header: ({ column }) => (
//     //       <DataTableColumnHeader column={column} title="ExpApprovalDate" className="text-neutral-500" />
//     //     ),
//     //     cell: ({ row }) => (
//     //       <div className="w-[200px] flex gap-2 py-2">
//     //         <span>{String(row?.original?.expApprovalDate ? moment(row?.original?.expApprovalDate).format('LLL') : 'N/A ')}</span>
//     //       </div>
//     //     ),
//     //     enableSorting: true,
//     //     enableHiding: true,
//     //   },
//     //   {
//     //     accessorKey: 'approvalDate',
//     //     header: ({ column }) => (
//     //       <DataTableColumnHeader column={column} title="Approval Date" className="text-neutral-500" />
//     //     ),
//     //     cell: ({ row }) => (
//     //       <div className="w-[200px] flex gap-2 py-2">
//     //         <span>{String(row?.original?.approvalDate ? moment(row?.original?.approvalDate).format('LLL') : 'N/A')}</span>
//     //       </div>
//     //     ),
//     //     enableSorting: true,
//     //     enableHiding: true,
//     //   },

//       {
//         accessorKey: 'action',
//         header: ({ column }) => <DataTableColumnHeader column={column} title="Action" className="text-neutral-500" />,
//         cell: () => (
//           <div className="w-[100px] flex gap-2 py-2">
//             <button className="text-red-500 hover:text-red-600">Edit</button>

//           </div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//       },
//     ],
//     []
//   )
// }
