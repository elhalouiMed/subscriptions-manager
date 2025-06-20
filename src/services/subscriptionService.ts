import {
  createSubscription as daoCreate,
  getSubscriptionById as daoGet,
  listSubscriptions as daoList,
  updateSubscriptionById as daoUpdate,
  deleteSubscriptionById as daoDelete
} from '../dao/subscriptionDao'
import { ISubscription } from '../models/schemas/subscriptionSchema'

export const createSubscription = async (
  data: Partial<ISubscription>
): Promise<ISubscription> =>
  daoCreate(data)

export const getSubscription = async (
  id: string
): Promise<ISubscription | null> =>
  daoGet(id)

export const listSubscriptions = async (
  filter: Record<string, any> = {}
): Promise<ISubscription[]> =>
  daoList(filter)

export const updateSubscription = async (
  id: string,
  update: Partial<ISubscription>
): Promise<ISubscription | null> =>
  daoUpdate(id, update)

export const deleteSubscription = async (
  id: string
): Promise<ISubscription | null> =>
  daoDelete(id)
