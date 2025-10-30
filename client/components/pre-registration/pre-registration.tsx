'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { FaRegFilePdf } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'

import PreRegistrationForm from './preRegistrationForm'
// import { titleCase } from "@/lib/titleCase"; // helper util (see below)

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

interface ApiItem {
  apiSourceAddress?: string
  apiSourceMethod?: string
  apiSourceName?: string
}

interface LocalPartner {
  partnerName?: string
}

interface PreRegistrationData {
  _id: string
  stage?: string
  dossier?: string
  sample?: string
  renewalDate?: string
  localPartner?: LocalPartner[] | string
  registrationNo?: string
  notificationNumber?: string
  submissionDate?: string
  remark?: string
  registeredArtworkCarton?: string
  registeredArtworkOuterCarton?: string
  registeredArtworkPackageInsert?: string
  registeredArtworkLabel?: string
  SKUCode?: string
  CIC?: string
  shelfLife?: string
  siteGMP?: string
  api?: ApiItem[]
  batchSize?: string
  modeOfRegistration?: string
  modeOfVersion?: string
  packSize?: string
  storageCondition?: string
  country?: string
  product?: string
  registrationDate?: string
}

interface PreRegistrationResponse {
  data: PreRegistrationData
}

interface Props {
  preregistrationId: string
  setCountry: (val: string | undefined) => void
  setProduct: (val: string | undefined) => void
  setRegistrationDate: (val: string | undefined) => void
}

export default function PreRegistration({ preregistrationId, setCountry, setProduct, setRegistrationDate }: Props) {
  const [id, setId] = useState<string | null>(null)
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [rowData, setRowData] = useState<PreRegistrationData | null>(null)
  const [showModal, setShowModal] = useState(false)

  const apiUrl = `/api/preregistration/getSingleRegistration/${preregistrationId}`
  const { data: preregistration, mutate } = useSWR<PreRegistrationResponse>(apiUrl, fetcher)

  useEffect(() => {
    if (preregistration?.data) {
      setCountry(preregistration.data.country)
      setProduct(preregistration.data.product)
      setRegistrationDate(preregistration.data.registrationDate)
    }
  }, [preregistration, setCountry, setProduct, setRegistrationDate])

  const handleEdit = (data: PreRegistrationData | undefined) => {
    if (!data) return
    setId(data._id)
    setMode('edit')
    setRowData(data)
    setShowModal(true)
  }

  const handleDownload = async (fileType: string) => {
    try {
      const response = await axios.get(`/api/preregistration/generatePresignedUrl/${preregistrationId}/${fileType}`)
      window.open(response.data.url, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Error generating download link')
    }
  }

  const handleExportPdf = async () => {
    try {
      const response = await axios.get(`/api/preregistration/exportPdf/${preregistrationId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'preregistration-details.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error exporting PDF')
    }
  }

  const data = preregistration?.data

  return (
    <>
      <PreRegistrationForm
        showModal={showModal}
        setShowModal={setShowModal}
        mutate={mutate}
        mode={mode}
        setMode={setMode}
        id={id}
        setId={setId}
        data={rowData}
        setData={setRowData}
      />

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-lg font-semibold">Registration</h2>
          <div className="flex gap-2">
            <Button onClick={handleExportPdf}>Export</Button>
            <Button variant="secondary" onClick={() => handleEdit(data)}>
              Update
            </Button>
          </div>
        </div>

        <div className="h-[66vh] overflow-y-auto pr-1">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="overview">
              <AccordionTrigger>Overview</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Stage</span>
                    <span>{data?.stage ? data.stage : 'No stage available'}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Dossier</span>
                    <span className={data?.dossier === 'submitted' ? 'text-green-600' : 'text-red-500'}>
                      {data?.dossier === 'submitted' ? 'Submitted' : 'Not Submitted'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Sample</span>
                    <span className={data?.sample === 'submitted' ? 'text-green-600' : 'text-red-500'}>
                      {data?.sample === 'submitted' ? 'Submitted' : 'Not Submitted'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Renewal Date</span>
                    <span>{data?.renewalDate ? format(new Date(data.renewalDate), 'PPP') : 'N/A'}</span>
                  </div>

                  <div>
                    <span className="font-medium">Local Partner</span>
                    <div className="mt-1 text-sm">
                      {Array.isArray(data?.localPartner) ? (
                        <ul className="list-disc pl-5">
                          {data?.localPartner.map((item, i) => (
                            <li key={i}>{item.partnerName}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{data?.localPartner || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {['registered', 'direct-supply', 'import-license'].includes(data?.stage || '') && (
              <>
                <AccordionItem value="submission">
                  <AccordionTrigger>Submission Date</AccordionTrigger>
                  <AccordionContent>
                    {data?.submissionDate ? format(new Date(data.submissionDate), 'PPP') : 'N/A'}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="remark">
                  <AccordionTrigger>Remark</AccordionTrigger>
                  <AccordionContent>{data?.remark || 'N/A'}</AccordionContent>
                </AccordionItem>

                <AccordionItem value="rc">
                  <AccordionTrigger>RC (Registration Certificate)</AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="text-red-600 flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDownload('rc')}
                    >
                      <FaRegFilePdf /> <span>Click to download</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </div>
      </Card>
    </>
  )
}
