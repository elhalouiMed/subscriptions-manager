import {
  getSubscriptionById as daoGet,
  listSubscriptions as daoList,
  upsertSubscriptionByEventKey as daoUpsert,
  removeSessionFromEventKey as daoRemoveSession,
  setAvailabilityForEventKey as daoSetAvailability,
  getSubscriptionByEventKey as daoGetByEventKey
} from '../dao/subscriptionDao'
import { ISubscription } from '../models/schemas/subscriptionSchema'

export const getSubscription = async (
  id: string
): Promise<ISubscription | null> =>
  daoGet(id)

export const listSubscriptions = async (
  filter: Record<string, any> = {}
): Promise<ISubscription[]> =>
  daoList(filter)

export const upsertSubscription = async (
  eventKey: string,
  sessionId: string
): Promise<ISubscription> =>
  daoUpsert(eventKey, sessionId)

export const removeSubscription = async (
  eventKey: string,
  sessionId: string
): Promise<void> =>
  daoRemoveSession(eventKey, sessionId)

export const setAvailability = async (
  eventKey: string,
  available: boolean
): Promise<ISubscription | null> =>
  daoSetAvailability(eventKey, available)

export const getSubscriptionByEventKey = async (
  eventKey: string
): Promise<ISubscription | null> =>
  await daoGetByEventKey(eventKey)