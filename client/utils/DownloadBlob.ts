import axios from 'axios'
import { toast } from 'react-hot-toast'

/**
 * Downloads a file from a given URL as a blob and triggers browser download
 * @param url - File URL
 * @param filename - Desired filename
 */
export const DownloadBlob = async (url: string, filename: string): Promise<void> => {
  const toastId = toast.loading('Downloading...')

  try {
    const response = await axios.get<Blob>(url, {
      responseType: 'blob', // important to get raw binary data
    })

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Clean up
    link.parentNode?.removeChild(link)

    toast.success('Downloaded Successfully.', { id: toastId })
  } catch (err) {
    toast.error('Download failed.', { id: toastId })
    console.error('DownloadBlob error:', err)
  }
}
