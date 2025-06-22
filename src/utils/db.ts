import mongoose from 'mongoose'
import { config } from '../config'
import { logger } from '..'

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb_uri, {})
    logger.info('MongoDB connected')
  } catch (err) {
    logger.error('MongoDB connection error:', err)
    process.exit(1)
  }
}