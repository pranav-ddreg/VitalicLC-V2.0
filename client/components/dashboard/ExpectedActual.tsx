'use client'

import React, { useEffect, useState, JSX } from 'react'
import useSWR from 'swr'
import axios, { AxiosResponse } from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MdOutlineFilterList, MdOutlineFilterListOff } from 'react-icons/md'
import moment from 'moment'

// ---------- Fetcher ----------
const fetcher = async <T,>(url: string): Promise<T> => axios.get<T>(url).then((res: AxiosResponse<T>) => res.data)

// ---------- Types ----------
interface Year {
  year: string
}

interface Country {
  _id: string
  title: string
}

interface ExpectedActualData {
  product: string
  ActualDays: number
  ExpectedDays: number
  expDate?: string
  actualDate?: string
  country?: string
}

interface ExpectedActualTooltipItem {
  payload: ExpectedActualData
  name: string
  value: number
}
interface SWRResponse<T> {
  data: T
}

// ---------- Custom Tick ----------
const CustomizedAxisTick = (props: {
  x?: number
  y?: number
  payload?: { value: string | number }
}): React.ReactElement<SVGElement> => {
  const { x, y, payload } = props
  if (x === undefined || y === undefined || !payload) {
    // Return empty <g> element to satisfy TypeScript
    return <g />
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={13} textAnchor="end" fill="#666" transform="rotate(-45)" className="text-xs">
        {String(payload.value).slice(0, 8) + '...'}
      </text>
    </g>
  )
}

// ---------- Custom Tooltip ----------
const CustomTooltip = (props: { active?: boolean; payload?: ExpectedActualTooltipItem[] }): JSX.Element | null => {
  const { active, payload } = props
  if (active && payload && payload.length > 0 && payload[0].payload) {
    const data = payload[0].payload
    const expDate = data.expDate ? moment(data.expDate).format('LL') : 'N/A'
    const actDate = data.actualDate ? moment(data.actualDate).format('LL') : 'N/A'

    return (
      <div className="bg-white border border-gray-200 p-3 rounded shadow text-sm">
        <h5 className="font-bold text-gray-700">
          {data.product} - {data.country ?? 'N/A'}
        </h5>
        <p>
          Actual: <span className="text-green-600">{actDate}</span>
        </p>
        <p>
          Expected: <span className="text-red-600">{expDate}</span>
        </p>
      </div>
    )
  }
  return null
}

// ---------- Main Component ----------
const ExpectedActual: React.FC = () => {
  const [year, setYear] = useState<string>('')
  const [country, setCountry] = useState<string>('')

  const { data: years } = useSWR<SWRResponse<Year[]>>('/api/dashboard/preRegistrationYear', fetcher)
  const { data: countries } = useSWR<SWRResponse<{ data: Country[] }>>(
    '/api/country/get?listLess=true&order=ascending',
    fetcher
  )
  const { data, mutate } = useSWR<SWRResponse<ExpectedActualData[]>>(
    `/api/dashboard/expectedActual?year=${year}&country=${country}`,
    fetcher
  )

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <div className="bg-white shadow rounded my-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 p-4 border-b">
        <h3 className="text-gray-700 font-semibold text-lg m-0">Expected vs Actual</h3>
        <div className="flex flex-wrap items-center gap-3 justify-end flex-1">
          {year || country ? (
            <span
              className="cursor-pointer text-gray-600"
              onClick={() => {
                setYear('')
                setCountry('')
              }}
            >
              <MdOutlineFilterList size={20} />
            </span>
          ) : (
            <span className="text-gray-400">
              <MdOutlineFilterListOff size={20} />
            </span>
          )}

          {/* Year select */}
          <div className="w-36">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Select Year</option>
              {years?.data?.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>

          {/* Country select */}
          <div className="w-48">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Select Country</option>
              {countries?.data?.data?.map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="99%" height={400}>
          <LineChart data={data?.data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" height={100} tick={CustomizedAxisTick} />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Line type="monotone" dataKey="ActualDays" name="Actual Days" stroke="#0e9488" />
            <Line type="monotone" dataKey="ExpectedDays" name="Expected Days" stroke="#ca3d4c" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ExpectedActual
