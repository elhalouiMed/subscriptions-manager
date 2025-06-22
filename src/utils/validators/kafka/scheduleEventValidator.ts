import Joi from 'joi'
import { SubscriptionType } from '../../../models/subscription'

const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/

const eventDataSchema = Joi.object({
  subscription_type: Joi.string().valid(SubscriptionType.Event).required()
})

const requestDataSchema = Joi.object({
  subscription_type: Joi.string().valid(SubscriptionType.Request).required()
})

const intervalDataSchema = Joi.object({
  subscription_type: Joi.string().valid(SubscriptionType.Interval).required(),
  interval: Joi.number().positive().required(),
  available: Joi.boolean().optional()
})

const datetimeDataSchema = Joi.object({
  subscription_type: Joi.string().valid(SubscriptionType.DateTimeBased).required(),
  datetime: Joi.string().pattern(dateTimePattern).required()
})

const syncDataSchema = Joi.object({
  subscription_type: Joi.string().valid(SubscriptionType.Sync).required(),
  interval: Joi.number().positive().required(),
  available: Joi.boolean().required()
})

const dataSchema = Joi.alternatives().try(
  eventDataSchema,
  requestDataSchema,
  intervalDataSchema,
  datetimeDataSchema,
  syncDataSchema
)

export const subscriptionSchema = Joi.object({
  subscription: Joi.string().required(),
  data: dataSchema.required()
})
