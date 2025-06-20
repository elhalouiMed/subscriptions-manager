import { Router } from 'express'
import {
  createSubscriptionController,
  getSubscriptionController,
  listSubscriptionsController,
  updateSubscriptionController,
  deleteSubscriptionController
} from '../controllers/subscriptionController'

const router = Router()

router.post('/', createSubscriptionController)

router.get('/', listSubscriptionsController)

router.get('/:id', getSubscriptionController)

router.put('/:id', updateSubscriptionController)

router.delete('/:id', deleteSubscriptionController)

export default router
