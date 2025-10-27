import { verify } from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
const pdf: any = require('pdf-parse')
import { Request, Response, NextFunction, RequestWithUser } from '../types/interfaces'

export default {
  checkFile: (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      let allOk = true
      const MAGIC_NUMBERS = '25504446'
      const bitmap1 = fs.readFileSync(req.files!.posPdf[0].path).toString('hex', 0, 4)
      const bitmap2 = fs.readFileSync(req.files!.approvalPdf[0].path).toString('hex', 0, 4)
      if (bitmap1 !== MAGIC_NUMBERS) {
        allOk = false
        fs.unlinkSync(req.files!.posPdf[0].path)
      }
      if (bitmap2 !== MAGIC_NUMBERS) {
        fs.unlinkSync(req.files!.approvalPdf[0].path)
        allOk = false
      }
      if (allOk === true) {
        next()
      } else {
        return res.status(422).json({
          code: 'INVALID_FILE',
          data: 'corrupted file',
        })
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROR',
        data: 'Something Broken!!',
      })
    }
  },

  checkFileInPreReg: async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      console.log('RC : ', req.file!.path)
      const MAGIC_NUMBERS = '25504446'
      const bitmap = fs.readFileSync(req.file!.path).toString('hex', 0, 4)
      if (bitmap === MAGIC_NUMBERS) {
        next()
      } else {
        fs.unlinkSync(req.file!.path)
        return res.status(422).json({ code: 'INVALID_FILE', message: 'corrupted file' })
      }
    } catch (error) {
      return res.status(400).json({
        code: 'ERROR',
        message: 'Something Broken!!',
      })
    }
  },

  checkFileInCompany: async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      console.log('company file : ', req.file!.path)
      const MAGIC_NUMBERS = {
        jpg: 'ffd8ffe0',
        png: '89504e47',
      }

      const bitmap = fs.readFileSync(req.file!.path).toString('hex', 0, 4)
      console.log('company magic number : ', bitmap)
      if (bitmap === MAGIC_NUMBERS.jpg || bitmap === MAGIC_NUMBERS.png) {
        next()
      } else {
        fs.unlinkSync(req.file!.path)
        return res.status(422).json({ code: 'INVALID_FILE', data: 'corrupted file' })
      }
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        code: 'ERROR',
        data: 'Something Broken!!',
      })
    }
  },

  checkToken: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    try {
      const token = req.session?.token

      if (token) {
        verify(token, process.env.TOKEN_KEY!, async (err: any, decoded: any) => {
          if (err) return res.status(404).json({ code: 'INVALIDTOKEN', data: err })
          else {
            req.user = decoded
            req.roleData = decoded?.role
            return next()
          }
        })
      } else {
        return res.status(401).json({ code: 'INVALID_TOKEN', data: 'Your token is invalid!' })
      }
    } catch (error) {
      console.log('Error: ' + error)
      return res.status(500).send({ 'Error:': 'Something Broke!' })
    }
  },

  superAdmin: async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const { slug, permissions } = req?.roleData || {}

      if (slug == 'superadmin') return next()
      else return res.status(403).json({ code: 'UNAUTHORIZED', message: 'You are not authorized' })
    } catch (error) {
      return res.status(401).json({ code: 'ERROROCCURED', message: error })
    }
  },

  // delete
  checkDelete: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const roleData = req.roleData

    if ((req?.user?.role as any)?.slug == 'superadmin') {
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'SUPER-ADMIN CAN NOT ALLOW TO DELETE!!',
      })
    }
    if (roleData?.permissions && roleData.permissions.includes('delete')) {
      return next()
    } else {
      return res.status(403).json({ message: 'You do not have permission for delete' })
    }
  },

  checkUpdate: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const roleData = req?.roleData

    if ((req?.user?.role as any)?.slug == 'superadmin') {
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'SUPER-ADMIN CAN NOT ALLOW TO UPDATE!!',
      })
    }
    if (roleData && roleData?.permissions && roleData.permissions.includes('update')) {
      return next()
    } else {
      return res.status(403).json({ message: 'You do not have permission for update' })
    }
  },

  checkCreate: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const roleData = req.roleData

    if ((req?.user?.role as any)?.slug == 'superadmin') {
      return res.status(400).json({
        code: 'ERROROCCURED',
        message: 'SUPER-ADMIN CAN NOT ALLOW TO CREATE!!',
      })
    }
    if (roleData?.permissions && roleData.permissions.includes('create')) {
      return next()
    } else {
      return res.status(403).json({ message: 'You do not have permission for create' })
    }
  },

  checkRoot: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const roleData = req.roleData
    if (roleData && roleData.slug === 'superadmin') return next()
    else if (roleData && roleData.permissions && roleData.permissions.includes('root')) return next()
    else return res.status(403).json({ message: 'You do not have permission' })
  },

  posFolder: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const folderName = `./public/pos/${req.user && req.user.company && (req.user.company as any).title}`
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName)
      }
      next()
    } catch (err) {
      return res.json({
        data: err,
        code: 'ERRORINDIRECTORY',
      })
    }
  },

  rcFolder: (req: RequestWithUser, res: Response, next: NextFunction): void => {
    fs.mkdir(`./public/rc/${req?.user?.company && (req?.user?.company as any)?.title}`, (error) => {
      if (error) {
        next()
      } else {
        console.log('New folder has been created.')
        next()
      }
    })
  },

  approvalFolder: (req: RequestWithUser, res: Response, next: NextFunction): void | Response => {
    const folderName = `./public/approval/${req.user && req.user.company && (req.user.company as any).title}`
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName)
      }
      next()
    } catch (err) {
      return res.json({
        data: err,
        code: 'ERRORINDIRECTORY',
      })
    }
  },

  checkErrorInFile: async (req: RequestWithUser): Promise<boolean | Response> => {
    try {
      let containsError = 'no'
      const filePath = path.join(__dirname, '..', req.file!.path)
      fs.readFile(filePath, async function (err, buffer) {
        if (err) console.log(err)
        if (buffer) {
          const blackListArray = [
            '<p>',
            '<h1>',
            '<h2>',
            '<h3>',
            '<h4>',
            '<h5>',
            '<h6>',
            '<strong>',
            '<em>',
            '<abbr>',
            '<acronym>',
            '<address>',
            '<bdo>',
            '<blockquote>',
            '<cite>',
            '<q>',
            '<code>',
            '<ins>',
            '<del>',
            '<dfn>',
            '<kbd>',
            '<pre>',
            '<samp>',
            '<var>',
            '<br>',
            '</br>',
            '<a>',
            '<base>',
            '</base>',
            '<!DOCTYPE>',
            '<a>',
            '<abbr>',
            '<acronym>',
            '<address>',
            '<applet>',
            '<area>',
            '<article>',
            '<aside>',
            '<audio>',
            '<b>',
            '<base>',
            '<basefont>',
            '<bdi>',
            '<bdo>',
            '<big>',
            '<blockquote>',
            '<body>',
            '<br>',
            '<button>',
            '<canvas>',
            '<caption>',
            '<center>',
            '<cite>',
            '<code>',
            '<col>',
            '<colgroup>',
            '<data>',
            '<datalist>',
            '<dd>',
            '<del>',
            '<details>',
            '<dfn>',
            '<dialog>',
            '<dir>',
            '<div>',
            '<dl>',
            '<dt>',
            '<em>',
            '<embed>',
            '<fieldset>',
            '<figcaption>',
            '<figure>',
            '<font>',
            '<footer>',
            '<form>',
            '<frame>',
            '<frameset>',
            '<h1 >',
            '< h6>',
            '<head>',
            '<header>',
            '<hr>',
            '<html>',
            '<i>',
            '<iframe>',
            '<img>',
            '<input>',
            '<ins>',
            '<isindex>',
            '<kbd>',
            '<label>',
            '<legend>',
            '<li>',
            '<link>',
            '<main>',
            '<map>',
            '<mark>',
            '<marquee>',
            '<menu>',
            '<meta>',
            '<meter>',
            '<nav>',
            '<noframes>',
            '<noscript>',
            '<object>',
            '<ol>',
            '<optgroup>',
            '<option>',
            '<output>',
            '<p>',
            '<param>',
            '<picture>',
            '<pre>',
            '<progress>',
            '<q>',
            '<rp>',
            '<rt>',
            '<ruby>',
            '<s>',
            '<samp>',
            '<script>',
            '<section>',
            '<select>',
            '<small>',
            '<source>',
            '<span>',
            '<strike>',
            '<strong>',
            '<style>',
            '<sub>',
            '<summary>',
            '<sup>',
            '<svg>',
            '<table>',
            '<tbody>',
            '<td>',
            '<template>',
            '<textarea>',
            '<tfoot>',
            '<th>',
            '<thead>',
            '<time>',
            '<title>',
            '<tr>',
            '<track>',
            '<tt>',
            '<u>',
            '<ul>',
            '<a>',
            '<ide>',
            '<br>',
            '<script>',
            '</script>',
            '<title>',
            '<style>',
            '<meta>',
            '<link>',
            '</link>',
            '<base>',
          ]
          const data = await pdf(buffer)
          const containsErrorInFile = blackListArray.some((elements) => data.text.includes(elements))
          if (containsErrorInFile === true) {
            containsError = 'yes'
          }
        }
      })

      console.log(containsError)
      if (containsError === 'yes') {
        return false
      } else {
        return true
      }
    } catch (error: any) {
      return error // Note: this should probably be handled differently, but keeping original logic
    }
  },
}
