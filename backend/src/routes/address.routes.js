import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAddressValidator,
  updateAddressValidator,
} from '../validators/address.validator.js';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getAddresses)
  .post(validate(createAddressValidator), createAddress);

router
  .route('/:id')
  .patch(validate(updateAddressValidator), updateAddress)
  .delete(deleteAddress);

router.patch('/:id/default', setDefaultAddress);

export default router;
