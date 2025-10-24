'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MdKeyboardDoubleArrowRight } from 'react-icons/md'
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion'
import moment from 'moment'

type Stage = 'registered' | 'under-registration' | 'under-process' | 'renew' | 'under-renewal' | 'not-received' | string

type Approval = 'received' | 'not-received' | string

interface CombinedItem {
  _id?: string
  title?: string
  stage?: Stage
  approval?: Approval
  registrationDate?: string | Date | null
  expApprovalDate?: string | Date | null
  product?: { _id?: string; title?: string } | null
  preregistration?: { product?: { title?: string } | null } | null
}

interface CombinedLatestDataProps {
  data: CombinedItem[]
  tabName: string
  link: string
}

const CombinedLatestData: React.FC<CombinedLatestDataProps> = ({ data, tabName, link }) => {
  const router = useRouter()
  const y = useMotionValue(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [contentHeight, setContentHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(300)
  const [paused, setPaused] = useState(false)

  const SPEED_PX_PER_SEC = 20

  useEffect(() => {
    const updateContainerHeight = () => {
      if (wrapperRef.current) setContainerHeight(wrapperRef.current.clientHeight)
    }
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
    return () => window.removeEventListener('resize', updateContainerHeight)
  }, [])

  useEffect(() => {
    if (!contentRef.current) return
    const measure = () => {
      if (contentRef.current) setContentHeight(contentRef.current.scrollHeight)
    }
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [data])

  useEffect(() => {
    y.set(0)
  }, [data, y])

  useAnimationFrame((t, delta) => {
    if (paused || !contentHeight || !wrapperRef.current) return
    if (contentHeight <= containerHeight) return

    const step = (SPEED_PX_PER_SEC * delta) / 1000
    let next = y.get() - step

    if (Math.abs(next) >= contentHeight) next += contentHeight
    y.set(next)
  })

  const renderItems = (prefix: string) => {
    if (!Array.isArray(data) || data.length === 0) return null

    return data.map((item, index) => (
      <div className="border-0" key={`${prefix}-${item?._id || index}`}>
        <div
          className="border-b cursor-pointer"
          title={item?.title}
          onClick={() => {
            if (item?.product?._id && item?._id) {
              router.push(`/products/${item.product._id}/${item._id}`)
            }
          }}
        >
          <div className="flex items-center mt-0">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 py-2">
                <span className="text-green-500 flex bg-gray-100 p-2 rounded-full">
                  <MdKeyboardDoubleArrowRight size={20} />
                </span>

                <div className="mt-0 flex-1">
                  <h6 className="mb-1 font-semibold text-dark text-sm line-clamp-1">
                    {item?.product?.title || item?.preregistration?.product?.title}
                  </h6>
                  <div className="text-gray-500 font-medium text-sm">
                    {item && item.stage === 'registered' ? (
                      <p className="mt-1 mb-0">
                        {item?.registrationDate ? moment(item.registrationDate).format('LL') : 'N/A'}
                      </p>
                    ) : (
                      <p className="mt-1 mb-0">
                        {item?.expApprovalDate ? moment(item.expApprovalDate).format('LL') : 'N/A'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="font-medium text-sm">
                  {item &&
                    (item.stage === 'registered' ? (
                      <p className="text-green-500 m-0">Registered</p>
                    ) : item.stage === 'under-registration' ? (
                      <p className="text-yellow-500 m-0">Under Registration</p>
                    ) : item.stage === 'under-process' ? (
                      <p className="text-yellow-500 m-0">Under Process</p>
                    ) : item.approval === 'received' ? (
                      <p className="text-green-500 m-0">Received</p>
                    ) : item.approval === 'not-received' ? (
                      <p className="text-blue-500 m-0 font-medium">Not Received</p>
                    ) : item.stage === 'renew' ? (
                      <p className="text-green-500 m-0">Renewed</p>
                    ) : item.stage === 'under-renewal' || item.stage === 'not-received' ? (
                      <p className="text-green-500 m-0">Under Renewal</p>
                    ) : (
                      <p className="text-green-500 m-0">In Process</p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  }

  const canScroll = contentHeight > containerHeight

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="card overflow-hidden border-0 shadow">
          <div className="flex justify-between items-center bg-white py-3 px-4 border-b z-10">
            <h4 className="text-gray-500 font-semibold text-sm m-0">Latest {tabName}</h4>
            <button
              onClick={() => router.push(link)}
              style={{ fontSize: '14px' }}
              className="ml-auto text-blue-500 font-semibold no-underline"
            >
              View All
            </button>
          </div>

          <div ref={wrapperRef} style={{ height: '300px' }} className="p-0 mt-1 overflow-hidden">
            <motion.div
              className="py-1"
              style={{
                y,
                willChange: 'transform',
                cursor: canScroll ? 'pointer' : 'default',
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div ref={contentRef}>{renderItems('a')}</div>
              <div aria-hidden="true">{renderItems('b')}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombinedLatestData
