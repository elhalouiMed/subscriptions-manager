import { Router } from 'express'
import {
  listSubscriptionsController,
  subscribeController,
  unsubscribeController,
  availabilityController,
  getSubscriptionController
} from '../controllers/subscriptionController'

const router = Router()

router.get('/', listSubscriptionsController)

router.get('/:id', getSubscriptionController)

router.post('/subscribe', subscribeController)

router.delete('/subscribe', unsubscribeController)

router.post('/availability', availabilityController)

export default router
