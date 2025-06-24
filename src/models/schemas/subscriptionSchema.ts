import mongoose, { Schema } from 'mongoose'

export interface ISubscription {
  eventKey: string
  sessionIds: string[]
  available?: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>({
  eventKey: { type: String, required: true, index: true, unique: true },
  sessionIds: { type: [String], required: true, default: [] },
  available: { type: Boolean, default: true },
}, {
  timestamps: true
})

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
