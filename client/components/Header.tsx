'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { FaBars, FaCompress, FaExpand } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { toggleFullScreen } from '../utils/ToggleFullScreen'
import logo from '@/public/logoFull.png'
import logoSmall from '@/public/mini-logo.png'

// ✅ Props from parent layout
interface HeaderProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<HeaderProps> = ({ open, setOpen }) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const handleFullscreenToggle = () => {
    toggleFullScreen()
    setIsFullscreen((prev) => !prev)
  }

  return (
    <header
      style={{ backgroundColor: 'oklch(52% 0.105 223.128)' }}
      className="w-full h-14 bg-blue-900 text-white flex items-center justify-between px-4 shadow-md"
    >
      {/* Left Section: Logo + Sidebar Toggle */}
      <div className="flex items-center gap-20">
        <Image src={open ? logo : logoSmall} alt="Website Logo" width={open ? 125 : 30} height={open ? 40 : 30} />

        {/* Sidebar toggle button */}
        <button onClick={() => setOpen(!open)} className="text-white hover:text-gray-200">
          <FaBars size={20} />
        </button>
      </div>

      {/* Middle Section: Search Bar */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Section: Fullscreen & User Menu */}
      <div className="flex items-center gap-4">
        {/* Fullscreen toggle */}
        <button onClick={handleFullscreenToggle} className="hover:text-gray-200">
          {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
        </button>

        {/* User dropdown menu */}
        <div className="relative group cursor-pointer">
          <span className="text-sm font-medium">User</span>
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg hidden group-hover:block z-10">
            <a className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</a>
            <a className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
