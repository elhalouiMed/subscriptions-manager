// src/subscription/handleSubscription.ts
import {
  EventData,
  IntervalData,
  RequestData,
  Subscription,
  SubscriptionData,
  SubscriptionType,
  SyncData
} from '../models/subscription'
import { createSubscription } from '../services/subscriptionService'
import { webSocketClient } from './websocket/websocketClient'

export const handleSubscription = async <T extends SubscriptionData>(
  sub: Subscription<T>
): Promise<void> => {
  const { subscription, data } = sub

  switch (data.subscription_type) {
    case SubscriptionType.Event:
      await handleEventSubscription(subscription, data)
      break

    case SubscriptionType.Interval:
      await handleIntervalSubscription(subscription, data)
      break

    case SubscriptionType.Sync:
      if (data.available) {
        const intervalData: IntervalData = {
          subscription_type: SubscriptionType.Interval,
          interval: data.interval
        }
        await handleIntervalSubscription(subscription, intervalData)
      } else {
        await handleSyncSubscription(subscription, data)
      }
      break

    case SubscriptionType.Request:
      await handleRequestSubscription(subscription, data)
      break
  }
}

const handleEventSubscription = async (
  subscription: string,
  data: EventData
) => {
  await createSubscription({
    subscription,
    subscription_type: data.subscription_type
  })
  webSocketClient.send({ subscription, data })
}

const handleIntervalSubscription = async (
  subscription: string,
  data: IntervalData
) => {
  await createSubscription({
    subscription,
    subscription_type: data.subscription_type,
    interval: data.interval
  })
  webSocketClient.send({ subscription, data })
}

const handleSyncSubscription = async (
  subscription: string,
  data: SyncData
) => {
  await createSubscription({
    subscription,
    subscription_type: data.subscription_type,
    interval: data.interval,
    available: data.available
  })
  webSocketClient.send({ subscription, data })
}

const handleRequestSubscription = async (
  subscription: string,
  data: RequestData
) => {
  await createSubscription({
    subscription,
    subscription_type: data.subscription_type
  })
  webSocketClient.send({ subscription, data })
}
