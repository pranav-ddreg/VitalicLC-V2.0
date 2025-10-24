'use client'

import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, Graticule, Sphere } from 'react-simple-maps'
import { Tooltip } from 'react-tooltip'
import { useRouter } from 'next/navigation'
import { FaCompress, FaExpand } from 'react-icons/fa'
import geoUrl from '../../data/mapData/feature.json'

interface CountryData {
  _id?: string
  title: string
  approval?: number
  preRegistration?: number
  variations?: number
  renewals?: number
}

interface DemographicOverviewContentProps {
  data?: CountryData[]
  showModal: boolean
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

interface Marker {
  name: string
  markerOffset: number
  coordinates: [number, number]
}

interface GeographyFeature {
  rsmKey: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  properties: {
    name: string
    [key: string]: string | number | undefined
  }
}

const DemographicOverviewContent: React.FC<DemographicOverviewContentProps> = ({
  data = [],
  showModal,
  setShowModal,
}) => {
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState<(CountryData & { country?: string }) | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Only render on client

  const markers: Marker[] = []

  return (
    <div className="bg-white shadow rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
        <h3 className="text-base font-semibold text-gray-700 m-0">Demographic Overview of Products</h3>
        <div
          className="cursor-pointer text-gray-600 hover:text-gray-800 transition"
          onClick={() => setShowModal((prev) => !prev)}
        >
          {!showModal ? <FaExpand size={20} /> : <FaCompress size={20} />}
        </div>
      </div>

      {/* Map Section */}
      <div className="p-3" data-tooltip-id="country-tooltip" data-tooltip-content={content?.country || ''}>
        <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }} height={393}>
          {/* <Sphere stroke="rgb(31 42 60)" strokeWidth={0.2} /> */}
          <Sphere id="sphere" fill="transparent" stroke="rgb(31 42 60)" strokeWidth={0.2} />
          <Graticule stroke="rgb(31 42 60)" strokeWidth={0.2} />

          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies?: GeographyFeature[] }) =>
              geographies?.map((geo: GeographyFeature) => {
                const country = data.find((d) => d.title.toLowerCase() === geo.properties?.name.toLowerCase())

                if (country) {
                  const coords = geo.geometry.coordinates?.[0]?.[0]
                  const lat = coords ? Math.round(coords[0]) : 0
                  const long = coords ? Math.round(coords[1]) : 0
                  markers.push({
                    name: geo.properties.name,
                    markerOffset: 15,
                    coordinates: [lat, long],
                  })
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => country?._id && router.push(`/by-countries/${country._id}`)}
                    onMouseEnter={() => {
                      if (country) setContent({ ...country, country: geo.properties?.name })
                    }}
                    onMouseLeave={() => setContent(null)}
                    style={{
                      default: { fill: country ? '#fa812e' : '#1e3a8a', outline: 'none' },
                      hover: {
                        fill: country ? '#fa812e' : '#1e3a8a',
                        outline: 'none',
                        cursor: country?._id ? 'pointer' : 'default',
                      },
                      pressed: { fill: country ? '#fa812e' : '#1e3a8a', outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        <Tooltip id="country-tooltip" className="bg-gray-900 text-white rounded-md p-2 text-sm">
          {content && (
            <div>
              <h5 className="text-white text-lg font-semibold mb-1">{content.country}</h5>
              <ul className="list-none p-0">
                <li>Approvals: {content.approval || 0}</li>
                <li>Pre-registrations: {content.preRegistration || 0}</li>
                <li>Variations: {content.variations || 0}</li>
                <li>Renewals: {content.renewals || 0}</li>
              </ul>
            </div>
          )}
        </Tooltip>
      </div>
    </div>
  )
}

interface DemographicOverviewProps {
  data?: CountryData[]
}

const DemographicOverview: React.FC<DemographicOverviewProps> = ({ data = [] }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {/* Fullscreen Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full h-full bg-white overflow-auto">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <FaCompress size={22} />
            </button>
            <DemographicOverviewContent data={data} showModal={showModal} setShowModal={setShowModal} />
          </div>
        </div>
      )}

      {/* Regular View */}
      {!showModal && (
        <div className="my-3">
          <DemographicOverviewContent data={data} showModal={showModal} setShowModal={setShowModal} />
        </div>
      )}
    </>
  )
}

export default DemographicOverview
