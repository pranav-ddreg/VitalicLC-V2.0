// hooks/usePagination.ts
import useSWRInfinite from 'swr/infinite'

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Network response was not ok')
  return res.json()
}

interface ApiResponse<T> {
  data: {
    data: T[]
    count?: number
    [key: string]: unknown
  }
  code?: string
}

// ✅ Add a second generic type parameter <I> for "info"
function usePagination<T = unknown, I = unknown>(url: string, matchField?: string) {
  const getKey = (pageIndex: number, previousPageData: ApiResponse<T> | null) => {
    if (previousPageData && previousPageData.data?.data?.length === 0) return null
    return `${url}&page=${pageIndex + 1}`
  }

  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite<ApiResponse<T>>(getKey, fetcher)

  const list =
    data &&
    (Array.isArray(data) &&
    (JSON.stringify(data[0]?.data) === '{}' || data[0]?.code === 'INVALID_TOKEN' || data[0]?.code === 'ERROROCCURED')
      ? []
      : data.flatMap((info) => info?.data?.data ?? []))

  // ✅ Explicitly typecast info to I | undefined
  const info = matchField ? (data?.[0]?.data?.[matchField] as I) : undefined

  const isReachingEnd =
    list && data && data[0]?.data?.count !== undefined ? list.length === data[0]?.data?.count : false

  const loadingMore = data && typeof data[size - 1] === 'undefined'

  return {
    list,
    info,
    isLoading,
    isReachingEnd,
    loadingMore,
    size,
    setSize,
    mutate,
    error,
  }
}

export default usePagination

// // hooks/usePagination.ts
// import useSWRInfinite from 'swr/infinite'

// const fetcher = async <T>(url: string): Promise<T> => {
//   const res = await fetch(url)
//   if (!res.ok) throw new Error('Network response was not ok')
//   return res.json()
// }

// interface ApiResponse<T> {
//   data: {
//     data: T[]
//     count?: number
//     [key: string]: unknown
//   }
//   code?: string
// }

// function usePagination<T = unknown>(url: string, matchField?: string) {
//   const getKey = (pageIndex: number, previousPageData: ApiResponse<T> | null) => {
//     if (previousPageData && previousPageData.data?.data?.length === 0) return null
//     return `${url}&page=${pageIndex + 1}`
//   }

//   const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite<ApiResponse<T>>(getKey, fetcher)

//   const list =
//     data &&
//     (Array.isArray(data) &&
//     (JSON.stringify(data[0]?.data) === '{}' || data[0]?.code === 'INVALID_TOKEN' || data[0]?.code === 'ERROROCCURED')
//       ? []
//       : data.flatMap((info) => info?.data?.data ?? []))

//   const info = matchField ? data?.[0]?.data?.[matchField] : undefined

//   const isReachingEnd =
//     list && data && data[0]?.data?.count !== undefined ? list.length === data[0]?.data?.count : false

//   const loadingMore = data && typeof data[size - 1] === 'undefined'

//   return {
//     list,
//     info,
//     isLoading,
//     isReachingEnd,
//     loadingMore,
//     size,
//     setSize,
//     mutate,
//     error,
//   }
// }

// export default usePagination

// // // hooks/usePagination.ts
// // import useSWRInfinite from 'swr/infinite'

// // const fetcher = async (url: string) => {
// //   const res = await fetch(url)
// //   if (!res.ok) throw new Error('Network response was not ok')
// //   return res.json()
// // }

// // interface ApiResponse<T> {
// //   data: {
// //     data: T[]
// //     count?: number
// //     [key: string]: any
// //   }
// //   code?: string
// // }

// // function usePagination<T = any>(url: string, matchField?: string) {
// //   const getKey = (pageIndex: number, previousPageData: ApiResponse<T> | null) => {
// //     if (previousPageData && previousPageData.data?.data?.length === 0) return null
// //     return `${url}&page=${pageIndex + 1}`
// //   }

// //   const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite<ApiResponse<T>>(getKey, fetcher)

// //   const list =
// //     data &&
// //     (Array.isArray(data) &&
// //     (JSON.stringify(data[0]?.data) === '{}' || data[0]?.code === 'INVALID_TOKEN' || data[0]?.code === 'ERROROCCURED')
// //       ? []
// //       : data.flatMap((info) => info?.data?.data ?? []))

// //   const info = matchField ? data?.[0]?.data?.[matchField] : undefined

// //   const isReachingEnd =
// //     list && data && data[0]?.data?.count !== undefined ? list.length === data[0]?.data?.count : false

// //   const loadingMore = data && typeof data[size - 1] === 'undefined'

// //   return {
// //     list,
// //     info,
// //     isLoading,
// //     isReachingEnd,
// //     loadingMore,
// //     size,
// //     setSize,
// //     mutate,
// //     error,
// //   }
// // }

// // export default usePagination
