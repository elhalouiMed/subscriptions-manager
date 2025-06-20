import { ISubscription, SubscriptionModel } from "../models/schemas/subscriptionSchema"

export const createSubscription = async (
  data: Partial<ISubscription>
): Promise<ISubscription> =>
  SubscriptionModel.create(data)

export const getSubscriptionById = async (
  id: string
): Promise<ISubscription | null> =>
  SubscriptionModel.findById(id).lean().exec()

export const listSubscriptions = async (
  filter: Partial<Record<keyof ISubscription, any>> = {}
): Promise<ISubscription[]> =>
  SubscriptionModel.find(filter).lean().exec()

export const updateSubscriptionById = async (
  id: string,
  update: Partial<ISubscription>
): Promise<ISubscription | null> =>
  SubscriptionModel
    .findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec()

export const deleteSubscriptionById = async (
  id: string
): Promise<ISubscription | null> =>
  SubscriptionModel.findByIdAndDelete(id).lean().exec()
