'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineDown, AiOutlineHome, AiOutlineUp } from 'react-icons/ai'
import { GoStack } from 'react-icons/go'
import { HiOutlineDocumentReport } from 'react-icons/hi'
import { HiOutlineDocumentPlus } from 'react-icons/hi2'
import { VscTools, VscGitPullRequestGoToChanges } from 'react-icons/vsc'
import { IoTrashBinOutline } from 'react-icons/io5'
import { PiPillFill } from 'react-icons/pi'
import { BsGlobeCentralSouthAsia } from 'react-icons/bs'
import { RiBuilding3Line, RiUserSettingsLine } from 'react-icons/ri'
import { HiGlobeEuropeAfrica } from 'react-icons/hi2'
import { MdOutlineAutorenew, MdOutlinePriceChange } from 'react-icons/md'
import { LuUsers } from 'react-icons/lu'

interface SidebarProps {
  open: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const pathname = usePathname()

  // Auto open parent section based on current route
  useEffect(() => {
    if (pathname.startsWith('/product')) setOpenSection('product')
    else if (pathname.startsWith('/report')) setOpenSection('report')
    else if (pathname.startsWith('/admin-tools')) setOpenSection('admin')
    else setOpenSection(null)
  }, [pathname])

  // Helper for active class
  const isActive = (path: string) => pathname === path

  // Helper for section open toggle
  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <div
      className={`w-64 h-full bg-sky-100 text-black flex flex-col justify-between p-4 overflow-y-auto transition-all duration-300 ${
        open ? 'block' : 'hidden md:block'
      }`}
    >
      <ul className="space-y-3">
        {/* Dashboard */}
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive('/dashboard') ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <AiOutlineHome size={20} />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Product Section */}
        <li>
          <button
            type="button"
            onClick={() => toggleSection('product')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${
              openSection === 'product' ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <GoStack size={20} />
              <span>Product</span>
            </span>
            {openSection === 'product' ? <AiOutlineUp size={16} /> : <AiOutlineDown size={16} />}
          </button>

          {openSection === 'product' && (
            <ul className="ml-8 mt-2 space-y-2 text-sm">
              <li>
                <Link
                  href="/product/by-name"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive('/product/by-name')
                      ? 'bg-sky-500 text-white'
                      : 'text-black hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <PiPillFill size={18} />
                  <span>By Name</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/product/by-country"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive('/product/by-country')
                      ? 'bg-sky-500 text-white'
                      : 'text-black hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <BsGlobeCentralSouthAsia size={18} />
                  <span>By Country</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Report Section */}
        <li>
          <button
            type="button"
            onClick={() => toggleSection('report')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${
              openSection === 'report' ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <HiOutlineDocumentReport size={20} />
              <span>Report</span>
            </span>
            {openSection === 'report' ? <AiOutlineUp size={16} /> : <AiOutlineDown size={16} />}
          </button>

          {openSection === 'report' && (
            <ul className="ml-8 mt-2 space-y-2 text-sm">
              <li>
                <Link
                  href="/report/pre-registration"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive('/report/pre-registration')
                      ? 'bg-sky-500 text-white'
                      : 'text-black hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <HiOutlineDocumentPlus size={18} />
                  <span>Registration</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/report/variation"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive('/report/variation')
                      ? 'bg-sky-500 text-white'
                      : 'text-black hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <VscGitPullRequestGoToChanges size={18} />
                  <span>Variation</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/report/renewal"
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                    isActive('/report/renewal')
                      ? 'bg-sky-500 text-white'
                      : 'text-black hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <MdOutlineAutorenew size={18} />
                  <span>Renewal</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Admin Tools Section */}
        <li>
          <button
            type="button"
            onClick={() => toggleSection('admin')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${
              openSection === 'admin' ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <VscTools size={20} />
              <span>Admin Tools</span>
            </span>
            {openSection === 'admin' ? <AiOutlineUp size={16} /> : <AiOutlineDown size={16} />}
          </button>

          {openSection === 'admin' && (
            <ul className="ml-8 mt-2 space-y-2 text-sm">
              {[
                { href: '/admin-tools/roles', icon: <RiUserSettingsLine size={18} />, label: 'Roles' },
                { href: '/admin-tools/users', icon: <LuUsers size={18} />, label: 'Users' },
                { href: '/admin-tools/company', icon: <RiBuilding3Line size={18} />, label: 'Company' },
                { href: '/admin-tools/plans', icon: <MdOutlinePriceChange size={18} />, label: 'Pricing Plan' },
                { href: '/admin-tools/countries', icon: <HiGlobeEuropeAfrica size={18} />, label: 'Countries' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                      isActive(item.href) ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Recycle Bin */}
        <li>
          <Link
            href="/recycle-bin"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive('/recycle-bin') ? 'bg-sky-500 text-white' : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <IoTrashBinOutline size={20} />
            <span>Recycle Bin</span>
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className={`mx-2 ${open ? 'block' : 'hidden'}`}>
        <p className="text-black text-center text-xs mb-0">
          &copy;{new Date().getFullYear()} DDReg Pharma | All rights reserved
        </p>
        <p className="text-xs text-center">
          <Link href="/legal/privacy-policy" className="text-black hover:underline">
            Privacy
          </Link>{' '}
          &#124;{' '}
          <Link href="/legal/cookie-policy" className="text-black hover:underline">
            Cookies
          </Link>{' '}
          &#124;{' '}
          <Link href="/legal/terms" className="text-black hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Sidebar
