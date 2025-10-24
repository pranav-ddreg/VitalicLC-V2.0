'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MdKeyboardDoubleArrowRight } from 'react-icons/md'
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion'
import moment from 'moment'

interface Item {
  _id?: string
  title?: string
  stage?: string
  product?: { _id: string; title: string }
  preregistration?: { product?: { title: string } }
  registrationDate?: string
  expApprovalDate?: string
}

interface LatestRegistrationProps {
  data: Item[]
}

const LatestRegistration: React.FC<LatestRegistrationProps> = ({ data }) => {
  const router = useRouter()

  const y = useMotionValue(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [contentHeight, setContentHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(300)
  const [paused, setPaused] = useState(false)

  const SPEED_PX_PER_SEC = 20

  // Measure container height
  useEffect(() => {
    const updateContainerHeight = () => {
      if (wrapperRef.current) setContainerHeight(wrapperRef.current.clientHeight)
    }
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
    return () => window.removeEventListener('resize', updateContainerHeight)
  }, [])

  // Measure content height
  useEffect(() => {
    if (!contentRef.current) return
    const measure = () => setContentHeight(contentRef.current!.scrollHeight)
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [data])

  // Reset scroll when data changes
  useEffect(() => {
    y.set(0)
  }, [data, y])

  // Smooth marquee animation
  useAnimationFrame((t, delta) => {
    if (paused) return
    if (!contentHeight || !wrapperRef.current) return
    if (contentHeight <= containerHeight) return

    let next = y.get() - (SPEED_PX_PER_SEC * delta) / 1000
    if (Math.abs(next) >= contentHeight) next += contentHeight
    y.set(next)
  })

  const renderItems = (prefix: string) => {
    if (!Array.isArray(data) || data.length === 0) return null

    return data.map((item, index) => (
      <div className="border-b last:border-b-0" key={`${prefix}-${item._id || index}`}>
        <div
          className="flex items-center justify-between py-2 cursor-pointer"
          title={item?.title}
          onClick={() => router.push(`/products/${item?.product?._id}/${item?._id}`)}
        >
          <span className="text-green-600 bg-gray-200 p-2 rounded-full flex items-center justify-center">
            <MdKeyboardDoubleArrowRight size={20} />
          </span>

          <div className="flex-1 mx-2">
            <h6 className="text-[14px] font-semibold text-gray-900 line-clamp-1">
              {item?.product?.title || item?.preregistration?.product?.title}
            </h6>
            <p className="text-gray-500 text-[14px] mt-1 mb-0">
              {item.stage === 'registered'
                ? item.registrationDate
                  ? moment(item.registrationDate).format('LL')
                  : 'N/A'
                : item.expApprovalDate
                  ? moment(item.expApprovalDate).format('LL')
                  : 'N/A'}
            </p>
          </div>

          <div className="text-[14px] font-medium">
            {item.stage === 'registered' ? (
              <p className="text-green-600 m-0">Registered</p>
            ) : item.stage === 'under-registration' ? (
              <p className="text-yellow-500 m-0">Under Registration</p>
            ) : (
              <p className="text-yellow-500 m-0">Under Process</p>
            )}
          </div>
        </div>
      </div>
    ))
  }

  const canScroll = contentHeight > containerHeight

  return (
    <div className="w-full">
      <div className="bg-white shadow rounded overflow-hidden">
        <div className="flex justify-between items-center border-b px-4 py-3 bg-white z-10">
          <h4 className="text-gray-600 font-semibold text-lg m-0">Latest Registration</h4>
          <button
            onClick={() => router.push('/pre-registration')}
            className="ml-auto text-blue-600 font-semibold text-sm"
          >
            View All
          </button>
        </div>

        <div ref={wrapperRef} className="overflow-hidden mt-1" style={{ height: '300px' }}>
          <motion.div
            className="py-1"
            style={{ y, willChange: 'transform', cursor: canScroll ? 'pointer' : 'default' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div ref={contentRef}>{renderItems('a')}</div>
            <div aria-hidden="true">{renderItems('b')}</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LatestRegistration
