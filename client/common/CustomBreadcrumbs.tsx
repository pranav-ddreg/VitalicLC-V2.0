'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { IoIosArrowForward } from 'react-icons/io'

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
      <ol className="flex  text-sm text-gray-500">
        {list.map((item, index) => {
          const isLast = index === list.length - 1

          return (
            <li key={index} className="flex items-center">
              {item.link && !isLast ? (
                <button
                  onClick={() => router.push(item.link!)}
                  className="text-blue-600 font-medium hover:underline focus:outline-none"
                >
                  {item.name}
                </button>
              ) : (
                <span className="text-gray-700 font-medium">{item.name}</span>
              )}
              {!isLast && <IoIosArrowForward className="text-gray-500 mx-2" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CustomBreadcrumbs
