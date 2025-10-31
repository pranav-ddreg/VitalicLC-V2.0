'use client'

import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from 'next-themes'

import { Button } from './button'

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [pendingTheme, setPendingTheme] = React.useState<string | null>(null)
  const [transitionPhase, setTransitionPhase] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const styleId = 'theme-transition-styles'

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        :root {
          --theme-transition-duration: 0ms;
          --theme-transition-timing: ease-in-out;
        }

        /* Synchronized transitions for all elements */
        * {
          transition:
            background-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            border-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            fill var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            stroke var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            box-shadow var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* Specific elements that need synchronized transitions */
        html, body {
          transition:
            background-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* Text elements */
        h1, h2, h3, h4, h5, h6, p, span, div, a {
          transition:
            color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* Interactive elements */
        button, input, textarea, select {
          transition:
            background-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            border-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            box-shadow var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* SVG icons */
        svg {
          transition:
            fill var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            stroke var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* Cards and containers */
        .card, .container, .wrapper, [class*="bg-"], [class*="border-"] {
          transition:
            background-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            border-color var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out),
            box-shadow var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out) !important;
        }

        /* Special sunset/sunrise effect for body background */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          background: linear-gradient(
            45deg,
            rgba(251, 146, 60, 0.1) 0%,
            rgba(251, 113, 133, 0.1) 25%,
            rgba(168, 85, 247, 0.1) 50%,
            rgba(59, 130, 246, 0.1) 75%,
            rgba(15, 23, 42, 0.1) 100%
          );
          transition: opacity var(--theme-transition-duration, 0ms) var(--theme-transition-timing, ease-in-out);
        }

        /* Show gradient overlay during theme transitions */
        .theme-transitioning body::before {
          opacity: 1;
        }

        /* Exclude certain elements from transitions if needed */
        .no-transition,
        .no-transition * {
          transition: none !important;
        }

        /* Performance optimization for animations */
        .animate-spin,
        .animate-ping,
        .animate-pulse,
        .animate-bounce {
          transition: none !important;
        }

        /* Cloud animations */
        @keyframes cloud-drift-1 {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes cloud-drift-2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes cloud-drift-3 {
          0% { transform: translate(-100%, 20px); }
          100% { transform: translate(100%, -20px); }
        }

        @keyframes cloud-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes drift-slow {
          0% { transform: translateX(-15px) translateY(0px); }
          50% { transform: translateX(15px) translateY(-3px); }
          100% { transform: translateX(-15px) translateY(0px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes sun-rays {
          0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
        }

        @keyframes moon-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
        }

        @keyframes sunset-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(251, 146, 60, 0.4); }
          50% { box-shadow: 0 0 25px rgba(251, 146, 60, 0.7); }
        }

        .animate-cloud-drift-1 {
          animation: cloud-drift-1 8s linear infinite;
        }

        .animate-cloud-drift-2 {
          animation: cloud-drift-2 6s linear infinite;
          animation-delay: 2s;
        }

        .animate-cloud-drift-3 {
          animation: cloud-drift-3 10s linear infinite;
          animation-delay: 4s;
        }

        .animate-cloud-float {
          animation: cloud-float 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-twinkle {
          animation: twinkle 1.5s ease-in-out infinite;
        }

        .animate-drift-slow {
          animation: drift-slow 4s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .animate-sun-rays {
          animation: sun-rays 4s linear infinite;
        }

        .animate-moon-glow {
          animation: moon-glow 3s ease-in-out infinite;
        }

        .animate-sunset-glow {
          animation: sunset-glow 2s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `
      document.head.appendChild(style)
    }

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  const toggleTheme = () => {
    if (isTransitioning) return

    const newTheme = theme === 'light' ? 'dark' : 'light'
    setPendingTheme(newTheme)
    setIsTransitioning(true)

    document.documentElement.style.setProperty('--theme-transition-duration', '1200ms')
    document.documentElement.style.setProperty('--theme-transition-timing', 'ease-in-out')

    document.body.classList.add('theme-transitioning')

    let phase = 0
    const phaseInterval = setInterval(() => {
      phase += 4
      setTransitionPhase(phase)
      if (phase >= 100) {
        clearInterval(phaseInterval)
      }
    }, 50)

    setTimeout(() => {
      setTheme(newTheme)
    }, 625)

    setTimeout(() => {
      setIsTransitioning(false)
      setPendingTheme(null)
      setTransitionPhase(0)
      document.body.classList.remove('theme-transitioning')

      document.documentElement.style.removeProperty('--theme-transition-duration')
      document.documentElement.style.removeProperty('--theme-transition-timing')
    }, 1250)
  }

  const isDark = theme === 'dark'
  const willBeDark = pendingTheme === 'dark'

  const getTransitionColors = () => {
    if (!isTransitioning) return null

    const progress = transitionPhase / 100

    if (willBeDark) {
      if (progress < 0.25) {
        return 'from-blue-400 via-yellow-300 to-orange-400'
      } else if (progress < 0.5) {
        return 'from-orange-400 via-red-400 to-pink-500'
      } else if (progress < 0.75) {
        return 'from-pink-500 via-purple-600 to-indigo-700'
      } else {
        return 'from-indigo-900 via-purple-900 to-slate-900'
      }
    } else {
      if (progress < 0.25) {
        return 'from-slate-900 via-indigo-900 to-purple-800'
      } else if (progress < 0.5) {
        return 'from-purple-700 via-pink-500 to-orange-400'
      } else if (progress < 0.75) {
        return 'from-orange-400 via-yellow-400 to-blue-300'
      } else {
        return 'from-blue-300 via-yellow-200 to-orange-200'
      }
    }
  }

  const transitionColors = getTransitionColors()

  const getIconPosition = (isForSun: boolean) => {
    if (!isTransitioning) return 0

    const progress = transitionPhase / 100

    if (willBeDark) {
      if (isForSun) {
        return Math.floor(progress * 32)
      } else {
        return Math.floor(-32 + progress * 32)
      }
    } else {
      if (isForSun) {
        return Math.floor(32 - progress * 32)
      } else {
        return Math.floor(-(progress * 32))
      }
    }
  }

  const sunPosition = getIconPosition(true)
  const moonPosition = getIconPosition(false)

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="relative overflow-hidden border-2 border-orange-200 bg-linear-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100"
      >
        <LuSun className="h-5 w-5 text-orange-500" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      disabled={isTransitioning}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative overflow-hidden border-2 transition-all duration-500 ease-in-out
        hover:scale-110 active:scale-95 group
        ${isTransitioning ? 'cursor-wait' : 'cursor-pointer'}
        ${
          isDark
            ? 'border-indigo-500/50 bg-slate-900 hover:bg-slate-800 '
            : 'border-orange-300/60 bg-linear-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 '
        }
      `}
    >
      <div
        className={`
        absolute inset-0 transition-all duration-300 ease-in-out
        ${
          isTransitioning && transitionColors
            ? `bg-linear-to-br ${transitionColors}`
            : isDark
              ? 'bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900'
              : 'bg-linear-to-br from-orange-100 via-yellow-100 to-amber-100'
        }
      `}
      />

      <div
        className={`
        absolute inset-0 transition-all duration-500 ease-in-out
        ${
          (!isDark && !isTransitioning) || (isTransitioning && !willBeDark && transitionPhase > 50)
            ? 'opacity-100'
            : 'opacity-0'
        }
      `}
      >
        <div className="absolute inset-0 animate-sun-rays">
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-yellow-300/40 transform -translate-x-1/2" />
          <div className="absolute top-1 right-1 w-0.5 h-1.5 bg-yellow-300/30 transform rotate-45" />
          <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-yellow-300/40 transform -translate-y-1/2" />
          <div className="absolute bottom-1 right-1 w-0.5 h-1.5 bg-yellow-300/30 transform -rotate-45" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-yellow-300/40 transform -translate-x-1/2" />
          <div className="absolute bottom-1 left-1 w-0.5 h-1.5 bg-yellow-300/30 transform rotate-45" />
          <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-yellow-300/40 transform -translate-y-1/2" />
          <div className="absolute top-1 left-1 w-0.5 h-1.5 bg-yellow-300/30 transform -rotate-45" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden">
        {/* Sun */}
        <LuSun
          className={`
          absolute h-5 w-5 transition-all duration-1250 ease-in-out
          ${
            isTransitioning
              ? `translate-x-[${sunPosition}px] scale-${Math.abs(sunPosition) < 16 ? 110 : 90} opacity-${
                  Math.abs(sunPosition) < 16 ? 100 : Math.max(30, 100 - Math.abs(sunPosition) * 2)
                } text-orange-${Math.abs(sunPosition) < 16 ? '500' : '400'}`
              : isDark
                ? 'translate-x-8 scale-0 opacity-0 text-orange-400'
                : 'translate-x-0 scale-100 opacity-100 text-orange-600'
          }
          drop-shadow-lg filter brightness-110
          ${isTransitioning && transitionPhase > 25 && transitionPhase < 75 ? 'animate-sunset-glow' : ''}
        `}
          style={{
            transform: isTransitioning
              ? `translateX(${sunPosition}px) scale(${Math.abs(sunPosition) < 16 ? 1.1 : 0.9})`
              : isDark
                ? 'translateX(32px) scale(0)'
                : 'translateX(0px) scale(1)',
          }}
        />

        {/* Moon */}
        <LuMoon
          className={`
          absolute h-5 w-5 transition-all duration-1250 ease-in-out
          ${
            isTransitioning
              ? `translate-x-[${moonPosition}px] scale-${Math.abs(moonPosition) < 16 ? 110 : 90} opacity-${
                  Math.abs(moonPosition) < 16 ? 100 : Math.max(30, 100 - Math.abs(moonPosition) * 2)
                } text-indigo-${Math.abs(moonPosition) < 16 ? '200' : '400'}`
              : isDark
                ? 'translate-x-0 scale-100 opacity-100 text-indigo-300 animate-moon-glow'
                : 'translate-x-8 scale-0 opacity-0 text-indigo-400'
          }
          drop-shadow-lg filter brightness-110
        `}
          style={{
            transform: isTransitioning
              ? `translateX(${moonPosition}px) scale(${Math.abs(moonPosition) < 16 ? 1.1 : 0.9})`
              : isDark
                ? 'translateX(0px) scale(1)'
                : 'translateX(-32px) scale(0)',
          }}
        />

        <div
          className={`
          absolute inset-0 rounded-full transition-all duration-300 ease-in-out
          ${
            isTransitioning && transitionPhase > 40 && transitionPhase < 60
              ? willBeDark
                ? 'bg-gradient-radial from-orange-400/50 via-pink-400/30 to-transparent animate-pulse scale-150 opacity-100'
                : 'bg-gradient-radial from-purple-400/50 via-blue-400/30 to-transparent animate-pulse scale-150 opacity-100'
              : 'opacity-0 scale-100'
          }
        `}
        />
      </div>

      <div
        className={`
        absolute inset-0 transition-all duration-600 ease-in-out
        ${
          isTransitioning
            ? willBeDark
              ? `opacity-${Math.min(100, Math.max(0, (transitionPhase - 50) * 2))} delay-200`
              : `opacity-${Math.max(0, (50 - transitionPhase) * 2)} delay-100`
            : isDark
              ? 'opacity-100'
              : 'opacity-0'
        }
      `}
      >
        <div className="absolute top-1 left-1 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
        <div
          className="absolute top-2 right-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping"
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.6s' }}
        />
        <div
          className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse"
          style={{ animationDelay: '0.9s' }}
        />

        <div
          className={`
          absolute top-0.5 left-3 w-0.5 h-0.5 bg-yellow-300 rounded-full transition-all duration-400
          ${
            isTransitioning && willBeDark && transitionPhase > 70
              ? 'opacity-100 animate-twinkle scale-110'
              : 'opacity-0 scale-75'
          }
        `}
        />
        <div
          className={`
          absolute bottom-0.5 right-3 w-0.5 h-0.5 bg-cyan-300 rounded-full transition-all duration-400
          ${
            isTransitioning && willBeDark && transitionPhase > 70
              ? 'opacity-100 animate-twinkle scale-110'
              : 'opacity-0 scale-75'
          }
        `}
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className={`
          absolute top-1.5 right-0.5 w-0.5 h-0.5 bg-purple-300 rounded-full transition-all duration-400
          ${
            isTransitioning && willBeDark && transitionPhase > 70
              ? 'opacity-100 animate-twinkle scale-110'
              : 'opacity-0 scale-75'
          }
        `}
          style={{ animationDelay: '0.4s' }}
        />
      </div>

      <div
        className={`
        absolute inset-0 transition-all duration-600 ease-in-out z-20
        ${
          isTransitioning
            ? !willBeDark
              ? `opacity-${Math.min(100, Math.max(0, (transitionPhase - 50) * 2))} delay-200`
              : `opacity-${Math.max(0, (50 - transitionPhase) * 2)} delay-100`
            : !isDark
              ? 'opacity-100'
              : 'opacity-0'
        }
      `}
      >
        <div className="absolute inset-0 animate-cloud-drift-1">
          <div className="absolute top-1 left-0 w-4 h-2 bg-sky-200/80 rounded-full shadow-sm" />
          <div className="absolute top-1.5 left-1 w-3 h-1.5 bg-blue-100/70 rounded-full" />
          <div className="absolute top-0.5 left-2 w-2 h-1 bg-sky-100/75 rounded-full" />
        </div>

        <div className="absolute inset-0 animate-cloud-drift-2">
          <div className="absolute top-2 right-0 w-3 h-1.5 bg-sky-200/75 rounded-full shadow-sm" />
          <div className="absolute top-2.5 right-1 w-2 h-1 bg-blue-100/60 rounded-full" />
        </div>

        <div className="absolute inset-0 animate-cloud-drift-3">
          <div className="absolute bottom-1 left-0 w-3 h-1.5 bg-sky-100/70 rounded-full shadow-sm" />
          <div className="absolute bottom-0.5 left-1 w-2 h-1 bg-blue-50/65 rounded-full" />
        </div>

        <div className="absolute inset-0 animate-cloud-float">
          <div className="absolute top-3 left-2 w-2.5 h-1 bg-sky-200/65 rounded-full shadow-sm" />
          <div className="absolute top-3.5 left-2.5 w-1.5 h-0.5 bg-blue-100/50 rounded-full" />
        </div>

        <div
          className="absolute top-0 right-3 w-1 h-0.5 bg-sky-100/60 rounded-full animate-ping"
          style={{ animationDelay: '0.4s', animationDuration: '1.5s' }}
        />
        <div
          className="absolute bottom-0 left-3 w-1 h-0.5 bg-blue-100/65 rounded-full animate-ping"
          style={{ animationDelay: '0.8s', animationDuration: '1.5s' }}
        />
      </div>

      <div
        className={`
        absolute inset-0 transition-all duration-400 ease-in-out z-15
        ${
          isTransitioning && transitionPhase > 20 && transitionPhase < 80
            ? 'opacity-100 scale-110'
            : 'opacity-0 scale-90'
        }
      `}
      >
        <div
          className={`absolute top-1 right-1 w-2 h-1 rounded-full animate-drift-slow shadow-sm transition-colors duration-300
            ${
              transitionPhase < 35 ? 'bg-orange-200/70' : transitionPhase < 65 ? 'bg-pink-200/70' : 'bg-purple-200/70'
            }`}
        />
        <div
          className={`absolute bottom-2 left-1 w-1.5 h-0.5 rounded-full animate-drift-slow shadow-sm transition-colors duration-300
            ${transitionPhase < 35 ? 'bg-yellow-200/60' : transitionPhase < 65 ? 'bg-red-200/60' : 'bg-indigo-200/60'}`}
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className={`absolute top-2.5 left-2 w-1 h-0.5 rounded-full animate-drift-slow shadow-sm transition-colors duration-300
            ${transitionPhase < 35 ? 'bg-amber-200/50' : transitionPhase < 65 ? 'bg-pink-200/50' : 'bg-purple-200/50'}`}
          style={{ animationDelay: '0.6s' }}
        />
        <div
          className={`absolute bottom-0.5 right-2.5 w-1.5 h-0.5 rounded-full animate-drift-slow shadow-sm transition-colors duration-300
            ${transitionPhase < 35 ? 'bg-orange-200/55' : transitionPhase < 65 ? 'bg-red-200/55' : 'bg-slate-200/55'}`}
          style={{ animationDelay: '0.9s' }}
        />
      </div>

      <div
        className={`
        absolute inset-0 transition-opacity duration-200 z-30
        ${isTransitioning ? 'opacity-100' : 'opacity-0'}
      `}
      >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>

      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </Button>
  )
}
