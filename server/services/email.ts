import nodemailer, { Transporter, SendMailOptions } from 'nodemailer'

// Interface for email options
interface EmailOptions {
  receiverEmail: string
  ccEmail?: string
  subjectData: string
  data: string
}

// Interface for nodemailer transport configuration
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  tls?: {
    rejectUnauthorized: boolean
  }
}

// Create nodemailer transporter
const createTransporter = (): Transporter => {
  if (!process.env.NODEMAILER_COMPANY_EMAIL || !process.env.NODEMAILER_COMPANY_EMAIL_PASSWORD) {
    throw new Error(
      'Email configuration missing. Please check NODEMAILER_COMPANY_EMAIL and NODEMAILER_COMPANY_EMAIL_PASSWORD environment variables.'
    )
  }

  const config: EmailConfig = {
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
  }

  return nodemailer.createTransport(config)
}

// Function to send email
export const emailSend = (receiverEmail: string, ccEmail: string, subjectData: string, data: string): void => {
  try {
    const mailTransporter: Transporter = createTransporter()

    const mailDetails: SendMailOptions = {
      from: 'noreply@vitalicglobal.com',
      to: receiverEmail,
      cc: ccEmail,
      subject: subjectData,
      html: data,
    }

    mailTransporter.sendMail(mailDetails, (err: Error | null, info: any) => {
      if (err) {
        console.error('Email sending error:', err)
      } else {
        console.log('Email sent successfully:', info.response)
      }
    })
  } catch (error) {
    console.error('Something went wrong with email service:', error)
  }
}

// Legacy AWS SES function (commented out but preserved for future reference)
// export const emailSendAWS = (receiverEmail: string, ccEmail: string[], subjectData: string, data: string): Promise<boolean> => {
//   // AWS SES implementation would go here
//   return Promise.resolve(true);
// };

export default { emailSend }
