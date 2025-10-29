import NotificationCounter from '../model/notificationCounter'
import Product from '../model/product'
import Country from '../model/country'
import Company from '../model/company'
import { io } from '../server'

// Interface for notification data
interface NotificationData {
  userId: string
  message: string
  type?: string
  data?: any
}

class NotificationService {
  // Generate notification number: [3COMP]/[3PROD]/[3COUN]/[year]/[month]/[day]/[0001]
  static async generateNotificationNumber(companyId: string, productId: string, countryId: string): Promise<string> {
    try {
      // Get company, product, and country names (first 3 letters uppercase)
      const [company, product, country] = await Promise.all([
        Company.findById(companyId),
        Product.findById(productId),
        Country.findById(countryId),
      ])

      if (!company) throw new Error('Company not found')
      if (!product) throw new Error('Product not found')
      if (!country) throw new Error('Country not found')

      const companyPrefix: string = company.title.substring(0, 3).toUpperCase()
      const productPrefix: string = product.title.substring(0, 3).toUpperCase()
      const countryPrefix: string = country.title.substring(0, 3).toUpperCase()

      // Get current date components
      const now: Date = new Date()
      const year: string = now.getFullYear().toString()
      const month: string = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based
      const day: string = String(now.getDate()).padStart(2, '0')

      // Get and increment counter for this company + product + country combination
      const currentYear: number = now.getFullYear()
      let counter = await NotificationCounter.findOne({
        year: currentYear,
        company: companyId,
        product: productId,
        country: countryId,
        status: true,
      })

      if (!counter) {
        // Create new counter for this company-product-country-year combination
        counter = new NotificationCounter({
          year: currentYear,
          currentCounter: 0,
          company: companyId,
          product: productId,
          country: countryId,
        })
      }

      // Increment counter
      counter.currentCounter += 1
      await counter.save()

      // Format counter (4 digits, 0-padded)
      const counterFormatted: string = String(counter.currentCounter).padStart(4, '0')

      // Generate notification number: [3COMP]/[3PROD]/[3COUN]/[year]/[month]/[day]/[0001]
      const notificationNumber: string = `${companyPrefix}/${productPrefix}/${countryPrefix}/${year}/${month}/${day}/${counterFormatted}`

      return notificationNumber
    } catch (error) {
      console.error('Error generating notification number:', error)
      throw error
    }
  }

  // Send notification to specific user
  static sendToUser(userId: string, message: string, type: string = 'info', data?: any): void {
    try {
      if (io) {
        const notificationData: NotificationData = {
          userId,
          message,
          type,
          data,
        }
        io.to(userId).emit('notification', notificationData)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Broadcast notification to all connected users
  static broadcast(message: string, type: string = 'info', data?: any): void {
    try {
      if (io) {
        const notificationData: NotificationData = {
          userId: 'all',
          message,
          type,
          data,
        }
        io.emit('notification', notificationData)
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error)
    }
  }
}

export { NotificationService, NotificationData }
export default NotificationService
