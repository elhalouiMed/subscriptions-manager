import { RequestHandler } from 'express'
import {
  getSubscription,
  listSubscriptions,
  upsertSubscription,
  setAvailability,
  removeSubscription,
  getSubscriptionByEventKey
} from '../services/subscriptionService'
import { availabilitySchema, subscribeSchema, unsubscribeSchema } from '../utils/validators/http/subscriptionValidator'
import { registerTask } from '../services/scheduler'
import { msToCron } from '../utils/cron'


export const getSubscriptionController: RequestHandler = async (req, res, next) => {
  try {
    const subscription = await getSubscription(req.params.id)
    if (!subscription) {
      res.sendStatus(404)
      return
    }
    res.json(subscription)
  } catch (err) {
    next(err)
  }
}

export const listSubscriptionsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const subs = await listSubscriptions(req.query as Record<string, any>)
    res.json(subs)
  } catch (err) {
    next(err)
  }
}

export const subscribeController: RequestHandler = async (req, res, next) => {
  const { error, value } = subscribeSchema.validate(req.body, {
    abortEarly: false
  })
  if (error) {
    res.status(400).json({ errors: error.details.map(d => d.message) })
    return
  }
  try {
    const { eventKey, sessionId, intervalMs, cron, sync } = value
    const subscription = await upsertSubscription(eventKey, sessionId)
    if(intervalMs && !sync){ // Interval
      const intervalAsCron = msToCron(intervalMs)
      await registerTask(eventKey, intervalAsCron)
    } else if(cron) { // DatseTime
      await registerTask(eventKey, cron)
    } else if(sync) { // Sync
      const subscription = await getSubscriptionByEventKey(eventKey)
      const intervalAsCron = intervalMs && msToCron(intervalMs)
      if (subscription?.available) {
        await registerTask(eventKey, intervalAsCron)
      }
    } else { // Event
      await registerTask(eventKey)
    }  
    res.status(201).json(subscription)
  } catch (err) {
    next(err)
  }
}

export const unsubscribeController: RequestHandler = async (req, res, next) => {
  const { error, value } = unsubscribeSchema.validate(req.body, {
    abortEarly: false
  })

  if (error) {
    res.status(400).json({ errors: error.details.map(d => d.message) })
    return
  }

  try {
    const { eventKey, sessionId } = value
    await removeSubscription(eventKey, sessionId)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export const availabilityController: RequestHandler = async (req, res, next) => {
  const { error, value } = availabilitySchema.validate(req.body, {
    abortEarly: false
  })

  if (error) {
    res.status(400).json({ errors: error.details.map(d => d.message) })
    return
  }

  try {
    const { eventKey, available } = value
    const updated = await setAvailability(eventKey, available)

    if (!updated) {
      res.sendStatus(404)
      return
    }

    res.json(updated)
  } catch (err) {
    next(err)
  }
}
