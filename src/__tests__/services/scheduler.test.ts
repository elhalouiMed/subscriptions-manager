import { registerTask, deleteTask } from '../../services/scheduler'

// ✅ Fully mock everything this module touches
jest.mock('../../services/kafka/kafkaProducer', () => ({
  produce: jest.fn(),
  initProducer: jest.fn()
}))

jest.mock('axios', () => ({
  delete: jest.fn()
}))

jest.mock('../../config', () => ({
  config: {
    topics: {
      scheduler_register: 'scheduler-topic'
    },
    schedulerHttpUrl: 'http://scheduler.service.local'
  }
}))

jest.mock('../../utils/sha256', () => ({
  sha256: jest.fn(() => 'mocked_sha')
}))

import axios from 'axios'
import { config } from '../../config'
import * as kafkaProducer from '../../services/kafka/kafkaProducer'
import { sha256 } from '../../utils/sha256'

const mockedProduce = kafkaProducer.produce as jest.Mock
const mockedAxiosDelete = axios.delete as jest.Mock
const mockedSha256 = sha256 as jest.Mock

describe('scheduler service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerTask', () => {
    it('should call kafka produce with correct payload', async () => {
      await registerTask('event-1', '* * * * *', { foo: 'bar' })

      expect(mockedSha256).toHaveBeenCalledWith('event-1')
      expect(mockedProduce).toHaveBeenCalledWith(
        'scheduler-topic',
        'mocked_sha',
        {
          id: 'mocked_sha',
          cron: '* * * * *',
          payload: { foo: 'bar' }
        }
      )
    })

    it('should produce with only eventKey when cron and payload are omitted', async () => {
      await registerTask('event-2')

      expect(mockedProduce).toHaveBeenCalledWith(
        'scheduler-topic',
        'mocked_sha',
        {
          id: 'mocked_sha',
          cron: undefined,
          payload: undefined
        }
      )
    })
  })

  describe('deleteTask', () => {
    it('should call axios.delete with normalized scheduler URL', async () => {
      await deleteTask('event-to-delete')

      expect(mockedSha256).toHaveBeenCalledWith('event-to-delete')
      expect(mockedAxiosDelete).toHaveBeenCalledWith(
        'http://scheduler.service.local/tasks/mocked_sha'
      )
    })

    it('should remove trailing slash before building URL', async () => {
      const localConfig = require('../../config').config
      localConfig.schedulerHttpUrl = 'http://scheduler.service.local/'

      await deleteTask('event-trailing')

      expect(mockedAxiosDelete).toHaveBeenCalledWith(
        'http://scheduler.service.local/tasks/mocked_sha'
      )
    })
  })
})
