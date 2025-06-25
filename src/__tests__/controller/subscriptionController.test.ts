import { RequestHandler } from 'express'

jest.mock('../../services/subscriptionService', () => ({
  getSubscription: jest.fn(),
  listSubscriptions: jest.fn(),
  upsertSubscription: jest.fn(),
  setAvailability: jest.fn(),
  removeSubscription: jest.fn(),
  getSubscriptionByEventKey: jest.fn()
}))

jest.mock('../../utils/validators/http/subscriptionValidator', () => ({
  subscribeSchema: { validate: jest.fn() },
  unsubscribeSchema: { validate: jest.fn() },
  availabilitySchema: { validate: jest.fn() }
}))

jest.mock('../../services/scheduler', () => ({
  registerTask: jest.fn()
}))

jest.mock('../../utils/cron', () => ({
  msToCron: jest.fn()
}))

import {
  getSubscriptionController,
  listSubscriptionsController,
  subscribeController,
  unsubscribeController,
  availabilityController
} from '../../controllers/subscriptionController'

import {
  getSubscription,
  listSubscriptions,
  upsertSubscription,
  setAvailability,
  removeSubscription,
  getSubscriptionByEventKey
} from '../../services/subscriptionService'

import {
  subscribeSchema,
  unsubscribeSchema,
  availabilitySchema
} from '../../utils/validators/http/subscriptionValidator'

import { registerTask } from '../../services/scheduler'
import { msToCron } from '../../utils/cron'

