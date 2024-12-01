import express from 'express';
import { validateRequest, validateRequestCookies } from '../../middlewares';
import { auth } from '../../utils';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router
  .route('/')
  .get(auth('admin'), UserController.getAllUsers)
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

router
  .route('/follow/:userId')
  .patch(
    validateRequestCookies(UserValidation.accessTokenValidationSchema),
    UserController.followUser
  );

export const UserRoutes = router;
