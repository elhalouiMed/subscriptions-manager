import { EventData, IntervalData, RequestData, Subscription, SubscriptionData, SubscriptionType, SyncData } from "../models/subscription";
import { webSocketClient } from './websocket/websocketClient';


export const handleSubscription = <T extends SubscriptionData>(
  sub: Subscription<T>
) => {
  const {subscription, data } = sub;

  switch (data.subscription_type) {
    case SubscriptionType.Event:
      handleEventSubscription(subscription, data)
      break;

    case SubscriptionType.Interval:
      handleIntervalSubscription(subscription, data);
      break;

    case SubscriptionType.Sync:
      if (data.available) {
        const intervalData: IntervalData = {
          subscription_type: SubscriptionType.Interval,
          interval: data.interval
        }
        handleIntervalSubscription(subscription, intervalData)
      } else {
        handleSyncSubscription(subscription, data)
      }
      break;

    case SubscriptionType.Request:
      handleRequestSubscription(subscription, data)
      break;
  }
};

const handleEventSubscription = (subscription: string, data: EventData) => {

  const dataToWs = {subscription, data}
  webSocketClient.send(dataToWs)
}

const handleIntervalSubscription = (subscription: string, data: IntervalData) => {

  const dataToWs = {subscription, data}
  webSocketClient.send(dataToWs)
}

const handleRequestSubscription = (subscription: string, data: RequestData) => {

  const dataToWs = {subscription, data}
  webSocketClient.send(dataToWs)
}

const handleSyncSubscription = (subscription: string, data: SyncData) => {

  const dataToWs = {subscription, data}
  webSocketClient.send(dataToWs)
}
