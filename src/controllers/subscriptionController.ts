import { RequestHandler } from 'express'
import {
  createSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscription,
  deleteSubscription
} from '../services/subscriptionService'
import { ISubscription } from '../models/schemas/subscriptionSchema'
import {
  createSubscriptionSchema,
  updateSubscriptionSchema
} from '../utils/validators/http/subscriptionValidator'

export const createSubscriptionController: RequestHandler = async (req, res, next) => {
  const { error, value } = createSubscriptionSchema.validate(req.body, {
    abortEarly: false
  })
  if (error) {
    res.status(400).json({ errors: error.details.map(d => d.message) })
    return
  }

  try {
    const subscription = await createSubscription(
      value as Partial<ISubscription>
    )
    res.status(201).json(subscription)
  } catch (err) {
    next(err)
  }
}

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

export const updateSubscriptionController: RequestHandler = async (
  req,
  res,
  next
) => {
  const { error, value } = updateSubscriptionSchema.validate(req.body, {
    abortEarly: false
  })
  if (error) {
    res.status(400).json({ errors: error.details.map(d => d.message) })
    return
  }

  try {
    const updated = await updateSubscription(
      req.params.id,
      value as Partial<ISubscription>
    )
    if (!updated) {
      res.sendStatus(404)
      return
    }
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const deleteSubscriptionController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const removed = await deleteSubscription(req.params.id)
    if (!removed) {
      res.sendStatus(404)
      return
    }
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}
