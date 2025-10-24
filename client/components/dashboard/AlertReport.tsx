'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { MdOutlineFilterList, MdOutlineFilterListOff } from 'react-icons/md'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

interface AlertItem {
  _id?: string
  product?: string
  country?: string
  renewDate?: string
  renewalDate?: string
}

interface YearItem {
  year: string
}

export default function AlertReport() {
  const [reportYear, setReportYear] = useState<string | ''>('')

  const { data: yearsData } = useSWR<{ data: YearItem[] }>('/api/dashboard/renewYear', fetcher)
  const { data: alertData, mutate } = useSWR<{ data: AlertItem[] }>(
    `/api/dashboard/alertReport?year=${reportYear || ''}`,
    fetcher
  )

  // Recalculate remaining days
  const dayDiffer = (renewDate?: string) => {
    if (!renewDate) return 0
    const one_day = 1000 * 60 * 60 * 24
    const present_date = new Date()
    const expires_on = new Date(renewDate)
    return Math.round((expires_on.getTime() - present_date.getTime()) / one_day)
  }

  useEffect(() => {
    mutate()
  }, [])

  // Auto-set current year if available
  useEffect(() => {
    if (yearsData?.data?.length) {
      const currentYear = new Date().getFullYear().toString()
      if (yearsData.data.some((y) => y.year === currentYear)) {
        setReportYear(currentYear)
      }
    }
  }, [yearsData])

  // Determine Tailwind bg color based on remaining days
  const getBgColor = (item: AlertItem) => {
    const days = dayDiffer(item?.renewDate || item?.renewalDate)
    if (days < 0) return 'bg-gray-500 text-white' // Expired
    if (days < 90) return 'bg-red-600 text-white' // 0-90
    if (days < 180) return 'bg-yellow-500 text-white' // 90-180
    if (days < 270) return 'bg-yellow-300 text-white' // 180-270
    return 'bg-green-600 text-white' // Renewed
  }

  return (
    <div className="p-4">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <h3 className="text-xl font-semibold">Alert Report</h3>
        <div className="flex items-center gap-3">
          {reportYear ? (
            <MdOutlineFilterList size={20} className="cursor-pointer" onClick={() => setReportYear('')} />
          ) : (
            <MdOutlineFilterListOff size={20} />
          )}
          <select
            value={reportYear}
            onChange={(e) => setReportYear(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Year</option>
            {yearsData?.data?.map((year) => (
              <option key={year.year} value={year.year}>
                {year.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Product</th>
              <th className="border px-2 py-1 text-left">Country</th>
              <th className="border px-2 py-1 text-left">Renewal Date</th>
              <th className="border px-2 py-1 text-left">Remaining Days</th>
            </tr>
          </thead>
          <tbody>
            {alertData?.data?.length ? (
              alertData.data.map((item, idx) => {
                const bgClass = getBgColor(item)
                return (
                  <tr key={idx} className={bgClass}>
                    <td className="border px-2 py-1">{item.product || 'N/A'}</td>
                    <td className="border px-2 py-1">{item.country || 'N/A'}</td>
                    <td className="border px-2 py-1">
                      {item.renewDate
                        ? new Date(item.renewDate).toLocaleDateString()
                        : item.renewalDate
                          ? new Date(item.renewalDate).toLocaleDateString()
                          : 'N/A'}
                    </td>
                    <td className="border px-2 py-1">{dayDiffer(item.renewDate || item.renewalDate)} Days</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  NO DATA FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
