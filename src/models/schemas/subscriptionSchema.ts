import mongoose, { Schema, Document, Model } from 'mongoose'
import { SubscriptionType } from '../subscription'

export interface ISubscription extends Document {
  subscription: string
  subscription_type: SubscriptionType
  interval?: number
  datetime?: Date
  available?: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    subscription: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subscription_type: {
      type: String,
      required: true,
      enum: Object.values(SubscriptionType),
    },
    interval: {
      type: Number,
      min: 1,
    },
    datetime: {
      type: Date,
    },
    available: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
)

export const SubscriptionModel: Model<ISubscription> =
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
