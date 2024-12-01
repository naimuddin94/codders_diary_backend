import httpStatus from 'http-status';
import { AppResponse, asyncHandler } from '../../utils';
import { UserService } from './user.service';

const updateUser = asyncHandler(async (req, res) => {
  const { accessToken } = req.cookies;
  const file = req.file;
  const result = await UserService.updateUserIntoDB(
    req.body,
    accessToken,
    file
  );

  res
    .status(httpStatus.OK)
    .json(
      new AppResponse(httpStatus.OK, result, 'Profile updated successfully')
    );
});

const blockUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { accessToken } = req.cookies;
  const result = await UserService.blockUserIntoDB(userId, accessToken);

  res
    .status(httpStatus.OK)
    .json(new AppResponse(httpStatus.OK, result, 'Blocked successfully'));
});

const followUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { accessToken } = req.cookies;
  const result = await UserService.followUserIntoDB(userId, accessToken);

  res
    .status(httpStatus.OK)
    .json(new AppResponse(httpStatus.OK, result, 'Following successfully'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { data, meta } = await UserService.fetchAllUsersFromDB(req.query);

  res
    .status(httpStatus.OK)
    .json(
      new AppResponse(httpStatus.OK, data, 'Users retrieved successfully', meta)
    );
});

export const UserController = {
  updateUser,
  blockUser,
  followUser,
  getAllUsers,
};
