import {
  getSubscriptionById,
  listSubscriptions,
  upsertSubscriptionByEventKey,
  removeSessionFromEventKey,
  setAvailabilityForEventKey,
  getSubscriptionByEventKey
} from '../../dao/subscriptionDao'

import { SubscriptionModel } from '../../models/schemas/subscriptionSchema'

jest.mock('../../models/schemas/subscriptionSchema', () => ({
  SubscriptionModel: {
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn()
  }
}))

const mockedModel = SubscriptionModel as jest.Mocked<typeof SubscriptionModel>

// ✅ helper for mocking exec chain
const mockExec = <T>(value: T): any => ({
  exec: () => Promise.resolve(value)
})

describe('subscriptionDao', () => {
  afterEach(() => jest.clearAllMocks())

  it('getSubscriptionById - returns subscription', async () => {
    const mockSub = { _id: 'id123', sessionIds: ['abc'] }
    mockedModel.findById.mockReturnValueOnce({
      lean: () => mockExec(mockSub)
    } as any)

    const result = await getSubscriptionById('id123')
    expect(result).toEqual(mockSub)
    expect(mockedModel.findById).toHaveBeenCalledWith('id123')
  })

  it('listSubscriptions - returns list', async () => {
    const mockList = [{ _id: '1' }, { _id: '2' }]
    mockedModel.find.mockReturnValueOnce({
      lean: () => mockExec(mockList)
    } as any)

    const result = await listSubscriptions()
    expect(result).toEqual(mockList)
    expect(mockedModel.find).toHaveBeenCalledWith({})
  })

  it('upsertSubscriptionByEventKey - creates new if not exists', async () => {
    mockedModel.findOne.mockReturnValueOnce(mockExec(null))
    mockedModel.create.mockResolvedValueOnce({ eventKey: 'test', sessionIds: ['abc'] } as any)

    const result = await upsertSubscriptionByEventKey('test', 'abc')
    expect(result).toEqual({ eventKey: 'test', sessionIds: ['abc'] })
    expect(mockedModel.create).toHaveBeenCalledWith({ eventKey: 'test', sessionIds: ['abc'] })
  })

  it('upsertSubscriptionByEventKey - appends session if needed', async () => {
    const saveMock = jest.fn()
    const toObjectMock = jest.fn().mockReturnValue({ eventKey: 'test', sessionIds: ['abc', 'def'] })
    const existing = {
      sessionIds: ['abc'],
      save: saveMock,
      toObject: toObjectMock
    }

    mockedModel.findOne.mockReturnValueOnce(mockExec(existing))

    const result = await upsertSubscriptionByEventKey('test', 'def')
    expect(existing.sessionIds).toContain('def')
    expect(saveMock).toHaveBeenCalled()
    expect(result).toEqual({ eventKey: 'test', sessionIds: ['abc', 'def'] })
  })

  it('removeSessionFromEventKey - deletes when no sessionIds left', async () => {
    const deleteOneMock = jest.fn()
    const existing = {
      sessionIds: ['xyz'],
      deleteOne: deleteOneMock
    }

    mockedModel.findOne.mockReturnValueOnce(mockExec(existing))
    await removeSessionFromEventKey('ev1', 'xyz')
    expect(deleteOneMock).toHaveBeenCalled()
  })

  it('removeSessionFromEventKey - saves updated session list', async () => {
    const saveMock = jest.fn()
    const existing = {
      sessionIds: ['abc', 'def'],
      save: saveMock
    }

    mockedModel.findOne.mockReturnValueOnce(mockExec(existing))
    await removeSessionFromEventKey('ev2', 'abc')
    expect(existing.sessionIds).toEqual(['def'])
    expect(saveMock).toHaveBeenCalled()
  })

  it('setAvailabilityForEventKey - updates availability', async () => {
    const updated = { eventKey: 'sync', available: true }
    mockedModel.findOneAndUpdate.mockReturnValueOnce({
      lean: () => mockExec(updated)
    } as any)

    const result = await setAvailabilityForEventKey('sync', true)
    expect(result).toEqual(updated)
    expect(mockedModel.findOneAndUpdate).toHaveBeenCalledWith(
      { eventKey: 'sync' },
      { available: true },
      { new: true }
    )
  })

  it('getSubscriptionByEventKey - finds one', async () => {
    const resultDoc = { eventKey: 'ev123' }
    mockedModel.findOne.mockReturnValueOnce({
      lean: () => mockExec(resultDoc)
    } as any)

    const result = await getSubscriptionByEventKey('ev123')
    expect(result).toEqual(resultDoc)
  })
})
