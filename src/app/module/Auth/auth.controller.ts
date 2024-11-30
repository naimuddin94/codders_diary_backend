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

// Login user
const login = asyncHandler(async (req, res) => {
  const { data, accessToken, refreshToken } = await AuthService.loginUser(
    req.body
  );

  res
    .status(200)
    .cookie('refreshToken', refreshToken, options as CookieOptions)
    .cookie('accessToken', accessToken, options as CookieOptions)
    .json(
      new AppResponse(
        200,
        { ...data, accessToken, refreshToken },
        'Login successfully'
      )
    );
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken;

  await AuthService.logoutUser(accessToken);

  res
    .status(httpStatus.OK)
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json(new AppResponse(httpStatus.OK, null, 'Logout successfully'));
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken;
  const payload = req.body;

  await AuthService.changePasswordIntoDB(payload, accessToken);

  res
    .status(httpStatus.OK)
    .json(
      new AppResponse(httpStatus.OK, null, 'Password updated successfully')
    );
});

export const AuthController = {
  createUser,
  login,
  logout,
  changePassword,
};
