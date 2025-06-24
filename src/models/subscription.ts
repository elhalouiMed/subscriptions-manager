export type KafkaEvent<T = any> = {
  id: string
  payload: {
    eventKey: string
    data: T
  }
}