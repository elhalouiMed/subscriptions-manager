import { ISubscription, SubscriptionModel } from "../models/schemas/subscriptionSchema"

export const getSubscriptionById = async (
  id: string
): Promise<ISubscription | null> =>
  SubscriptionModel.findById(id).lean().exec()

export const listSubscriptions = async (
  filter: Partial<Record<keyof ISubscription, any>> = {}
): Promise<ISubscription[]> =>
  SubscriptionModel.find(filter).lean().exec()

export const upsertSubscriptionByEventKey = async (
  eventKey: string,
  sessionId: string
): Promise<ISubscription> => {
  const existing = await SubscriptionModel.findOne({ eventKey }).exec()

  if (!existing) {
    return SubscriptionModel.create({
      eventKey,
      sessionIds: [sessionId]
    })
  }

  if (!existing.sessionIds.includes(sessionId)) {
    existing.sessionIds.push(sessionId)
    await existing.save()
  }

  return existing.toObject()
}

export const removeSessionFromEventKey = async (
  eventKey: string,
  sessionId: string
): Promise<void> => {
  const existing = await SubscriptionModel.findOne({ eventKey }).exec()
  if (!existing) return

  existing.sessionIds = existing.sessionIds.filter(id => id !== sessionId)

  if (existing.sessionIds.length === 0) {
    await existing.deleteOne()
  } else {
    await existing.save()
  }
}

export const setAvailabilityForEventKey = async (
  eventKey: string,
  available: boolean
): Promise<ISubscription | null> =>
  SubscriptionModel
    .findOneAndUpdate({ eventKey }, { available }, { new: true })
    .lean()
    .exec()

export const getSubscriptionByEventKey = async (
  eventKey: string
): Promise<ISubscription | null> =>
  SubscriptionModel
    .findOne({ eventKey })
    .lean()
    .exec()