describe('subscriptionController', () => {
  let req: any
  let res: any
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis()
    }
    req = { params: {}, query: {}, body: {} }

    // Reset service mocks
    ;(getSubscription as jest.Mock).mockReset()
    ;(listSubscriptions as jest.Mock).mockReset()
    ;(upsertSubscription as jest.Mock).mockReset()
    ;(setAvailability as jest.Mock).mockReset()
    ;(removeSubscription as jest.Mock).mockReset()
    ;(getSubscriptionByEventKey as jest.Mock).mockReset()

    // Reset validator mocks
    ;(subscribeSchema.validate as jest.Mock).mockReset()
    ;(unsubscribeSchema.validate as jest.Mock).mockReset()
    ;(availabilitySchema.validate as jest.Mock).mockReset()

    // Reset scheduler and cron mocks
    ;(registerTask as jest.Mock).mockReset()
    ;(msToCron as jest.Mock).mockReset()
  })

  describe('getSubscriptionController', () => {
    it('returns subscription when found', async () => {
      const sub = { id: '1' }
      req.params.id = '1'
      ;(getSubscription as jest.Mock).mockResolvedValue(sub)

      await getSubscriptionController(req, res, next)

      expect(getSubscription).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith(sub)
      expect(res.sendStatus).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('sends 404 when not found', async () => {
      req.params.id = '2'
      ;(getSubscription as jest.Mock).mockResolvedValue(null)

      await getSubscriptionController(req, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(404)
      expect(res.json).not.toHaveBeenCalled()
    })

    it('calls next on error', async () => {
      const err = new Error('fail')
      ;(getSubscription as jest.Mock).mockRejectedValue(err)

      await getSubscriptionController(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('listSubscriptionsController', () => {
    it('returns list of subscriptions', async () => {
      const subs = [{}, {}]
      req.query = { a: 'b' }
      ;(listSubscriptions as jest.Mock).mockResolvedValue(subs)

      await listSubscriptionsController(req, res, next)

      expect(listSubscriptions).toHaveBeenCalledWith({ a: 'b' })
      expect(res.json).toHaveBeenCalledWith(subs)
    })

    it('calls next on error', async () => {
      const err = new Error('err')
      ;(listSubscriptions as jest.Mock).mockRejectedValue(err)

      await listSubscriptionsController(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('subscribeController', () => {
    beforeEach(() => {
      ;(subscribeSchema.validate as jest.Mock).mockImplementation((body) => ({ error: null, value: body }))
    })

    it('returns 400 on validation error', async () => {
      ;(subscribeSchema.validate as jest.Mock).mockReturnValue({ error: { details: [{ message: 'e1' }, { message: 'e2' }] } })
      req.body = {}

      await subscribeController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ errors: ['e1', 'e2'] })
    })

    it('handles interval branch', async () => {
      req.body = { eventKey: 'cpu_usage_monitor', sessionId: 'Mohammed', intervalMs: 1000 }
      const sub = { foo: 'bar' }
      const sub2 = { eventKey: 'cpu_usage_monitor', intervalMs: 1000 }
      ;(getSubscriptionByEventKey as jest.Mock).mockResolvedValue(sub2)
      ;(upsertSubscription as jest.Mock).mockResolvedValue(sub)
      ;(msToCron as jest.Mock).mockReturnValue('c')

      await subscribeController(req, res, next)

      expect(upsertSubscription).toHaveBeenCalledWith('cpu_usage_monitor', 'Mohammed', 1000, undefined, undefined)
      expect(msToCron).toHaveBeenCalledWith(1000)
      expect(registerTask).toHaveBeenCalledWith('cpu_usage_monitor', 'c')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(sub)
    })

    it('handles cron branch', async () => {
      req.body = { eventKey: 'cpu_usage_monitor', sessionId: 'Zaid', cron: 'd' }
      const sub2 = { eventKey: 'cpu_usage_monitor', cron: 'd' }

      ;(getSubscriptionByEventKey as jest.Mock).mockResolvedValue(sub2)
      ;(upsertSubscription as jest.Mock).mockResolvedValue({})

      await subscribeController(req, res, next)

      expect(upsertSubscription).toHaveBeenCalledWith('cpu_usage_monitor', 'Zaid', undefined, 'd', undefined)
      expect(registerTask).toHaveBeenCalledWith('cpu_usage_monitor', 'd')
    })

    it('handles sync branch when available', async () => {
      req.body = { eventKey: 'k', sessionId: 's', sync: true, intervalMs: 500 }
      const sub2 = { eventKey: 'k', intervalMs: 500, available: true }
      ;(getSubscriptionByEventKey as jest.Mock).mockResolvedValue(sub2)
      const sub1 = {}
      ;(upsertSubscription as jest.Mock).mockResolvedValue(sub1)
      ;(getSubscriptionByEventKey as jest.Mock).mockResolvedValue(sub2)
      ;(msToCron as jest.Mock).mockReturnValue('c2')

      await subscribeController(req, res, next)

      expect(upsertSubscription).toHaveBeenCalledWith('k', 's', 500, undefined, true)
      expect(getSubscriptionByEventKey).toHaveBeenCalledWith('k')
      expect(registerTask).toHaveBeenCalledWith('k', 'c2')
    })

    it('handles event branch', async () => {
      req.body = { eventKey: 'k', sessionId: 's' }
      const sub2 = { eventKey: 'k' }
      ;(getSubscriptionByEventKey as jest.Mock).mockResolvedValue(sub2)
      ;(upsertSubscription as jest.Mock).mockResolvedValue({})

      await subscribeController(req, res, next)

      expect(upsertSubscription).toHaveBeenCalledWith('k', 's', undefined, undefined, undefined)
      expect(registerTask).toHaveBeenCalledWith('k')
    })

    it('calls next on error', async () => {
      ;(upsertSubscription as jest.Mock).mockRejectedValue(new Error('x'))
      req.body = { eventKey: 'k', sessionId: 's' }

      await subscribeController(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('unsubscribeController', () => {
    beforeEach(() => {
      ;(unsubscribeSchema.validate as jest.Mock).mockImplementation((body) => ({ error: null, value: body }))
    })

    it('returns 400 on validation error', async () => {
      ;(unsubscribeSchema.validate as jest.Mock).mockReturnValue({ error: { details: [{ message: 'fail' }] } })
      req.body = {}

      await unsubscribeController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ errors: ['fail'] })
    })

    it('removes subscription and returns 204', async () => {
      req.body = { eventKey: 'k', sessionId: 's' }

      await unsubscribeController(req, res, next)

      expect(removeSubscription).toHaveBeenCalledWith('k', 's')
      expect(res.sendStatus).toHaveBeenCalledWith(204)
    })

    it('calls next on error', async () => {
      ;(removeSubscription as jest.Mock).mockRejectedValue(new Error('err'))
      req.body = { eventKey: 'k', sessionId: 's' }

      await unsubscribeController(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('availabilityController', () => {
    beforeEach(() => {
      ;(availabilitySchema.validate as jest.Mock).mockImplementation((body) => ({ error: null, value: body }))
    })

    it('returns 400 on validation error', async () => {
      ;(availabilitySchema.validate as jest.Mock).mockReturnValue({ error: { details: [{ message: 'err' }] } })
      req.body = {}

      await availabilityController(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ errors: ['err'] })
    })

    it('returns 404 when no update', async () => {
      req.body = { eventKey: 'k', available: true }
      ;(setAvailability as jest.Mock).mockResolvedValue(null)

      await availabilityController(req, res, next)

      expect(setAvailability).toHaveBeenCalledWith('k', true)
      expect(res.sendStatus).toHaveBeenCalledWith(404)
    })

    it('returns updated subscription', async () => {
      const updated = { foo: 'bar' }
      req.body = { eventKey: 'k', available: false }
      ;(setAvailability as jest.Mock).mockResolvedValue(updated)

      await availabilityController(req, res, next)

      expect(setAvailability).toHaveBeenCalledWith('k', false)
      expect(res.json).toHaveBeenCalledWith(updated)
    })

    it('calls next on error', async () => {
      ;(setAvailability as jest.Mock).mockRejectedValue(new Error('oops'))

      await availabilityController(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
