'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { GoStack } from 'react-icons/go'
import { BiSolidEdit } from 'react-icons/bi'
import { MdDeleteOutline } from 'react-icons/md'
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import usePagination from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/use-debounce'
import ProductForm from './productForm'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import CustomConfirm from '@/common/CustomConfirm'

// ✅ Types
interface ProductType {
  _id: string
  title: string
  country: number
}

interface ProductFormValues {
  title: string
}

const Product: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<string>(searchParams.get('order') || '')
  const [query, setQuery] = useState<string>(searchParams.get('search') || '')
  const searchQuery = useDebounce(query, 500)
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [rowData, setRowData] = useState<Partial<ProductFormValues> | null>(null) // ✅ fixed type
  const [showModal, setShowModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const superAdmin = true // ✅ simplified
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false)
  const apiUrl = `/api/product/get?limit=12&search=${searchQuery}&order=${sortBy}&sort=${sortBy === '' ? '' : 'title'}`
  const { list, isReachingEnd, isLoading, loadingMore, size, setSize, mutate } = usePagination(apiUrl)
  const handleEdit = (event: React.MouseEvent, row: ProductType) => {
    event.stopPropagation()
    setId(row._id)
    setMode('edit')
    setRowData({ title: row.title }) // ✅ only send form fields
    setShowModal(true)
  }
  const handleDeleteClick = (event: React.MouseEvent, productId: string) => {
    event.stopPropagation()
    setId(productId)
    setConfirmModal(true)
  }
  const handleDelete = async () => {
    if (!id) return
    try {
      await axios.delete(`/api/product/delete/${id}`)
      mutate()
      setConfirmModal(false)
      toast.success('Deleted successfully')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Error deleting')
      } else {
        toast.error('Unexpected error deleting')
      }
    }
  }
  const lastElementRef = useRef<IntersectionObserver | null>(null)
  const handleLastElement = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return
      if (lastElementRef.current) lastElementRef.current.disconnect()
      lastElementRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isReachingEnd) {
          setSize(size + 1)
        }
      })
      if (node) lastElementRef.current.observe(node)
    },
    [loadingMore, isReachingEnd, setSize, size]
  )

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
    setSortBy(searchParams.get('order') || '')
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
      <CustomConfirm
        show={confirmModal}
        setShow={setConfirmModal}
        confirmButtonText="Delete"
        onConfirm={handleDelete}
      />
      <ProductForm
        setShowModal={setShowModal}
        showModal={showModal}
        mutate={mutate}
        mode={mode}
        setMode={setMode}
        id={id}
        setId={setId}
        data={rowData}
        setData={setRowData}
      />
      <CustomBreadcrumbs
        list={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product', link: '' },
        ]}
      />
      <div className="my-4 flex justify-between items-center">
        <h4 className="text-2xl font-semibold">Product</h4>
        {superAdmin && (
          <button
            type="button"
            onClick={() => {
              setMode('add')
              setRowData(null)
              setShowModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        )}
      </div>
      {/* Search & Sort */}
      <div className="mb-4">
        <div className="relative mb-2">
          <span className="absolute left-0 py-1 pl-2 pr-2">
            <BsSearch size={20} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded pl-10 py-2"
            placeholder="Search for results..."
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-end items-center mb-3 relative">
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex justify-between w-full rounded border px-3 py-2 bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              Sort By
              <svg
                className="ml-2 -mr-1 h-5 w-5"
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
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                {[
                  { key: 'Recently Added', value: '' },
                  { key: 'Ascending', value: 'ascending', icon: <AiOutlineSortAscending size={20} /> },
                  { key: 'Descending', value: 'descending', icon: <AiOutlineSortDescending size={20} /> },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSortChange(item.value)}
                    className={`flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      sortBy === item.value ? 'bg-gray-200 font-semibold' : ''
                    }`}
                  >
                    {item.key} {item.icon && <span className="ml-2">{item.icon}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Product list */}
      {Array.isArray(list) && list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {(list as ProductType[]).map((product, index) => (
            <motion.div
              key={product._id}
              ref={list.length === index + 1 ? handleLastElement : null}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="shadow p-4 rounded h-full flex flex-col justify-between cursor-pointer"
                onClick={() => router.push(`/products/${product._id}`)}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-orange-500 rounded-full">
                    <GoStack size={20} />
                  </span>
                  <div className="capitalize text-base font-normal line-clamp-2 flex-1">{product.title}</div>
                </div>
                <div className="mt-3 flex justify-between items-center gap-1">
                  <div className="font-semibold text-sm">
                    {product.country || ''}{' '}
                    {product.country === 0 ? 'No countries' : product.country === 1 ? 'country' : 'countries'}
                  </div>
                  <div className="flex gap-1">
                    {superAdmin && (
                      <button
                        type="button"
                        onClick={(event) => handleEdit(event, product)}
                        className="bg-gray-500 text-white text-sm flex items-center gap-1 px-2 py-1 rounded"
                      >
                        <BiSolidEdit size={14} />
                        <span>Edit</span>
                      </button>
                    )}
                    {superAdmin && (
                      <button
                        type="button"
                        onClick={(event) => handleDeleteClick(event, product._id)}
                        className="bg-red-600 text-white text-sm flex items-center gap-1 px-2 py-1 rounded"
                      >
                        <MdDeleteOutline size={16} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-[50vh] rounded bg-gray-400 flex justify-center items-center">
          <div className="text-xl text-white">There are no products added.</div>
        </div>
      )}
      {(isLoading || loadingMore) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="shadow p-4 rounded bg-gray-100 h-32 animate-pulse" />
          ))}
        </div>
      )}
      {isReachingEnd && (
        <div className="flex justify-center items-center font-medium py-2 my-3 bg-gray-100">
          You have viewed all products...
        </div>
      )}
    </>
  )
}

export default Product
