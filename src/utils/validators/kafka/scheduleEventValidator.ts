import Joi from 'joi'
import { KafkaEvent } from '../../../models/subscription'

export const kafkaEventSchema = Joi.object<KafkaEvent>({
  id: Joi.string().required(),
  payload: Joi.object({
    eventKey: Joi.string().required(),
    data: Joi.any().required(),
  }).required(),
})

export const availabilityEventSchema = Joi.object<KafkaEvent<{ available: boolean }>>({
  id: Joi.string().required(),
  payload: Joi.object({
    eventKey: Joi.string().required(),
    data: Joi.object({ available: Joi.boolean().required() }).required(),
  }).required(),
})