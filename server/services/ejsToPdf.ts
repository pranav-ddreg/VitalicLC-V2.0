import * as fs from 'fs'
import puppeteer, { PDFOptions } from 'puppeteer'
import * as path from 'path'
import * as ejs from 'ejs'

// Interface for PDF configuration
interface PDFConfig {
  format: 'letter' | 'a4'
  landscape: boolean
  printBackground: boolean
  margin: {
    top: string
    bottom: string
    left: string
    right: string
  }
  preferCSSPageSize: boolean
}

// Interface for generatingEjsToFile options
interface GenerateEjsOptions {
  templateName: string
  data: any
  fieldsToExport?: any
  title?: string
  orientation?: boolean
}

// Interface for return types
interface PDFResult {
  ok: boolean
  fileBuffer?: Buffer
  error?: any
}

// Compile EJS template
const compile = async (template: string, data: any, fieldsToExport?: any): Promise<string> => {
  const filePath = path.join(__dirname, '../views', `${template}.ejs`)
  const ejsData: string = fs.readFileSync(filePath, 'utf8')
  return ejs.compile(ejsData)({ data: data, fieldsToExport: fieldsToExport })
}

// Compile EJS template with fields and title
const fieldsToExportAndTitleCompile = async (
  template: string,
  data: any,
  fieldsToExport: any,
  title: string
): Promise<string> => {
  const filePath = path.join(__dirname, '../views', `${template}.ejs`)
  const ejsData: string = fs.readFileSync(filePath, 'utf8')
  return ejs.compile(ejsData)({ data: data, fieldsToExport: fieldsToExport, title: title })
}

// Generate PDF from EJS template
export const generatingEjsToFile = async (
  templateName: string,
  data: any,
  fieldsToExport: any,
  title: string,
  orientation: boolean = false
): Promise<PDFResult> => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    })

    const page = await browser.newPage()
    const content: string = await compile(templateName, data, fieldsToExport)

    const pdfConfig: PDFOptions = {
      format: 'letter',
      landscape: orientation,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      preferCSSPageSize: true,
    }

    await page.setContent(content, { waitUntil: 'load' })
    await page.emulateMediaType('screen')
    const buffer: Buffer = Buffer.from(await page.pdf(pdfConfig))

    await browser.close()

    return { ok: true, fileBuffer: buffer }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { ok: false, error: error }
  }
}

// Generate PDF from EJS template with fields and title
export const generatingEjsWithFieldToExportAndTitle = async (
  templateName: string,
  data: any,
  fieldsToExport: any,
  title: string,
  orientation: boolean = false
): Promise<PDFResult> => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    })

    const page = await browser.newPage()
    const content: string = await fieldsToExportAndTitleCompile(templateName, data, fieldsToExport, title)

    const pdfConfig: PDFOptions = {
      format: 'letter',
      landscape: orientation,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      preferCSSPageSize: true,
    }

    await page.setContent(content, { waitUntil: 'load' })
    await page.emulateMediaType('screen')
    const buffer: Buffer = Buffer.from(await page.pdf(pdfConfig))

    await browser.close()

    return { ok: true, fileBuffer: buffer }
  } catch (error) {
    console.error('Error generating PDF with fields and title:', error)
    return { ok: false, error: error }
  }
}

export default { generatingEjsToFile, generatingEjsWithFieldToExportAndTitle }
