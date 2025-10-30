require('dotenv').config()
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

interface LoginDetail {
  firstName: string
  lastName: string
  recipientEmail: string
}

interface OtpDetail {
  recipientEmail: string
  firstName?: string
  otp: string
  subject?: string
  logoUrl?: string
  brandName?: string
  supportEmail?: string
  appUrl?: string
}

const loginNotificationTemplate = (detail: LoginDetail): string => {
  const fullName = [detail.firstName, detail.lastName].filter(Boolean).join(' ')
  const brandPrimary = '#f97316'
  const brandAccent = '#f59e0b'
  const brandText = '#1f2937'
  const brandMuted = '#6b7280'
  const surface = '#ffffff'
  const surfaceAlt = '#fffbeb'
  const border = '#fde68a'

  return `
    <div style="margin:0;padding:0;background:${surfaceAlt};">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${surfaceAlt};padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:${surface};border:1px solid ${border};border-radius:12px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:24px;background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);color:${surface};text-align:center;border-bottom:1px solid ${border};">
                  <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;">🔐 Security Alert</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:${brandText};font-weight:600;">
                    Login Attempt Notification
                  </h2>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                    Hello ${fullName || 'User'},
                  </p>
                  <div style="margin:0 0 20px 0;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
                    <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#991b1b;font-weight:600;">
                      ⚠️ Security Notification
                    </p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#991b1b;">
                      An incorrect password was entered for your account. This may indicate unauthorized access attempts.
                    </p>
                  </div>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                    If this was you, please disregard this message. If you did not attempt to log in, please:
                  </p>
                  <ul style="margin:0 0 20px 0;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                    <li>Contact your system administrator immediately</li>
                    <li>Change your password from a secure location</li>
                    <li>Review your recent account activity</li>
                  </ul>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                    Thank you for maintaining your account security.
                  </p>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                    Best regards,<br/>
                    <strong>Vitalic Global Team</strong>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 24px;background:${surface};border-top:1px solid ${border};">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${brandMuted};text-align:center;">
                    This is an automated security notification. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

let mailTransporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST || 'smtp-mail.outlook.com',
  port: parseInt(process.env.NODEMAILER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.NODEMAILER_COMPANY_EMAIL,
    pass: process.env.NODEMAILER_COMPANY_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export const loginNotificationEmail = async (detail: LoginDetail): Promise<void> => {
  try {
    const subject = 'Login Attempt Notification'
    const template = loginNotificationTemplate(detail)

    let mailDetails = {
      from: process.env.NODEMAILER_COMPANY_EMAIL,
      to: detail?.recipientEmail,
      // bcc: process.env.ENV_STATUS === 'development' ? 'pranav.c@ddreg.in' : 'it@ddreg.in',
      subject: subject,
      html: template,
    }

    mailTransporter.sendMail(mailDetails, function (err: Error | null, data: any) {
      if (err) {
        console.log(err.message, 'Error occurred while sending email')
      } else {
        console.log('Email sent successfully')
      }
    })
  } catch (error) {
    console.log('Something Broken!!')
    throw new Error('Something Broken!!')
  }
}

export const sendOtpEmail = async (detail: OtpDetail): Promise<boolean> => {
  try {
    const {
      recipientEmail,
      firstName = '',
      otp,
      subject = 'Your One-Time Password (OTP)',
      logoUrl = process.env.COMPANY_LOGO_URL || '',
      brandName = process.env.COMPANY_NAME || 'Vitalic Global',
      supportEmail = process.env.SUPPORT_EMAIL || process.env.NODEMAILER_COMPANY_EMAIL || 'support@vitalicglobal.com',
      appUrl = process.env.APP_URL || '',
    } = detail || {}

    if (!recipientEmail || !otp) {
      throw new Error('Missing recipientEmail or otp for sendOtpEmail')
    }

    const preheader = `Your OTP is ${otp}. It expires in 10 minutes.`
    const safeFirstName = firstName || 'User'

    // Theme colors
    const brandPrimary = process.env.BRAND_PRIMARY_COLOR || '#f97316'
    const brandAccent = process.env.BRAND_ACCENT_COLOR || '#f59e0b'
    const brandText = '#1f2937'
    const brandMuted = '#6b7280'
    const surface = '#ffffff'
    const surfaceAlt = '#fffbeb'
    const border = '#fde68a'

    function getLogoBase64(logoPath: string): string {
      try {
        const imageBuffer = fs.readFileSync(logoPath)
        return imageBuffer.toString('base64')
      } catch (err: any) {
        console.log('Error loading logo for base64:', err.message)
        return ''
      }
    }

    const logoBase64 = getLogoBase64(path.join(__dirname, '../utils/media/logo-black.png'))

    const html = `
      <div style="margin:0;padding:0;background:${surfaceAlt};">
        <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">
          ${preheader}
        </span>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${surfaceAlt};padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:${surface};border:1px solid ${border};border-radius:12px;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding:20px 24px;background:${surface};border-bottom:1px solid ${border};">
                    <table role="presentation" width="100%">
                      <tr>
                        <td align="left" style="vertical-align:middle;">
                          <img src="data:image/png;base64,${logoBase64}" alt="${brandName} logo" width="120" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:100%;">
                             
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${brandMuted};">Security Notification</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:28px 24px 8px;">
                    <h1 style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:${brandText};font-weight:700;">
                      Your one-time password (OTP)
                    </h1>
                    <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                      Hello ${safeFirstName},
                    </p>
                    <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                      Use the OTP below to continue. This code expires in <strong>10 minutes</strong>.
                    </p>

                    <!-- OTP block -->
                    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:16px auto 8px auto;">
                      <tr>
                        <td align="center" style="background:#fff7ed;border:1px dashed ${brandAccent};border-radius:10px;padding:14px 18px;">
                          <div style="font-family:Consolas,Menlo,Monaco,monospace;font-size:28px;letter-spacing:6px;line-height:1;color:${brandText};font-weight:700;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>

                    ${
                      appUrl
                        ? `<p style="margin:8px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${brandMuted};text-align:center;">
                             Tip: Open <a href="${appUrl}" style="color:${brandPrimary};text-decoration:none;">${appUrl.replace(/^https?:\/\//, '')}</a> and paste the OTP to continue.
                           </p>`
                        : ''
                    }

                    <!-- Notice -->
                    <div style="margin:20px 0 0 0;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                        Do not share this code with anyone. Our team will never ask for your OTP.
                      </p>
                    </div>

                    <p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                      If you did not request this, you can safely ignore this email.
                    </p>

                    <p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${brandText};">
                      Regards,<br/>${brandName}
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:14px 24px;background:${surface};border-top:1px solid ${border};">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${brandMuted};">
                      Need help? Contact us at
                      <a href="mailto:${supportEmail}" style="color:${brandPrimary};text-decoration:none;">${supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${brandMuted};margin-top:10px;text-align:center;">
                You received this email because an OTP was requested for your account.
              </div>
            </td>
          </tr>
        </table>
      </div>
    `

    const text = [
      `Hello ${safeFirstName},`,
      ``,
      `Your OTP is: ${otp}`,
      `It expires in 10 minutes.`,
      ``,
      `If you did not request this, please ignore this email.`,
      ``,
      `Regards,`,
      `${brandName}`,
      supportEmail ? `Support: ${supportEmail}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const mailDetails = {
      from: process.env.NODEMAILER_COMPANY_EMAIL,
      to: recipientEmail,
      // bcc: process.env.ENV_STATUS === 'development' ? 'pranav.c@ddreg.in' : 'it@ddreg.in',
      subject,
      html,
      text,
    }

    return await new Promise((resolve, reject) => {
      try {
        mailTransporter.sendMail(mailDetails, function (err: any, data: any) {
          if (err) {
            console.log(err.message, 'Error occurred while sending OTP email')
            return reject(err)
          } else {
            console.log('OTP Email sent successfully')
            return resolve(true)
          }
        })
      } catch (error: any) {
        console.log('sendOtpEmail exception:', error.message)
        return reject(error)
      }
    })
  } catch (error: any) {
    console.log('sendOtpEmail failed:', error.message)
    throw error
  }
}

export default { sendOtpEmail, loginNotificationEmail }
