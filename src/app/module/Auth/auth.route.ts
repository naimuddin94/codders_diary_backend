import express from 'express';
import { validateRequest, validateRequestCookies } from '../../middlewares';
import { UserValidation } from '../User/user.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserValidationSchema),
    AuthController.createUser
  );

router
  .route('/login')
  .post(
    validateRequest(UserValidation.loginUserValidationSchema),
    AuthController.login
  );

router
  .route('/logout')
  .post(
    validateRequestCookies(UserValidation.accessTokenValidationSchema),
    AuthController.logout
  );

router
  .route('/change-password')
  .post(
    validateRequest(UserValidation.changePasswordValidationSchema),
    AuthController.changePassword
  );

export const AuthRoutes = router;
