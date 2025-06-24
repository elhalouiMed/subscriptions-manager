import { createHash } from 'crypto'
import { config } from '../config'
import { produce } from './kafka/kafkaProducer'
import axios from 'axios'
import { sha256 } from '../utils/sha256'


export const registerTask = async (
  eventKey: string,
  cron?: string,
  payload?: any
): Promise<void> => {
  const id = sha256(eventKey)
  await produce(config.topics.scheduler_register,id, {
    id,
    cron,
    payload
  })
}


export const deleteTask = async (
  eventKey: string
): Promise<void> => {
  const id = sha256(eventKey)
  const url = `${config.schedulerHttpUrl.replace(/\/$/, '')}/tasks/${id}`
  await axios.delete(url)
}