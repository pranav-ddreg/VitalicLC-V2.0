'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { camelCase } from '@/utils/ChangeStringCasing'
import CustomModal from './CustomModal'

interface ExportSelectedFieldsProps {
  count: number
  name: string
  columns: Array<{ name: string; key?: string; export?: boolean }>
  exportUrl: string
  apiUrlExportExcel?: string
  apiUrlExportPdf?: string
}

const ExportSelectedFields: React.FC<ExportSelectedFieldsProps> = ({
  count,
  name,
  columns,
  exportUrl,
  apiUrlExportExcel,
  apiUrlExportPdf,
}) => {
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [checkAll, setCheckAll] = useState(true)

  // Initialize selected fields when modal opens
  useEffect(() => {
    if (showExportModal) handleCheckAll(true)
  }, [showExportModal])

  // Update "Check All" if all individual fields are selected
  useEffect(() => {
    const allSelected = Object.values(selectedFields).every(Boolean)
    setCheckAll(allSelected)
  }, [selectedFields])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setSelectedFields((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCheckAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {}
    columns.forEach((col) => {
      if (col?.export !== false) updated[col.key || col.name] = checked
    })
    setSelectedFields(updated)
    setCheckAll(checked)
  }

  const handleDownload = async (type: 'pdf' | 'xlsx') => {
    const fields = Object.keys(selectedFields).filter((key) => selectedFields[key])
    const formattedFields = fields.map((key) => (key.toUpperCase() === key ? key : camelCase(key)))

    if (formattedFields.length === 0) {
      toast.error('Please select at least one field.')
      return
    }

    let baseUrl = exportUrl
    if (type === 'pdf' && apiUrlExportPdf) baseUrl = apiUrlExportPdf
    if (type === 'xlsx' && apiUrlExportExcel) baseUrl = apiUrlExportExcel

    const params = new URLSearchParams({
      selectedFields: JSON.stringify(formattedFields),
      isDownload: 'true',
      filetype: type,
    })
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`

    const toastId = toast.loading('Downloading...')
    try {
      const res = await axios.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `${name}.${type}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Downloaded successfully.', { id: toastId })
      setShowExportModal(false)
    } catch {
      toast.error('Download failed.', { id: toastId })
    }
  }

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => (count > 0 ? setShowExportModal(true) : toast.error('No data to export.'))}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
      >
        Export
      </button>

      {/* Export Modal */}
      <CustomModal
        size="md"
        show={showExportModal}
        setShow={setShowExportModal}
        title="Select fields to export"
        content={
          <div className="mx-3 text-[1.1rem]">
            <div className="flex flex-col gap-2">
              {columns.map(
                (col) =>
                  col?.export !== false && (
                    <label key={col.name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={col.key || col.name}
                        checked={!!selectedFields[col.key || col.name]}
                        onChange={handleChange}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span>{col.name}</span>
                    </label>
                  )
              )}

              {/* Check All */}
              <label className="flex items-center gap-2 mt-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="All"
                  checked={checkAll}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>All</span>
              </label>
            </div>

            {/* Export Options */}
            <div className="flex justify-end gap-2 mt-4">
              <div className="relative group">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                  Export ▼
                </button>
                <div className="absolute right-0 hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-10">
                  <button
                    onClick={() => handleDownload('xlsx')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export XLSX
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}

export default ExportSelectedFields
