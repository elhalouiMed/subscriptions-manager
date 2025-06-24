import Joi from 'joi'

export const subscribeSchema = Joi.object({
  eventKey: Joi.string().required(),
  sessionId: Joi.string().required(),
  intervalMs: Joi.number().optional(),
  cron: Joi.string().optional(),
  sync: Joi.boolean().optional()
})

export const unsubscribeSchema = Joi.object({
  eventKey: Joi.string().required(),
  sessionId: Joi.string().required()
})

export const availabilitySchema = Joi.object({
  eventKey: Joi.string().required(),
  available: Joi.boolean().required()
})
