'use client'
import React from 'react'
import Image from 'next/image'
import Logo from '@/public/logoFull.png'
import { motion } from 'framer-motion'

const LoginBranding: React.FC = () => (
  <div className="hidden lg:flex w-1/2 bg-linear-to-br from-indigo-900 via-blue-800 to-slate-900 flex-col items-center justify-center px-12 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating Pills/Capsules with Enhanced Glowing Effects */}
      <motion.div
        className="absolute top-20 left-20 w-4 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full opacity-70"
        animate={{
          y: [0, -15, 0, -8, 0],
          scale: [1, 1.2, 1, 1.1, 1],
          boxShadow: [
            '0 0 8px rgba(168, 85, 247, 0.6), 0 0 16px rgba(236, 72, 153, 0.4)',
            '0 0 12px rgba(168, 85, 247, 0.8), 0 0 24px rgba(236, 72, 153, 0.6)',
            '0 0 8px rgba(168, 85, 247, 0.6), 0 0 16px rgba(236, 72, 153, 0.4)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-40 right-32 w-3 h-6 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full opacity-60"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -180, -360],
          boxShadow: [
            '0 0 6px rgba(34, 211, 238, 0.6), 0 0 12px rgba(59, 130, 246, 0.4)',
            '0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(59, 130, 246, 0.6)',
            '0 0 6px rgba(34, 211, 238, 0.6), 0 0 12px rgba(59, 130, 246, 0.4)',
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-32 left-40 w-5 h-10 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full opacity-50"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 360, 720],
          boxShadow: [
            '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(5, 150, 105, 0.4)',
            '0 0 15px rgba(16, 185, 129, 0.8), 0 0 30px rgba(5, 150, 105, 0.6)',
            '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(5, 150, 105, 0.4)',
          ],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Enhanced DNA Helix with Better Visibility */}
      <motion.div
        className="absolute top-1/3 right-16 opacity-40"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 },
        }}
      >
        <motion.svg
          width="100"
          height="140"
          viewBox="0 0 80 120"
          className="text-cyan-300"
          filter="drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))"
        >
          <motion.path
            d="M10 10 Q40 40 10 70 Q40 100 10 130 M70 10 Q40 40 70 70 Q40 100 70 130"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          />
          <motion.circle
            r="4"
            cx="40"
            cy="70"
            fill="currentColor"
            opacity="0.9"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Enhanced Floating Particles System */}
      {Array.from({ length: 20 }).map((_, i) => {
        const delay = i * 0.2
        const duration = 3 + (i % 3) * 0.5
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${15 + ((i * 4.5) % 70)}%`,
              top: `${10 + ((i * 3.2) % 80)}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
          />
        )
      })}

      {/* Ripple Effects */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-64 h-64 border-2 border-cyan-400 rounded-full opacity-20" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1.1, 1.3, 1.1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <div className="w-80 h-80 border border-blue-300 rounded-full opacity-10" />
      </motion.div>
    </div>

    {/* Enhanced Background Glows */}
    <motion.div
      className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-purple-600 to-transparent rounded-full blur-3xl"
      animate={{
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-cyan-600 to-transparent rounded-full blur-3xl"
      animate={{
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
    />

    {/* Animated Tech Grid Lines */}
    <div className="absolute inset-0 opacity-10">
      <svg width="100%" height="100%" className="text-cyan-200">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    {/* Floating Geometric Shapes */}
    <motion.div
      className="absolute top-16 left-16 w-12 h-12"
      animate={{
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      }}
    />
    <motion.div
      className="absolute bottom-20 right-20 w-8 h-8 bg-linear-to-r from-pink-400 to-purple-500 opacity-70"
      style={{
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      }}
      animate={{
        rotate: [0, -90, -180, -270, -360],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
    />

    {/* Main Content with Enhanced Glassmorphism Effect */}
    <motion.div
      className="relative z-10 text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <motion.div
        className="mb-8 flex justify-center"
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
        }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="rounded-2xl flex items-center justify-center p-4 bg-white/10 backdrop-blur-md border border-white/20"
          animate={{
            boxShadow: [
              '0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              '0 12px 40px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              '0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{
            border: '2px solid rgba(59, 130, 246, 0.4)',
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 3, -3, 0],
              filter: [
                'brightness(1) drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))',
                'brightness(1.1) drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))',
                'brightness(1) drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))',
              ],
            }}
            transition={{
              rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              filter: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Image src={Logo} alt="Logo" width={180} height={60} unoptimized={true} />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-4xl font-bold mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.span
          className="text-white"
          animate={{
            textShadow: [
              '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)',
              '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(96, 165, 250, 0.6)',
              '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          DDReg Pharma
        </motion.span>
      </motion.h2>

      <motion.p
        className="text-blue-200 text-lg mb-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        Regulatory Management System
      </motion.p>

      <motion.p
        className="text-blue-300 text-sm mt-4 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Streamline your pharmaceutical regulatory processes with our comprehensive platform
        </motion.span>
      </motion.p>

      {/* Animated Feature Icons */}
      <motion.div
        className="flex justify-center gap-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        {[
          { icon: '🛡️', label: 'Secure' },
          { icon: '⚡', label: 'Fast' },
          { icon: '🔗', label: 'Connected' },
          { icon: '📊', label: 'Analytics' },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 1.8 + index * 0.1,
              type: 'spring',
              stiffness: 200,
            }}
            whileHover={{
              scale: 1.1,
              transition: { type: 'spring', stiffness: 400 },
            }}
          >
            <motion.span
              className="text-2xl mb-1"
              animate={{
                y: [0, -3, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
            >
              {feature.icon}
            </motion.span>
            <span className="text-xs text-blue-300 font-medium">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>

    <motion.div
      className="mt-8 flex justify-center text-xs uppercase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.5 }}
    >
      <motion.span
        className="text-white font-bold px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        animate={{
          boxShadow: [
            '0 0 10px rgba(255, 255, 255, 0.1)',
            '0 0 20px rgba(255, 255, 255, 0.2)',
            '0 0 10px rgba(255, 255, 255, 0.1)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      >
        🔒 Protected by DDReg Pharma
      </motion.span>
    </motion.div>
  </div>
)

export default LoginBranding
