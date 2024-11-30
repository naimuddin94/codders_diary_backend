import express from 'express';
import { validateRequest, validateRequestCookies } from '../../middlewares';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router
  .route('/')
  .patch(
    validateRequest(UserValidation.updateUserValidationSchema),
    UserController.updateUser
  );

router
  .route('/blocked/:userId')
  .patch(
    validateRequestCookies(UserValidation.accessTokenValidationSchema),
    UserController.blockUser
  );

export const UserRoutes = router;
