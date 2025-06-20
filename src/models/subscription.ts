export enum SubscriptionType {
  Interval          = 'interval',
  DateTimeBased     = 'datetimebased',
  Event             = 'event',
  Request           = 'request',
  Sync              = 'sync',
}

export interface Subscription<T extends SubscriptionData> {
  subscription: string
  data: T
}

export type SubscriptionData =
  | IntervalData
  | DateTimeBasedData
  | EventData
  | RequestData
  | SyncData

export interface IntervalData {
  subscription_type: SubscriptionType.Interval
  interval: number
}

export interface DateTimeBasedData {
  subscription_type: SubscriptionType.DateTimeBased
  datetime: string
}

export interface EventData {
  subscription_type: SubscriptionType.Event
}

export interface RequestData {
  subscription_type: SubscriptionType.Request
}

export interface SyncData {
  subscription_type: SubscriptionType.Sync
  interval: number
  available: boolean
}
