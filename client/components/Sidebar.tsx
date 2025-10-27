'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineHome } from 'react-icons/ai'
import { MdChevronRight } from 'react-icons/md'
import { MdInventory2, MdAssignment, MdAdminPanelSettings } from 'react-icons/md'
import { HiOutlineDocumentPlus } from 'react-icons/hi2'
import { VscGitPullRequestGoToChanges } from 'react-icons/vsc'
import { IoTrashBinOutline } from 'react-icons/io5'
import { PiPillFill } from 'react-icons/pi'
import { BsGlobeCentralSouthAsia } from 'react-icons/bs'
import { RiBuilding3Line, RiUserSettingsLine } from 'react-icons/ri'
import { HiGlobeEuropeAfrica } from 'react-icons/hi2'
import { MdOutlineAutorenew, MdOutlinePriceChange } from 'react-icons/md'
import { LuUsers } from 'react-icons/lu'
import { AnimatePresence, motion } from 'framer-motion'

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

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div
      className={`w-64 h-full bg-gradient-to-b from-sky-50 to-sky-100 text-black flex flex-col justify-between p-4 overflow-y-auto transition-all duration-300 ${
        open ? 'block' : 'hidden md:block'
      }`}
    >
      <ul className="space-y-2">
        {/* Dashboard */}
        <motion.li variants={itemVariants} initial="hidden" animate="visible">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-sky-200 hover:text-sky-900'
            }`}
          >
            <AiOutlineHome size={18} />
            <span className="font-medium">Dashboard</span>
          </Link>
        </motion.li>

        {/* Product Section */}
        <motion.li variants={itemVariants} initial="hidden" animate="visible">
          <button
            type="button"
            onClick={() => toggleSection('product')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              openSection === 'product'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-sky-200 hover:text-sky-900'
            }`}
          >
            <span className="flex items-center gap-3">
              <MdInventory2 size={18} />
              <span className="font-medium">Products</span>
            </span>
            <motion.div
              animate={{ rotate: openSection === 'product' ? 90 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <MdChevronRight size={18} />
            </motion.div>
          </button>

          <AnimatePresence initial={false} mode="wait">
            {openSection === 'product' && (
              <motion.ul
                key="product-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="ml-6 mt-2 space-y-1 text-sm overflow-hidden"
              >
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                >
                  <Link
                    href="/product/by-name"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/product/by-name')
                        ? 'bg-sky-400 text-white'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  >
                    <PiPillFill size={18} />
                    <span>By Name</span>
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <Link
                    href="/product/by-country"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/product/by-country')
                        ? 'bg-sky-400 text-white'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  >
                    <BsGlobeCentralSouthAsia size={18} />
                    <span>By Country</span>
                  </Link>
                </motion.li>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.li>

        {/* Report Section */}
        <motion.li variants={itemVariants} initial="hidden" animate="visible">
          <button
            type="button"
            onClick={() => toggleSection('report')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              openSection === 'report'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-sky-200 hover:text-sky-900'
            }`}
          >
            <span className="flex items-center gap-3">
              <MdAssignment size={18} />
              <span className="font-medium">Reports</span>
            </span>
            <motion.div
              animate={{ rotate: openSection === 'report' ? 90 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <MdChevronRight size={18} />
            </motion.div>
          </button>

          <AnimatePresence initial={false} mode="wait">
            {openSection === 'report' && (
              <motion.ul
                key="report-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="ml-6 mt-2 space-y-1 text-sm overflow-hidden"
              >
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                >
                  <Link
                    href="/report/pre-registration"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/report/pre-registration')
                        ? 'bg-sky-400 text-white'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  >
                    <HiOutlineDocumentPlus size={18} />
                    <span>Registration</span>
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <Link
                    href="/report/variation"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/report/variation')
                        ? 'bg-sky-400 text-white'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  >
                    <VscGitPullRequestGoToChanges size={18} />
                    <span>Variation</span>
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                >
                  <Link
                    href="/report/renewal"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/report/renewal')
                        ? 'bg-sky-400 text-white'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                    }`}
                  >
                    <MdOutlineAutorenew size={18} />
                    <span>Renewal</span>
                  </Link>
                </motion.li>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.li>

        {/* Admin Tools Section */}
        <motion.li variants={itemVariants} initial="hidden" animate="visible">
          <button
            type="button"
            onClick={() => toggleSection('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              openSection === 'admin'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-sky-200 hover:text-sky-900'
            }`}
          >
            <span className="flex items-center gap-3">
              <MdAdminPanelSettings size={18} />
              <span className="font-medium">Settings</span>
            </span>
            <motion.div
              animate={{ rotate: openSection === 'admin' ? 90 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <MdChevronRight size={18} />
            </motion.div>
          </button>

          <AnimatePresence initial={false} mode="wait">
            {openSection === 'admin' && (
              <motion.ul
                key="admin-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="ml-6 mt-2 space-y-1 text-sm overflow-hidden"
              >
                {[
                  { href: '/admin-tools/roles', icon: <RiUserSettingsLine size={18} />, label: 'Roles' },
                  { href: '/admin-tools/users', icon: <LuUsers size={18} />, label: 'Users' },
                  { href: '/admin-tools/company', icon: <RiBuilding3Line size={18} />, label: 'Company' },
                  { href: '/admin-tools/plans', icon: <MdOutlinePriceChange size={18} />, label: 'Pricing Plan' },
                  { href: '/admin-tools/countries', icon: <HiGlobeEuropeAfrica size={18} />, label: 'Countries' },
                ].map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-sky-400 text-white'
                          : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.li>

        {/* Recycle Bin */}
        <motion.li variants={itemVariants} initial="hidden" animate="visible">
          <Link
            href="/recycle-bin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive('/recycle-bin')
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-sky-200 hover:text-sky-900'
            }`}
          >
            <IoTrashBinOutline size={18} />
            <span className="font-medium">Recycle Bin</span>
          </Link>
        </motion.li>
      </ul>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={`mx-2 border-t border-sky-300 pt-3 ${open ? 'block' : 'hidden'}`}
      >
        <p className="text-gray-600 text-center text-xs mb-1">&copy; {new Date().getFullYear()} DDReg Pharma</p>
        <p className="text-xs text-center space-x-1">
          <Link href="/legal/privacy-policy" className="text-gray-600 hover:text-sky-600 transition-colors">
            Privacy
          </Link>{' '}
          <span className="text-gray-400">&#124;</span>{' '}
          <Link href="/legal/cookie-policy" className="text-gray-600 hover:text-sky-600 transition-colors">
            Cookies
          </Link>{' '}
          <span className="text-gray-400">&#124;</span>{' '}
          <Link href="/legal/terms" className="text-gray-600 hover:text-sky-600 transition-colors">
            Terms
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Sidebar
