import * as dao from '../../dao/subscriptionDao'
import {
  getSubscription,
  listSubscriptions,
  upsertSubscription,
  removeSubscription,
  setAvailability,
  getSubscriptionByEventKey
} from '../../services/subscriptionService'

jest.mock('../../dao/subscriptionDao')

const mockedDao = dao as jest.Mocked<typeof dao>

describe('subscriptionService', () => {
  afterEach(() => jest.clearAllMocks())

  it('getSubscription - returns result from dao', async () => {
    const mockResult = { _id: '123' } as any
    mockedDao.getSubscriptionById.mockResolvedValueOnce(mockResult)

    const result = await getSubscription('123')
    expect(result).toEqual(mockResult)
    expect(mockedDao.getSubscriptionById).toHaveBeenCalledWith('123')
  })

  it('listSubscriptions - returns result from dao', async () => {
    const mockList = [{ _id: '1' }, { _id: '2' }] as any[]
    mockedDao.listSubscriptions.mockResolvedValueOnce(mockList)

    const result = await listSubscriptions({ eventKey: 'foo' })
    expect(result).toEqual(mockList)
    expect(mockedDao.listSubscriptions).toHaveBeenCalledWith({ eventKey: 'foo' })
  })

  it('upsertSubscription - calls dao with correct args', async () => {
    const mockResult = { eventKey: 'abc', sessionIds: ['123'] } as any
    mockedDao.upsertSubscriptionByEventKey.mockResolvedValueOnce(mockResult)

    const result = await upsertSubscription('abc', '123')
    expect(result).toEqual(mockResult)
    expect(mockedDao.upsertSubscriptionByEventKey).toHaveBeenCalledWith('abc', '123')
  })

  it('removeSubscription - calls dao with correct args', async () => {
    mockedDao.removeSessionFromEventKey.mockResolvedValueOnce()

    await removeSubscription('ev1', 'sess1')
    expect(mockedDao.removeSessionFromEventKey).toHaveBeenCalledWith('ev1', 'sess1')
  })

  it('setAvailability - calls dao and returns value', async () => {
    const mockUpdated = { eventKey: 'abc', available: true } as any
    mockedDao.setAvailabilityForEventKey.mockResolvedValueOnce(mockUpdated)

    const result = await setAvailability('abc', true)
    expect(result).toEqual(mockUpdated)
    expect(mockedDao.setAvailabilityForEventKey).toHaveBeenCalledWith('abc', true)
  })

  it('getSubscriptionByEventKey - returns correct result', async () => {
    const mock = { eventKey: 'xyz' } as any
    mockedDao.getSubscriptionByEventKey.mockResolvedValueOnce(mock)

    const result = await getSubscriptionByEventKey('xyz')
    expect(result).toEqual(mock)
    expect(mockedDao.getSubscriptionByEventKey).toHaveBeenCalledWith('xyz')
  })
})
