import mongoose from 'mongoose'
require('dotenv').config()

// Disable strictQuery deprecation warning
mongoose.set('strictQuery', false)

// Database connection function
export default async function (): Promise<mongoose.Connection> {
  const connected = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  console.log(`${connected.connection.name} is connected !!`)
  return connected.connection
}
