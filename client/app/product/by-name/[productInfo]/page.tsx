'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { BsSearch } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

import usePagination from '@/hooks/usePagination'
import ProductInfoForm from './productInfoForm'
import { useDebounce } from '@/hooks/use-debounce'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import CustomConfirm from '@/common/CustomConfirm'
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai'

// -------------------- TYPES --------------------
interface PreRegistration {
  _id: string
  country: { title: string }
  registrationDate?: string
  stage: string
}

interface ProductDataType {
  product: string
  country: string
  apiName: string
  brandName: string
  localPartner: { partnerName?: string }[]
  stage?: string
  remark?: string | null
  id?: string
}

interface ProductInfoProps {
  productId: string
}

// -------------------- UTILITY --------------------
const mapPreRegistrationToProductData = (pr: PreRegistration | null): ProductDataType | null => {
  if (!pr) return null

  return {
    product: pr._id,
    country: pr.country?.title || '',
    apiName: '',
    brandName: '',
    localPartner: [],
    stage: pr.stage || 'under-process',
    id: pr._id,
    remark: null,
  }
}

// -------------------- COMPONENT --------------------
const ProductInfo: React.FC<ProductInfoProps> = ({ productId }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sortBy, setSortBy] = useState<string>(searchParams.get('order') || '')
  const [query, setQuery] = useState<string>(searchParams.get('search') || '')
  const searchQuery = useDebounce(query, 500)

  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [rowData, setRowData] = useState<PreRegistration | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [superAdmin] = useState<boolean>(true)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const apiUrl = `/api/preregistration/productCountry/${productId}?limit=12&search=${searchQuery}&order=${sortBy}&sort=${
    sortBy === '' ? '' : 'title'
  }`

  // ------------------- PAGINATION -------------------
  const {
    list = [],
    info,
    isLoading,
    isReachingEnd,
    loadingMore,
    size,
    setSize,
    mutate,
  } = usePagination<PreRegistration>(apiUrl, 'product')

  const productTitle = (info as { title?: string })?.title || 'productdetail'

  // ------------------- DELETE -------------------
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
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message: string } } }
      toast.error(e.response?.data?.message || 'Error deleting')
    }
  }

  // ------------------- INFINITE SCROLL -------------------
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

  // ------------------- SYNC QUERY PARAMS -------------------
  useEffect(() => {
    setQuery(searchParams.get('search') || '')
    setSortBy(searchParams.get('order') || '')
  }, [searchParams])

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${window.location.pathname}?${params.toString()}`)
  }

  return (
    <>
      {/* Confirm Delete Modal */}
      <CustomConfirm
        show={confirmModal}
        setShow={setConfirmModal}
        confirmButtonText="Delete"
        onConfirm={handleDelete}
      />

      {/* Product Info Form */}
      <ProductInfoForm
        setShowModal={setShowModal}
        showModal={showModal}
        mutate={mutate}
        mode={mode}
        setMode={setMode}
        id={id}
        setId={setId}
        data={mapPreRegistrationToProductData(rowData)}
        setData={(data: ProductDataType | null) => {
          if (data) {
            setRowData({
              _id: data.product,
              country: { title: data.country },
              stage: data.stage || 'under-process',
            })
          } else {
            setRowData(null)
          }
        }}
      />

      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        list={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Product', link: '/products' },
          { name: productTitle, link: '' },
        ]}
      />

      {/* Header & Add button */}
      <div className="my-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold">{productTitle}</h4>
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
            Add
          </button>
        )}
      </div>

      {/* Search & Sort */}
      <div className="mb-4">
        {/* Search */}
        <div className="relative mb-2">
          <span className="absolute left-2 top-1/2 -translate-y-1/2">
            <BsSearch size={20} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              updateSearchParam('search', e.target.value)
            }}
            placeholder="Search for results..."
            className="w-full border rounded pl-10 py-2"
          />
        </div>

        {/* Sort */}
        <div className="flex justify-end mb-3 relative">
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="inline-flex justify-between items-center w-full rounded border px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sort By
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                {[
                  { key: 'Recently Added', value: '' },
                  { key: 'Ascending', value: 'ascending', icon: <AiOutlineSortAscending size={20} /> },
                  { key: 'Descending', value: 'descending', icon: <AiOutlineSortDescending size={20} /> },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSortBy(item.value)
                      updateSearchParam('order', item.value)
                      setShowSortDropdown(false)
                    }}
                    className={`flex justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
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

      {/* Product List */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {list.map((preregistration, index) => (
            <motion.div
              key={preregistration._id}
              ref={list.length === index + 1 ? lastElementRef : null}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="bg-white shadow p-4 rounded h-full flex flex-col justify-between cursor-pointer"
                onClick={() => router.push(`/products/${productId}/${preregistration._id}`)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold line-clamp-1 flex-1">{preregistration.country?.title}</div>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Registration Date:</span>
                    <span className="font-semibold">
                      {preregistration.registrationDate
                        ? new Date(preregistration.registrationDate).toISOString().substring(0, 10)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Stage:</span>
                    <span
                      className={`font-semibold capitalize ${
                        preregistration.stage === 'registered' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {preregistration.stage}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-1">
                  {superAdmin && (
                    <button
                      type="button"
                      onClick={(event) => handleDeleteClick(event, preregistration._id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      <MdDeleteOutline size={16} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-[50vh] rounded bg-gray-400 flex justify-center items-center">
          <div className="text-xl text-white">No data found.</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {(isLoading || loadingMore) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 h-32 animate-pulse rounded shadow p-4"></div>
          ))}
        </div>
      )}

      {isReachingEnd && (
        <div className="flex justify-center items-center font-medium py-2 my-3 bg-gray-200">
          You have viewed it all...
        </div>
      )}
    </>
  )
}

export default ProductInfo

// 'use client'

// import React, { useCallback, useRef, useState, useEffect } from 'react'
// import { BsSearch } from 'react-icons/bs'
// import { MdDeleteOutline } from 'react-icons/md'
// import { motion } from 'framer-motion'
// import toast from 'react-hot-toast'
// import axios from 'axios'
// import { useRouter, useSearchParams } from 'next/navigation'

// import usePagination from '@/hooks/usePagination'
// import ProductInfoForm from './productInfoForm'
// import { useDebounce } from '@/hooks/useDebounce'
// import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
// import CustomConfirm from '@/common/CustomConfirm'
// import { AiOutlineSortAscending, AiOutlineSortDescending } from 'react-icons/ai'

// // -------------------- TYPES --------------------
// interface PreRegistration {
//   _id: string
//   country: { title: string }
//   registrationDate?: string
//   stage: string
// }

// interface ProductDataType {
//   product: string
//   country: string
//   apiName: string
//   brandName: string
//   localPartner: { partnerName?: string }[]
//   stage?: string
//   remark?: string | null
//   id?: string
// }

// interface ProductInfoProps {
//   productId: string
// }

// // -------------------- UTILITY --------------------
// const mapPreRegistrationToProductData = (pr: PreRegistration | null): ProductDataType | null => {
//   if (!pr) return null

//   return {
//     product: pr._id,
//     country: pr.country?.title || '',
//     apiName: '',
//     brandName: '',
//     localPartner: [],
//     stage: pr.stage || 'under-process',
//     id: pr._id,
//     remark: null,
//   }
// }

// // -------------------- COMPONENT --------------------
// const ProductInfo: React.FC<ProductInfoProps> = ({ productId }) => {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const [sortBy, setSortBy] = useState<string>(searchParams.get('order') || '')
//   const [query, setQuery] = useState<string>(searchParams.get('search') || '')
//   const searchQuery = useDebounce(query, 500)

//   const [mode, setMode] = useState<'add' | 'edit'>('add')
//   const [rowData, setRowData] = useState<PreRegistration | null>(null)
//   const [showModal, setShowModal] = useState(false)
//   const [confirmModal, setConfirmModal] = useState(false)
//   const [id, setId] = useState<string | null>(null)
//   const [superAdmin] = useState<boolean>(true)
//   const [showSortDropdown, setShowSortDropdown] = useState(false)

//   const apiUrl = `/api/preregistration/productCountry/${productId}?limit=12&search=${searchQuery}&order=${sortBy}&sort=${
//     sortBy === '' ? '' : 'title'
//   }`

//   interface ProductInfo {
//     title?: string
//   }

//   const { list, info, isLoading, isReachingEnd, loadingMore, size, setSize, mutate } = usePagination<PreRegistration>(
//     apiUrl,
//     'product'
//   )

//   // ------------------- DELETE -------------------
//   const handleDeleteClick = (event: React.MouseEvent, preRegistrationId: string) => {
//     event.stopPropagation()
//     setId(preRegistrationId)
//     setConfirmModal(true)
//   }

//   const handleDelete = async () => {
//     try {
//       if (!id) return
//       await axios.delete(`/api/preregistration/delete/${id}`)
//       mutate()
//       setConfirmModal(false)
//       toast.success('Deleted successfully')
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Error deleting')
//     }
//   }

//   // ------------------- INFINITE SCROLL -------------------
//   const observer = useRef<IntersectionObserver | null>(null)
//   const lastElementRef = useCallback(
//     (node: HTMLDivElement | null) => {
//       if (loadingMore) return
//       if (observer.current) observer.current.disconnect()
//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && !isReachingEnd) {
//           setSize(size + 1)
//         }
//       })
//       if (node) observer.current.observe(node)
//     },
//     [loadingMore, isReachingEnd, size, setSize]
//   )

//   // ------------------- SYNC QUERY PARAMS -------------------
//   useEffect(() => {
//     setQuery(searchParams.get('search') || '')
//     setSortBy(searchParams.get('order') || '')
//   }, [searchParams])

//   const updateSearchParam = (key: string, value: string) => {
//     const params = new URLSearchParams(searchParams.toString())
//     if (value) params.set(key, value)
//     else params.delete(key)
//     router.replace(`${window.location.pathname}?${params.toString()}`)
//   }

//   return (
//     <>
//       <CustomConfirm
//         show={confirmModal}
//         setShow={setConfirmModal}
//         confirmButtonText="Delete"
//         onConfirm={handleDelete}
//       />

//       <ProductInfoForm
//         setShowModal={setShowModal}
//         showModal={showModal}
//         mutate={mutate}
//         mode={mode}
//         setMode={setMode}
//         id={id}
//         setId={setId}
//         data={mapPreRegistrationToProductData(rowData)}
//         setData={(data: ProductDataType | null) => {
//           if (data) {
//             setRowData({
//               _id: data.product,
//               country: { title: data.country },
//               stage: data.stage || 'under-process',
//             })
//           } else {
//             setRowData(null)
//           }
//         }}
//       />

//       <CustomBreadcrumbs
//         list={[
//           { name: 'Dashboard', link: '/dashboard' },
//           { name: 'Product', link: '/products' },
//           { name: (info as any)?.title || 'productdetail', link: '' },
//         ]}
//       />

//       {/* Header & Add button */}
//       <div className="my-4 flex justify-between items-center">
//         <h4 className="text-xl font-semibold">{(info as ProductInfo)?.title}</h4>
//         {superAdmin && (
//           <button
//             type="button"
//             onClick={() => {
//               setMode('add')
//               setRowData(null)
//               setShowModal(true)
//             }}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           >
//             Add
//           </button>
//         )}
//       </div>

//       {/* Search & Sort */}
//       <div className="mb-4">
//         <div className="relative mb-2">
//           <span className="absolute left-2 top-1/2 -translate-y-1/2">
//             <BsSearch size={20} />
//           </span>
//           <input
//             type="search"
//             value={query}
//             onChange={(e) => {
//               setQuery(e.target.value)
//               updateSearchParam('search', e.target.value)
//             }}
//             placeholder="Search for results..."
//             className="w-full border rounded pl-10 py-2"
//           />
//         </div>

//         <div className="flex justify-end mb-3 relative">
//           <div className="relative inline-block text-left">
//             <button
//               type="button"
//               onClick={() => setShowSortDropdown(!showSortDropdown)}
//               className="inline-flex justify-between items-center w-full rounded border px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               Sort By
//               <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path
//                   fillRule="evenodd"
//                   d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </button>

//             {showSortDropdown && (
//               <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                 {[
//                   { key: 'Recently Added', value: '' },
//                   { key: 'Ascending', value: 'ascending', icon: <AiOutlineSortAscending size={20} /> },
//                   { key: 'Descending', value: 'descending', icon: <AiOutlineSortDescending size={20} /> },
//                 ].map((item) => (
//                   <button
//                     key={item.key}
//                     type="button"
//                     onClick={() => {
//                       setSortBy(item.value)
//                       updateSearchParam('order', item.value)
//                       setShowSortDropdown(false)
//                     }}
//                     className={`flex justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
//                       sortBy === item.value ? 'bg-gray-200 font-semibold' : ''
//                     }`}
//                   >
//                     {item.key} {item.icon && <span className="ml-2">{item.icon}</span>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Product list */}
//       {Array.isArray(list) && list.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
//           {list.map((preregistration, index) => (
//             <motion.div
//               key={preregistration._id}
//               ref={list.length === index + 1 ? lastElementRef : null}
//               whileHover={{ scale: 1.05 }}
//             >
//               <div
//                 className="bg-white shadow p-4 rounded h-full flex flex-col justify-between cursor-pointer"
//                 onClick={() => router.push(`/products/${productId}/${preregistration._id}`)}
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="text-lg font-bold line-clamp-1 flex-1">{preregistration.country?.title}</div>
//                 </div>

//                 <div className="mt-3 flex flex-col gap-1">
//                   <div className="flex justify-between">
//                     <span className="font-bold">Registration Date:</span>
//                     <span className="font-semibold">
//                       {preregistration.registrationDate
//                         ? new Date(preregistration.registrationDate).toISOString().substring(0, 10)
//                         : 'N/A'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="font-bold">Stage:</span>
//                     <span
//                       className={`font-semibold capitalize ${
//                         preregistration.stage === 'registered' ? 'text-green-600' : 'text-red-600'
//                       }`}
//                     >
//                       {preregistration.stage}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-3 flex justify-end gap-1">
//                   {superAdmin && (
//                     <button
//                       type="button"
//                       onClick={(event) => handleDeleteClick(event, preregistration._id)}
//                       className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       <MdDeleteOutline size={16} />
//                       <span>Delete</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       ) : (
//         <div className="h-[50vh] rounded bg-gray-400 flex justify-center items-center">
//           <div className="text-xl text-white">No data found.</div>
//         </div>
//       )}

//       {/* Loading placeholder */}
//       {(isLoading || loadingMore) && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
//           {Array.from({ length: 6 }).map((_, idx) => (
//             <div key={idx} className="bg-gray-100 h-32 animate-pulse rounded shadow p-4"></div>
//           ))}
//         </div>
//       )}

//       {isReachingEnd && (
//         <div className="flex justify-center items-center font-medium py-2 my-3 bg-gray-200">
//           You have viewed it all...
//         </div>
//       )}
//     </>
//   )
// }

// export default ProductInfo
