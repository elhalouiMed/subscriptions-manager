import Joi from 'joi'
import { SubscriptionType } from '../../../models/subscription'

const base = {
  subscription: Joi.string().trim().required(),
  subscription_type: Joi.string()
    .valid(
      SubscriptionType.Event,
      SubscriptionType.Interval,
      SubscriptionType.DateTimeBased,
      SubscriptionType.Request,
      SubscriptionType.Sync
    )
    .required(),
  interval: Joi.when('subscription_type', {
    is: SubscriptionType.Interval,
    then: Joi.number().min(1).required(),
    otherwise: Joi.forbidden()
  }),
  datetime: Joi.when('subscription_type', {
    is: SubscriptionType.DateTimeBased,
    then: Joi.date().iso().required(),
    otherwise: Joi.forbidden()
  }),
  available: Joi.when('subscription_type', {
    is: SubscriptionType.Sync,
    then: Joi.boolean().required(),
    otherwise: Joi.forbidden()
  }),
  _id: Joi.forbidden(),
  createdAt: Joi.forbidden(),
  updatedAt: Joi.forbidden()
}

export const createSubscriptionSchema = Joi.object(base)

export const updateSubscriptionSchema = Joi.object(base).fork(
  ['subscription', 'subscription_type', 'interval', 'datetime', 'available'],
  schema => schema.optional()
)
