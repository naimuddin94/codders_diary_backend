import httpStatus from 'http-status';
import { verifyToken } from '../../lib';
import { AppError, fileUploadOnCloudinary } from '../../utils';
import {
  IChangePasswordPayload,
  ICreateUserPayload,
  ILoginPayload,
} from '../User/user.interface';
import User from '../User/user.model';

// Save new user information in the database
const saveUserIntoDB = async (
  payload: ICreateUserPayload & { image?: string | null },
  requestAccessToken: string,
  // eslint-disable-next-line no-undef
  file: Express.Multer.File | undefined
) => {
  if (requestAccessToken) {
    const { role } = await verifyToken(requestAccessToken);
    if (payload?.role && role !== 'admin') {
      payload['role'] = 'user';
    }
  }
  const isUserExists = await User.isUserExists(payload.email);

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email already exists!');
  }

  if (file) {
    payload['image'] = await fileUploadOnCloudinary(file.buffer);
  }

  const result = await User.create(payload);

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while creating account'
    );
  }

  const accessToken = result.generateAccessToken();
  const refreshToken = result.generateRefreshToken();

  result.refreshToken = refreshToken;

  await result.save();

  // Convert the result to an object and remove the password field
  const userData = await User.findById(result._id).select('name email image');

  return { userData, accessToken, refreshToken };
};

const loginUser = async (payload: ILoginPayload) => {
  const user = await User.isUserExists(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(payload.password);

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const response = await User.findById(user.id).select(
    '-password -createdAt -updatedAt -refreshToken'
  );

  const data = response?.toObject();

  return { accessToken, refreshToken, data };
};

const logoutUser = async (accessToken: string) => {
  // checking if the token is missing
  if (accessToken) {
    const { id } = await verifyToken(accessToken);

    const user = await User.findById(id);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User does not exist');
    }

    user.refreshToken = '';
    await user.save();
  }

  return null;
};

const changePasswordIntoDB = async (
  payload: IChangePasswordPayload,
  accessToken: string
) => {
  if (!accessToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
  }

  const { id } = await verifyToken(accessToken);

  const user = await User.findById(id).select('+password');

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(payload.oldPassword);

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid old password');
  }

  user.password = payload.newPassword;
  await user.save();

  return null;
};

export const AuthService = {
  saveUserIntoDB,
  loginUser,
  logoutUser,
  changePasswordIntoDB,
};
