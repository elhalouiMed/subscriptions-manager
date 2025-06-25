import mongoose, { Schema } from 'mongoose'

export interface ISubscription {
  eventKey: string
  sessionIds: string[]
  available?: boolean
  createdAt: Date
  updatedAt: Date
  intervalMs?: number,
  cron?: string
}

const SubscriptionSchema = new Schema<ISubscription>({
  eventKey: { type: String, required: true, index: true, unique: true },
  sessionIds: { type: [String], required: true, default: [] },
  intervalMs: { type: Number, required: false},
  cron: { type: String, required: false },
  available: { type: Boolean },
}, {
  timestamps: true
})

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
