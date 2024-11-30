import { CookieOptions } from 'express';
import httpStatus from 'http-status';
import { AppResponse, asyncHandler, options } from '../../utils';
import { AuthService } from './auth.service';

// Create a new user
const createUser = asyncHandler(async (req, res) => {
  const { accessToken: requestAccessToken } = req.cookies;
  const file = req.file;
  const { userData, accessToken, refreshToken } =
    await AuthService.saveUserIntoDB(req.body, requestAccessToken, file);

  res
    .status(httpStatus.CREATED)
    .cookie('refreshToken', refreshToken, options as CookieOptions)
    .cookie('accessToken', accessToken, options as CookieOptions)
    .json(
      new AppResponse(
        httpStatus.CREATED,
        { ...userData?.toObject(), accessToken, refreshToken },
        'Account created successfully'
      )
    );
});

export const AuthController = {
  createUser,
};
