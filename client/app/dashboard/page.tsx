'use client'

import React, { useEffect } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import { BiCube } from 'react-icons/bi'
import { FiFileText, FiCornerUpLeft } from 'react-icons/fi'
import { PiStackBold } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import AlertReport from '@/components/dashboard/AlertReport'
import ExpectedActual from '@/components/dashboard/ExpectedActual'
import Marquee from '@/components/dashboard/Marquee'
import StatusTop5 from '@/components/dashboard/StatusTop5'
import DemographicOverview from '@/components/dashboard/DemographicOverview'
import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import CombinedLatestData from '@/components/dashboard/CombinedLatestData'

// Local, minimal prop typing for what we actually use
type ProgressbarStyles = ReturnType<typeof buildStyles>
interface MiniCircularProgressbarProps {
  value: number
  text?: string
  styles?: ProgressbarStyles
}

// Typed thin wrapper to avoid any casts
const MiniCircularProgressbar: React.FC<MiniCircularProgressbarProps> = ({ value, text, styles }) => {
  return <CircularProgressbar value={value} text={text} styles={styles} />
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function Dashboard() {
  const router = useRouter()
  const { data: dashboard, mutate } = useSWR(`/api/dashboard`, fetcher)

  useEffect(() => {
    mutate()
  }, [mutate])

  const productCards = [
    {
      name: 'Approvals',
      total: dashboard?.data?.approval || 0,
      icon: <BiCube className="w-6 h-6" />,
      colorClass: 'bg-blue-100 text-blue-500',
      link: '/pre-registration',
    },
    {
      name: 'PreRegistration',
      total: dashboard?.data?.preRegistration || 0,
      icon: <FiFileText className="w-6 h-6" />,
      colorClass: 'bg-yellow-100 text-yellow-500',
      link: '/pre-registration',
    },
    {
      name: 'Variation',
      total: (dashboard?.data?.totalVariation || 0) - (dashboard?.data?.approvedVariation || 0),
      icon: <PiStackBold className="w-6 h-6" />,
      colorClass: 'bg-red-100 text-red-500',
      link: '/variation',
    },
    {
      name: 'Renewals',
      total: (dashboard?.data?.totalRenewal || 0) - (dashboard?.data?.renewal || 0),
      icon: <FiCornerUpLeft className="w-6 h-6" />,
      colorClass: 'bg-green-100 text-green-500',
      link: '/renewal',
    },
  ]

  const RegistrationOverview = [
    {
      name: 'Total',
      total: dashboard?.data?.totalPreRegistration || 0,
      icon: <BiCube className="w-6 h-6" />,
    },
    {
      name: 'Registered',
      total: dashboard?.data?.registeredPreRegistration || 0,
      percentage: dashboard?.data?.totalPreRegistration
        ? (dashboard.data.registeredPreRegistration / dashboard.data.totalPreRegistration) * 100
        : 0,
    },
    {
      name: 'Under Process',
      total: dashboard?.data?.underProcessPreRegistration || 0,
      percentage: dashboard?.data?.totalPreRegistration
        ? (dashboard.data.underProcessPreRegistration / dashboard.data.totalPreRegistration) * 100
        : 0,
    },
    {
      name: 'Under Registration',
      total: dashboard?.data?.underRegisterPreRegistration || 0,
      percentage: dashboard?.data?.totalPreRegistration
        ? (dashboard.data.underRegisterPreRegistration / dashboard.data.totalPreRegistration) * 100
        : 0,
    },
  ]

  const RenewalOverview = [
    {
      name: 'Total',
      total: dashboard?.data?.totalRenewal || 0,
    },
    {
      name: 'Initiated',
      total:
        dashboard?.data?.totalRenewal - ((dashboard?.data?.submittedRenewal || 0) + (dashboard?.data?.renewal || 0)),
      percentage: dashboard?.data?.totalRenewal
        ? ((dashboard.data.totalRenewal - (dashboard.data.submittedRenewal + dashboard.data.renewal)) /
            dashboard.data.totalRenewal) *
          100
        : 0,
    },
    {
      name: 'Submitted',
      total: dashboard?.data?.submittedRenewal || 0,
      percentage: dashboard?.data?.totalRenewal
        ? (dashboard.data.submittedRenewal / dashboard.data.totalRenewal) * 100
        : 0,
    },
    {
      name: 'Renewed',
      total: dashboard?.data?.renewal || 0,
      percentage: dashboard?.data?.totalRenewal ? (dashboard.data.renewal / dashboard.data.totalRenewal) * 100 : 0,
    },
  ]

  const VariationOverview = [
    {
      name: 'Total',
      total: dashboard?.data?.totalVariation || 0,
    },
    {
      name: 'Approved',
      total: dashboard?.data?.approvedVariation || 0,
      percentage: dashboard?.data?.totalVariation
        ? (dashboard.data.approvedVariation / dashboard.data.totalVariation) * 100
        : 0,
    },
    {
      name: 'Pending',
      total:
        (dashboard?.data?.totalVariation || 0) -
        ((dashboard?.data?.approvedVariation || 0) + (dashboard?.data?.rejectedVariation || 0)),
      percentage: dashboard?.data?.totalVariation
        ? (((dashboard.data.totalVariation || 0) -
            ((dashboard.data.approvedVariation || 0) + (dashboard.data.rejectedVariation || 0))) /
            dashboard.data.totalVariation) *
          100
        : 0,
    },
    {
      name: 'Rejected',
      total: dashboard?.data?.rejectedVariation || 0,
      percentage: dashboard?.data?.totalVariation
        ? (dashboard.data.rejectedVariation / dashboard.data.totalVariation) * 100
        : 0,
    },
  ]

  return (
    <>
      <CustomBreadcrumbs list={[{ name: 'Dashboard', link: '' }]} />
      <Marquee
        pauseOnHover
        renewalHeadline={dashboard?.data?.headlineRenewal?.renewal}
        variationHeadline={dashboard?.data?.headlineRenewal?.variation}
        expireHeadline={dashboard?.data?.expireHeadline}
      />

      <div className="flex flex-wrap gap-4">
        {/* Left Main Section */}
        <div className="w-full xl:w-3/4 flex flex-col gap-4">
          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productCards.map((card, idx) => (
              <div key={idx} className="bg-gray-50 shadow p-4 rounded h-full flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="text-2xl font-bold">{card.total}</div>
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${card.colorClass}`}>
                    {card.icon}
                  </div>
                </div>
                <div>
                  <div className="text-base font-semibold">{card.name}</div>
                  <button onClick={() => router.push(card.link)} className="mt-1 font-medium text-orange-500 text-sm">
                    Know More
                  </button>
                </div>
              </div>
            ))}
          </div>

          <DemographicOverview data={dashboard?.data?.countryMap} />
          <ItemOverView Overview={RegistrationOverview} title="Registration Overview" />
          <ExpectedActual />
          <ItemOverView Overview={VariationOverview} title="Variation Overview" />
          <ItemOverView Overview={RenewalOverview} title="Renewal Overview" />
          <AlertReport />
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-1/4 flex flex-col gap-4">
          <StatusTop5 data={dashboard?.data?.topCountry} />
          <CombinedLatestData
            tabName="Registration"
            link="/pre-registration"
            data={dashboard?.data?.latestPreRegistration}
          />
          <CombinedLatestData tabName="Variation" link="/variation" data={dashboard?.data?.latestVariation} />
          <CombinedLatestData tabName="Renewal" link="/renewal" data={dashboard?.data?.latestRenewal} />
        </div>
      </div>
    </>
  )
}

// =============== SAFE ItemOverview ================

interface ItemOverViewProps {
  Overview: Array<{
    name: string
    total: number
    percentage?: number
  }>
  title: string
}

function ItemOverView({ Overview, title }: ItemOverViewProps) {
  const colors = (val: number) => {
    if (val <= 30) return '#dc3545' // red
    if (val <= 60) return '#ffc107' // yellow
    if (val <= 90) return '#0dcaf0' // cyan
    return '#198754' // green
  }

  return (
    <div className="mt-4 mb-2">
      <div className="text-lg font-semibold">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        {Overview.map((cardItem, idx) => (
          <div key={idx} className="bg-gray-50 shadow p-4 rounded flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-bold">{cardItem.total}</div>
              {cardItem.percentage !== undefined && (
                <div className="w-16 h-16 flex justify-center items-center font-semibold">
                  <MiniCircularProgressbar
                    value={cardItem.percentage}
                    text={`${Math.round(cardItem.percentage)}%`}
                    styles={buildStyles({
                      textSize: '28px',
                      pathColor: colors(cardItem.percentage),
                      textColor: colors(cardItem.percentage),
                      trailColor: '#d6d6d6',
                    })}
                  />
                </div>
              )}
            </div>
            <div className="text-base font-semibold">{cardItem.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
