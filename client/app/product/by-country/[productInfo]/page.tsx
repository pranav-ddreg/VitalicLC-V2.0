'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BsSearch } from 'react-icons/bs'
import { GoStack } from 'react-icons/go'
import { MdDeleteOutline } from 'react-icons/md'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import usePagination from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/use-debounce'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import CustomConfirm from '@/common/CustomConfirm'
import ProductForm from '@/components/by-country/productForm'
import ProductInfoForm from './productInfoForm'
import type { ProductFormData } from '@/components/by-country/productForm'
// import { SWRInfiniteKeyedMutator } from 'swr/infinite'
// import CheckSuperAdmin from '@/middleware/CheckSuperAdmin'
// import CheckPermissions from '@/middleware/CheckPermissions'

// Type for pagination items
interface PaginationItem {
  _id: string
  product: { _id: string; title: string } | null
  stage: string
}

// Type for product info form data
interface FormPreRegistration {
  product: string
  remark?: string
  localPartner: string
  expApprovalDate: string
  submissionDate: string
  expLaunchDate: string
  dossier: string
  sample: string
  country: string
  stage?: string
}

// interface ApiResponse<T> {
//   data: T[]
//   count?: number
//   message?: string
// }

// interface PaginationInfo {
//   title: string
// }

const ProductInfo: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const countryId = searchParams.get('countryId') || ''
  const [sortBy, setSortBy] = useState(searchParams.get('order') || '')
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const searchQuery = useDebounce(query, 500)

  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [productFormData, setProductFormData] = useState<Partial<ProductFormData> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [limit] = useState(12)
  const [productId, setProductId] = useState<string | null>(null)

  const [showProductInfoModal, setShowProductInfoModal] = useState(false)
  const [productInfoMode, setProductInfoMode] = useState<'add' | 'edit'>('add')
  const [productInfoId, setProductInfoId] = useState<string | null>(null)
  const [productInfoData, setProductInfoData] = useState<Partial<FormPreRegistration> | null>(null)

  const apiUrl = `/api/preregistration/countryProduct/${countryId}?limit=${limit}&search=${searchQuery}&order=${sortBy}&sort=${sortBy ? 'title' : ''}`

  interface PaginationInfo {
    title: string
  }

  const {
    list = [],
    info,
    isLoading,
    isReachingEnd,
    loadingMore,
    size,
    setSize,
    mutate,
  } = usePagination<PaginationItem, PaginationInfo>(apiUrl, 'country')

  // Open ProductInfoForm when productId is set
  useEffect(() => {
    if (productId) {
      setProductInfoMode('add')
      setProductInfoData(null)
      setProductInfoId(null)
      setShowProductInfoModal(true)
    }
  }, [productId])

  const handleDeleteClick = (event: React.MouseEvent, preRegistrationId: string) => {
    event.stopPropagation()
    setId(preRegistrationId)
    setConfirmModal(true)
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await axios.delete(`/api/preregistration/delete/${id}`)
      mutate()
      setConfirmModal(false)
      toast.success('Deleted successfully')
    } catch {
      toast.error('Something went wrong')
    }
  }

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isReachingEnd) setSize(size + 1)
      })
      if (node) observer.current.observe(node)
    },
    [loadingMore, isReachingEnd, size, setSize]
  )

  useEffect(() => {
    const search = searchParams.get('search')
    const order = searchParams.get('order')
    setQuery(search || '')
    setSortBy(order || '')
  }, [searchParams])

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
        data={productFormData}
        setData={setProductFormData}
        productId={productId}
        setProductId={setProductId}
      />

      <ProductInfoForm
        setShowModal={setShowProductInfoModal}
        showModal={showProductInfoModal}
        mutate={mutate}
        mode={productInfoMode}
        setMode={setProductInfoMode}
        id={productInfoId}
        setId={setProductInfoId}
        data={productInfoData}
        setData={setProductInfoData}
        countryId={countryId}
        addProductId={productId}
        productId={productId}
        setProductId={setProductId}
      />

      <CustomBreadcrumbs
        list={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product By Country', link: '/by-countries' },
          { name: info?.title || 'Product Detail', link: '' },
        ]}
      />

      <div className="my-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold">{info?.title}</h4>
        <button
          onClick={() => {
            setMode('add')
            setProductFormData(null)
            setShowModal(true)
          }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="relative mb-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <BsSearch size={20} />
        </span>
        <input
          type="search"
          placeholder="Search for results..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end mb-3">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Recently Added</option>
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      {Array.isArray(list) && list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((item, index) => (
            <motion.div
              key={item._id}
              ref={list.length === index + 1 ? lastElementRef : null}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow rounded p-4 flex flex-col justify-between cursor-pointer"
              onClick={() => router.push(`/by-countries/${item.product?._id}/${item._id}`)}
            >
              <div className="flex items-start gap-2">
                <GoStack size={20} className="text-orange-500" />
                <div className="text-lg font-medium truncate">{item.product?.title}</div>
              </div>
              <div className="mt-3 text-sm space-y-1">
                <div>
                  <span className="font-semibold">Stage:</span> {item.stage}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                {/* <CheckPermissions permission="delete"> */}
                <button
                  onClick={(e) => handleDeleteClick(e, item._id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <MdDeleteOutline size={16} />
                  Delete
                </button>
                {/* </CheckPermissions> */}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-[50vh] bg-gray-400 rounded flex items-center justify-center text-white text-xl">
          There are no products added.
        </div>
      )}

      {(isLoading || loadingMore) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white shadow rounded p-4 animate-pulse h-32" />
          ))}
        </div>
      )}

      {isReachingEnd && <div className="py-2 my-3 bg-gray-100 text-center font-medium">You have viewed it all...</div>}
    </>
  )
}

export default ProductInfo
