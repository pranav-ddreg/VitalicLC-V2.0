import FolderModel from '../model/folder'
import RenewalModel from '../model/renewal'
import variationModel from '../model/variation'
import FileModel from '../model/file'
import AdmZip from 'adm-zip'
import fs from 'fs'
import Path from 'path'
import { Types } from 'mongoose'
import { serverErrorResponse } from '../utils/commonFunctions'
import {
  uploadZip,
  getFileData,
  extractAndStoreFile,
  presignUpload,
  getMultipartPartUrls,
  completeMultipart,
  abortMultipart,
  getPresignedUrlForDownload,
} from '../services/uploadsFiles'
import { Request, Response, RequestWithUser } from '../types/interfaces'

export default {
  uploadZipFile: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { renewalId, variationId } = req.query
      let parent = req.params?.parentId
      const parentId = parent

      if (!Types.ObjectId.isValid(parent as string)) return res.status(400).send({ error: 'Invalid parent' })

      const file = req.files?.zipFile
      if (!file) return res.status(400).json({ error: 'Zip file is required' })

      if (!parent) return res.status(400).json({ error: 'Parent is required' })

      const folder = await FolderModel.exists({ _id: parent })
      const renewal = await RenewalModel.exists({ _id: parent })
      const variation = await variationModel.exists({ _id: parent })
      if (!renewal && !folder && !variation) return res.status(400).send({ error: 'Invalid Parent' })

      let path = `dossier/${parent}`

      if (!(file as any)?.name.includes('.zip')) return res.status(400).json({ error: 'File must be a zip file' })
      const fileName = (file as any)?.name.split('.zip')[0]

      const dataExist = await FolderModel.findOne({ title: fileName, parent })
      if (dataExist) return res.status(409).json({ error: `folder with this ${fileName} already exists.` })

      const zipFilePath = (file as any)?.path
      if (!fs.existsSync(zipFilePath)) return res.status(404).json({ error: 'Zip file not found' })

      const zip = new AdmZip(zipFilePath)
      const zipEntries = zip.getEntries()

      console.log(zipEntries, 'zipEntries')

      for (const entry of zipEntries) {
        const entryData = entry?.entryName.split('/')
        for (const folderAndFile of entryData) {
          if (folderAndFile) {
            if (folderAndFile.includes('.')) {
              let { name: title, ext: extension } = Path.parse(folderAndFile)
              extension = extension.toString().split('.').pop() || ''

              if (!['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'xml'].includes(extension)) {
                continue
              }

              const fileData = entry.getData()
              const { error, uploadFile } = await uploadZip(path, fileData, folderAndFile)
              if (error)
                return res.status(500).json({
                  error: 'Error occurred while uploading zip file',
                })

              const createFile = await FileModel.create({
                title,
                extension,
                file: uploadFile,
                parent,
              })
            } else {
              const dataExist = await FolderModel.findOne({ title: folderAndFile, parent }, { title: 1 })
              if (dataExist) parent = dataExist._id
              else {
                const createFolder = await FolderModel.create({
                  title: folderAndFile,
                  parent,
                })
                parent = createFolder._id
              }
            }
          }
        }
        parent = parentId
      }

      return res.status(201).json({ message: 'Zip uploaded successfully!' })
    } catch (error) {
      console.log(error)
      return serverErrorResponse(res, error as Error)
    }
  },

  viewFolder: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.parentId
      const { search, order } = req.query

      const result = await FolderModel.aggregate(
        [
          {
            $match: {
              title: { $regex: search || '', $options: 'si' },
              parent: new Types.ObjectId(id as string),
            },
          },
          {
            $lookup: {
              from: 'folders',
              localField: '_id',
              foreignField: 'parent',
              pipeline: [{ $project: { title: 1 } }],
              as: 'childrenFolders',
            },
          },
          {
            $lookup: {
              from: 'files',
              localField: '_id',
              foreignField: 'parent',
              pipeline: [{ $project: { title: 1 } }],
              as: 'childrenFiles',
            },
          },
          {
            $project: {
              title: 1,
              parent: 1,
              createdAt: 1,
              updatedAt: 1,
              children: {
                $cond: {
                  if: {
                    $or: [{ $gt: [{ $size: '$childrenFolders' }, 0] }, { $gt: [{ $size: '$childrenFiles' }, 0] }],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $unionWith: {
              coll: 'files',
              pipeline: [
                { $match: { parent: new Types.ObjectId(id as string) } },
                {
                  $project: {
                    deleted: 0,
                    __v: 0,
                  },
                },
              ],
            },
          },
          { $sort: { title: order === 'ascending' ? 1 : -1 } },
        ],
        { collation: { locale: 'en' } }
      )

      return res.status(200).send({ message: 'Folder fetched successfully!', data: result })
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },

  downloadFile: async (req: Request, res: Response): Promise<Response> => {
    try {
      const key = req.query?.key
      const downloadFile = req.query?.downloadFile

      if (!key) {
        return res.status(400).json({ message: 'Key is required' })
      }

      if (downloadFile === 'true') {
        const { signedUrl, error } = await getPresignedUrlForDownload(key as string)
        if (error) {
          return res.status(500).json({ error: 'Error getting download URL', details: error })
        }
        if (signedUrl) {
          res.redirect(signedUrl)
          return res.status(200).end() // Since res.redirect returns void, we need to return manually
        }
      }

      const { data, error } = await getFileData(key as string)

      if (error) {
        return res.status(500).json({ error: error })
      }

      const keyString = String(Array.isArray(key) ? key[0] : key || '')
      const extension = keyString.split('.').pop()?.toLowerCase()
      let contentType: string
      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf'
          break
        case 'doc':
          contentType = 'application/msword'
          break
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        default:
          contentType = 'application/octet-stream'
      }

      return res.json({
        base64: (data as any).Body.toString('base64'),
        contentType: contentType,
      })
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },

  presignUpload: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { originalName, contentType, sizeBytes, parentId } = req.body || {}

      if (!originalName) return res.status(400).json({ message: 'originalName is required' })
      if (!parentId) return res.status(400).json({ message: 'parentId is required' })
      if (typeof sizeBytes !== 'number' || sizeBytes <= 0)
        return res.status(400).json({ message: 'sizeBytes must be a positive number' })

      const folder = await FolderModel.exists({ _id: parentId })
      if (!folder) return res.status(400).json({ message: 'Invalid parentId' })

      const apiFolder = `dossier/${parentId}`
      const result = await presignUpload(originalName, contentType, sizeBytes, apiFolder)

      return res.json(result)
    } catch (err: any) {
      console.error('presignUpload error:', err)
      return res.status(err.status || 500).json({ message: err.message || 'Server error' })
    }
  },

  getMultipartPartUrls: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key, uploadId, start, end } = req.body || {}
      if (!key || !uploadId) return res.status(400).json({ message: 'key and uploadId are required' })

      const result = await getMultipartPartUrls(key, uploadId, start, end)
      return res.json(result)
    } catch (err: any) {
      console.error('getMultipartPartUrls error:', err)
      return res.status(500).json({ message: err.message || 'Server error' })
    }
  },

  completeMultipartUpload: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key, uploadId, parts, parentId, originalName, contentType } = req.body || {}
      if (!key || !uploadId || !Array.isArray(parts))
        return res.status(400).json({ message: 'key, uploadId, parts are required' })
      if (!parentId || !originalName || !contentType)
        return res.status(400).json({ message: 'parentId, originalName, contentType are required' })

      const result = await completeMultipart(key, uploadId, parts)
      const { name: title, ext: extension } = Path.parse(originalName)
      const fileRecord = await FileModel.create({
        title: title || originalName,
        extension: (extension || '').replace('.', ''),
        file: { Key: key, Location: result.location },
        parent: parentId,
      })

      return res.json({ ...result, fileId: fileRecord._id })
    } catch (err: any) {
      console.error('completeMultipart error:', err)
      return res.status(500).json({ message: err.message || 'Server error' })
    }
  },

  abortMultipartUpload: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key, uploadId } = req.body || {}
      if (!key || !uploadId) return res.status(400).json({ message: 'key and uploadId are required' })

      const result = await abortMultipart(key, uploadId)
      return res.json(result)
    } catch (err: any) {
      console.error('abortMultipart error:', err)
      return res.status(500).json({ message: err.message || 'Server error' })
    }
  },

  downloadFolderAsZip: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.folderId
      let pathArray: any[] = []

      let mainFolder = await FolderModel.findById(id, { title: 1, parent: 1 })
      if (!mainFolder) {
        mainFolder = await RenewalModel.findById(id, {
          title: 'renewal-dossier',
        })
      }

      if (!mainFolder) {
        mainFolder = await variationModel.findById(id, {
          title: 'variation-dossier',
        })
      }

      if (!mainFolder) return res.status(404).json({ error: 'folder not found' })

      const getFolderPath = async (parentId: string, currentPath: string) => {
        const folders = await FolderModel.find({ parent: parentId }, { title: 1 })

        const folderPaths = folders?.map((folder: any) =>
          currentPath ? `${currentPath}/${folder?.title}` : folder?.title
        )

        if (folderPaths.length === 0 && folders.length === 0 && currentPath) folderPaths.push(currentPath)

        // Get all files under the current parent
        const files = await FileModel.find({ parent: parentId }, { title: 1, extension: 1, file: 1 })

        const filePaths = files.map((file: any) => {
          if (file) {
            return {
              path: currentPath
                ? `${currentPath}/${file?.title}.${file?.extension}`
                : `${file?.title}.${file?.extension}`,
              fileKey: file?.file?.Key,
            }
          }
        })

        // Concatenate folder paths and file paths to pathArray
        pathArray.push(...folderPaths, ...filePaths)

        // Recursively call getFolderPath for each child folder
        for (const folder of folders) {
          await getFolderPath(folder._id, currentPath ? `${currentPath}/${folder?.title}` : folder?.title)
        }
      }

      // Get paths recursively starting from the parent folder
      await getFolderPath(id, mainFolder?.title)

      // Download Zip file
      const zip = new AdmZip()
      console.log(pathArray, 'path arr')
      // Iterate through each item in the pathArray
      for (const filePath of pathArray) {
        if (typeof filePath === 'object') {
          // Add files to the ZIP archive
          const { error, fileData } = await extractAndStoreFile(filePath?.fileKey)
          if (error) return res.status(500).json({ error: 'Error ocurred while extracting file data' })
          zip.addFile(filePath?.path, fileData)
        } else {
          // Add empty directories to the ZIP archive
          zip.addFile(`${filePath}/`, Buffer.alloc(0), '', 0o755 << 16)
        }
      }

      res.set('Content-Type', 'application/zip')
      res.set('Content-Disposition', `attachment; filename=${mainFolder?.title}.zip`)
      return res.status(200).send(zip.toBuffer())
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },

  breadCrumb: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.folderId
      const breadCrumbArray: any[] = []

      const parent = await FolderModel.findById(id, { title: 1, parent: 1 })

      const getBreadCrumb = async (parentId: string | Types.ObjectId, breadCrumb: any) => {
        if (breadCrumb?._id) {
          breadCrumbArray.push(breadCrumb)
        }
        const parent = await FolderModel.findById(parentId, {
          title: 1,
          parent: 1,
        })

        if (parent) {
          await getBreadCrumb(parent?.parent, {
            _id: parent?._id,
            name: parent?.title,
          })
        } else {
          const fileData = await FileModel.findById(parentId)
          breadCrumbArray.push({ _id: fileData?._id, name: fileData?.title })
        }
      }

      await getBreadCrumb(parent?.parent || id, {
        _id: parent?._id,
        name: parent?.title,
      })
      return res.status(200).json({
        message: 'Breadcrumbs fetch Successfully!',
        data: breadCrumbArray.reverse()?.slice(1),
      })
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },

  deleteAllFolders: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params?.parentId

      // Function to recursively delete folders and their contents
      const deleteFolderRecursively = async (folderId: string) => {
        // Find all subfolders of the current folder
        const subFolders = await FolderModel.find({ parent: folderId })

        // Delete each subfolder and its contents recursively
        for (const subFolder of subFolders) {
          await deleteFolderRecursively(subFolder?._id)
        }

        // Delete all files in the current folder
        await FileModel.deleteMany({ parent: folderId })

        // Delete the current folder
        await FolderModel.deleteMany({ parent: folderId })
      }

      // If a folder is found, delete it and its contents recursively
      await deleteFolderRecursively(id)

      return res.status(200).json({ message: 'Folder and its contents deleted successfully!' })
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },

  deleteFolderFile: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const id = req.params.id // Extract id from request parameters

      // Function to recursively delete folders and their contents
      const deleteFolderRecursively = async (folderId: string) => {
        // Find all subfolders of the current folder
        const subFolders = await FolderModel.find({ parent: folderId })

        // Delete each subfolder and its contents recursively
        for (const subFolder of subFolders) {
          await deleteFolderRecursively(subFolder?._id)
        }

        // Delete all files in the current folder
        await FileModel.deleteMany({ parent: folderId })

        // Delete the current folder
        await FolderModel.findByIdAndDelete(folderId)
      }

      // Try to delete the folder first
      const folder = await FolderModel.findById(id)

      if (folder) {
        // If a folder is found, delete it and its contents recursively
        await deleteFolderRecursively(id)
      } else {
        // If no folder is found, try to delete the file
        const file = await FileModel.findByIdAndDelete(id)
        if (!file) {
          return res.status(404).json({ error: 'Item not found' })
        }
      }

      return res.status(200).json({ message: 'Deleted successfully!' })
    } catch (error) {
      return serverErrorResponse(res, error as Error)
    }
  },
}
