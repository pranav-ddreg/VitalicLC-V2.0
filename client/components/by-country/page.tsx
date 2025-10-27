'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { IoEarth } from 'react-icons/io5'
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import usePagination from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'

interface Country {
  _id: string
  title: string
  product: number
}

const ProductsByCountry: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sortBy, setSortBy] = useState(searchParams.get('order') || 'ascending')
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const searchQuery = useDebounce(query, 500)

  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const apiUrl = `/api/country/get?limit=12&search=${searchQuery}&order=${sortBy}&sort=title&listLess=true`

  const { list, isReachingEnd, isLoading, loadingMore, size, setSize } = usePagination<Country>(apiUrl)

  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isReachingEnd) {
          setSize(size + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loadingMore, isReachingEnd, size, setSize]
  )

  useEffect(() => {
    const searchQuery = searchParams.get('search')
    const orderQuery = searchParams.get('order')

    setQuery(searchQuery || '')
    setSortBy(orderQuery || 'ascending')
  }, [searchParams])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (value) params.set('order', value)
    else params.delete('order')
    router.replace(`${window.location.pathname}?${params.toString()}`)
    setSortBy(value)
    setShowSortDropdown(false)
  }

  return (
    <>
      <CustomBreadcrumbs
        list={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product By Country', link: '' },
        ]}
      />

      <div className="my-4 flex justify-start items-center">
        <h4 className="text-2xl font-semibold">Product By Country</h4>
      </div>

      <div>
        <div className="relative mb-2">
          <span className="absolute left-0 py-3 pl-2 ml-1 pr-2">
            <BsSearch size={20} />
          </span>
          <input
            className="border border-gray-300 rounded w-full pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for results..."
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              const params = new URLSearchParams(searchParams.toString())
              params.set('search', e.target.value)
              router.replace(`?${params.toString()}`)
            }}
          />
        </div>

        {/* ✅ Sort Dropdown FIXED */}
        <div className="flex justify-end items-center mb-3 relative z-20">
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex justify-between items-center w-full rounded border px-3 py-2 bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={() => setShowSortDropdown((prev) => !prev)}
            >
              Sort By
              <svg
                className={`ml-2 -mr-1 h-5 w-5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showSortDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                style={{ top: '100%' }}
              >
                {[
                  {
                    key: 'Ascending',
                    value: 'ascending',
                    icon: <AiOutlineSortAscending size={20} />,
                  },
                  {
                    key: 'Descending',
                    value: 'descending',
                    icon: <AiOutlineSortDescending size={20} />,
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSortChange(item.value)}
                    className={`flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      sortBy === item.value ? 'bg-gray-200 font-semibold' : ''
                    }`}
                  >
                    {item.key}
                    <span className="ml-2">{item.icon}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Country List */}
      {Array.isArray(list) ? (
        list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {list.map((country, index) => (
              <motion.div
                key={country._id}
                ref={list.length === index + 1 ? lastElementRef : null}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="shadow p-4 rounded h-full flex flex-col justify-between cursor-pointer"
                  onClick={() => router.push(`/by-countries/${country._id}`)}
                >
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-blue-500 rounded-full">
                      <IoEarth size={20} />
                    </span>
                    <div className="text-lg font-semibold truncate flex-1">{country.title}</div>
                  </div>
                  <div className="mt-3 flex justify-between items-center gap-1">
                    <div className="font-medium text-sm">
                      {country.product || ''}{' '}
                      {country.product === 0 ? 'No products' : country.product === 1 ? 'product' : 'products'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-[50vh] rounded bg-gray-400 flex justify-center items-center">
            <div className="text-white text-xl">There are no products added.</div>
          </div>
        )
      ) : null}

      {/* Loading Placeholder */}
      {(isLoading || loadingMore) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="shadow p-4 rounded animate-pulse bg-white flex flex-col gap-4">
              <div className="h-6 bg-gray-300 rounded w-full"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-red-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End Message */}
      {isReachingEnd && (
        <div className="flex justify-center items-center font-medium py-2 my-3 bg-gray-100">
          You have viewed all products...
        </div>
      )}
    </>
  )
}

export default ProductsByCountry
