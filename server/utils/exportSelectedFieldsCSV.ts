const xl = require('excel4node')
import { capitalize } from './textCasing'

// Interface for XLSX export data
interface XLSXExportData {
  [key: string]: any
}

// Interface for field mapping
interface FieldMapping {
  field: string
  label?: string
}

// Export data to XLSX format
export const exportSelectedFieldsXLSX = async (data: XLSXExportData[], fieldsToExport: string[]): Promise<Buffer> => {
  const wb: any = new (xl as any).Workbook()
  const ws: any = wb.addWorksheet('Data Export')

  // Style for header
  const headerStyle: any = wb.createStyle({
    font: {
      color: '#FFFFFF',
      bold: true,
      size: 12,
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#000000',
    },
    alignment: {
      horizontal: 'left',
    },
  })

  const dataStyle: any = wb.createStyle({
    font: {
      size: 11,
    },
  })

  const dateStyle: any = wb.createStyle({
    font: {
      size: 11,
    },
    numberFormat: 'dd/mm/yyyy',
  })

  // Prepare headers with field name transformations
  const headers: string[] = fieldsToExport.map((field: string) => {
    if (field === 'registrationDate') return 'ApprovalDate'
    if (field === 'renewDate') return 'RenewalDate'
    if (field === 'product') return 'Product'
    if (field === 'localPartner') return 'LocalPartners'
    return capitalize(field)
  })

  // Add headers
  headers.forEach((header: string, index: number) => {
    ws.cell(1, index + 1)
      .string(header)
      .style(headerStyle)
  })

  // Add data rows
  data.forEach((obj: XLSXExportData, rowIndex: number) => {
    fieldsToExport.forEach((field: string, colIndex: number) => {
      let cellValue: string = ''
      let cellStyle: any = dataStyle

      // Handle dates first
      if (Object.prototype.toString.call(obj[field]) === '[object Date]') {
        const dateValue: Date = new Date(obj[field])
        if (isNaN(dateValue.getTime())) {
          cellValue = String(obj[field] || '')
        } else {
          ws.cell(rowIndex + 2, colIndex + 1)
            .date(dateValue)
            .style(dateStyle)
          return // Skip string cell since date is set
        }
      } else {
        // Handle different field types for flattened data
        if (field === 'product' || field === 'company' || field === 'country') {
          // For flattened data: just use the string value
          if (typeof obj[field] === 'string') {
            cellValue = obj[field]
          } else {
            // Legacy support: nested objects
            cellValue = String(obj[field]?.title || obj[field]?.['title'] || '')
          }
        } else if (field === 'plan') {
          cellValue = String(obj[field]?.[field] || obj[field] || '')
        } else if (field === 'permissions') {
          cellValue = String(obj[field]?.join(',') || '')
        } else if (field === 'localPartner') {
          if (Array.isArray(obj[field])) {
            if (obj[field].length === 1 && !obj[field]?.[0]?.partnerName) {
              cellValue = 'N/A'
            } else {
              cellValue = String(obj[field]?.map((partner: any) => partner?.partnerName).join(',') || '')
            }
          } else {
            cellValue = String(obj[field] || 'N/A')
          }
        } else {
          // For simple fields like "deletedBy", "type", etc. in flattened data
          cellValue = String(obj[field] || '')
        }
      }

      ws.cell(rowIndex + 2, colIndex + 1)
        .string(cellValue)
        .style(cellStyle)
    })
  })

  // Auto-fit columns
  headers.forEach((_, index: number) => {
    ws.column(index + 1).setWidth(20)
  })

  const buffer: Buffer = await wb.writeToBuffer()
  return buffer
}

export default { exportSelectedFieldsXLSX }
