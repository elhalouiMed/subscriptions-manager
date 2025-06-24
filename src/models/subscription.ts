export type KafkaEvent<T = any> = {
  id: string
  payload: {
    eventKey: string
    data: T
  }
}

export enum EventKey {
  Interval          = 'interval',
  DateTimeBased     = 'datetimebased',
  Event             = 'event',
  Sync              = 'sync'
}

export interface Subscription {
  eventKey: EventKey
  sessionId: string
}

export interface IntervalEvent extends Subscription {
  intervalMs: number
}

export interface DateTimeBasedEvent {
  cron: string
}

