'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

type BreadcrumbItem = {
  name: string
  link?: string
}

type CustomBreadcrumbsProps = {
  list: BreadcrumbItem[]
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ list }) => {
  const router = useRouter()

  return (
    <nav className="my-4" aria-label="breadcrumb">
      <ol className="flex space-x-2 text-sm text-gray-500">
        {list.map((item, index) => {
          const isLast = index === list.length - 1

          return (
            <li key={index} className="flex items-center">
              {item.link && !isLast ? (
                <button
                  onClick={() => router.push(item.link!)}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  {item.name}
                </button>
              ) : (
                <span className="text-gray-700 font-medium">{item.name}</span>
              )}
              {!isLast && <span className="mx-2">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CustomBreadcrumbs
