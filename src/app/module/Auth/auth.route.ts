import express from 'express';
import { validateRequest } from '../../middlewares';
import { UserValidation } from '../User/user.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserValidationSchema),
    AuthController.createUser
  );

export const AuthRoutes = router;
