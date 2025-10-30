'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface MarqueeItem {
  product?: string | { title?: string; country?: { title?: string } }
  stage?: string
  country?: string
  createdAt?: string
  approvalDate?: string
  expireDays?: number
}

interface MarqueeProps {
  renewalHeadline?: MarqueeItem[]
  variationHeadline?: MarqueeItem[]
  expireHeadline?: MarqueeItem[]
  pauseOnHover?: boolean
}

const Marquee: React.FC<MarqueeProps> = ({
  renewalHeadline = [],
  variationHeadline = [],
  expireHeadline = [],
  pauseOnHover = false,
}) => {
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const textRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const animationFrame = useRef<number | null>(null)
  const lastTimestamp = useRef<number | null>(null)

  const SPEED = 100 // pixels per second

  // Calculate widths
  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setTextWidth(textRef.current.scrollWidth)
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [renewalHeadline, variationHeadline, expireHeadline])

  // Start marquee when widths change
  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      setCurrentX(-textWidth)
      controls.set({ x: -textWidth })
      if (!isHovered) startLoop(-textWidth)
    }
    return () => stopLoop()
    // eslint-disable-next-line
  }, [textWidth, containerWidth])

  // Pause/resume on hover if enabled
  useEffect(() => {
    if (pauseOnHover && isHovered) {
      stopLoop()
    } else if (textWidth > 0 && containerWidth > 0) {
      startLoop(currentX)
    }
    // eslint-disable-next-line
  }, [isHovered, pauseOnHover])

  // Animation loop
  const startLoop = (fromX: number) => {
    stopLoop()
    controls.set({ x: fromX })
    lastTimestamp.current = null

    const step = (timestamp: number) => {
      if (lastTimestamp.current === null) lastTimestamp.current = timestamp
      const elapsed = (timestamp - lastTimestamp.current) / 1000 // seconds
      lastTimestamp.current = timestamp

      let nextX = fromX + SPEED * elapsed

      if (nextX >= containerWidth) {
        nextX = -textWidth
        fromX = -textWidth
      } else {
        fromX = nextX
      }

      setCurrentX(nextX)
      controls.set({ x: nextX })
      animationFrame.current = requestAnimationFrame(step)
    }

    animationFrame.current = requestAnimationFrame(step)
  }

  const stopLoop = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  useEffect(() => () => stopLoop(), [])

  return (
    <div className="mb-4 overflow-hidden" ref={containerRef}>
      <div className="bg-blue-900 text-white overflow-hidden whitespace-nowrap py-2 px-4">
        <motion.ul
          ref={textRef}
          animate={controls}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="inline-flex gap-8 list-none m-0"
          style={{ willChange: 'transform' }}
        >
          {renewalHeadline.map((item, index) => (
            <li key={`renew-${index}`}>
              ➯ Product {typeof item.product === 'string' ? item.product : item.product?.title} {item.stage} in{' '}
              {item.country} ({item.createdAt ? new Date(item.createdAt).toISOString().substring(0, 10) : null})
            </li>
          ))}
          {variationHeadline.map((item, index) => (
            <li key={`var-${index}`}>
              ➯ {typeof item.product === 'string' ? item.product : item.product?.title} Variation approval received in{' '}
              {typeof item.product !== 'string' ? item.product?.country?.title : ''}(
              {item.approvalDate ? new Date(item.approvalDate).toISOString().substring(0, 10) : null})
            </li>
          ))}
          {expireHeadline.map((item, index) => (
            <li key={`exp-${index}`}>
              ⇦ {typeof item.product === 'string' ? item.product : item.product?.title} in {item.country} will expire in{' '}
              {item.expireDays} Days
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}

export default Marquee
