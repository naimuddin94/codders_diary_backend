/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import status from 'http-status';
import mongoose from 'mongoose';
import { message, verifyToken } from '../../lib';
import { AppError, fileUploadOnCloudinary } from '../../utils';
import User from './user.model';

// Update user information in the database
const updateUserIntoDB = async (req: Request) => {
  const userData = req.body;
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new AppError(status.UNAUTHORIZED, message.unauthorized);
  }

  const { id } = await verifyToken(accessToken);

  const isUserExists = await User.findById(id);

  if (!isUserExists) {
    throw new AppError(status.BAD_REQUEST, message.user_not_exist);
  }

  if (req.file && req.file.buffer) {
    userData.image = await fileUploadOnCloudinary(req.file.buffer);
  }

  const result = await User.findByIdAndUpdate(id, userData).select(
    '-password -createdAt -updateAt'
  );

  if (!result) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      message.user_updating_error
    );
  }

  return result;
};

// Block the user the database
const blockUserIntoDB = async (req: Request) => {
  const { userId } = req.params;
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new AppError(status.UNAUTHORIZED, message.unauthorized);
  }

  const { id } = await verifyToken(accessToken);

  const user = await User.findById(id);

  if (!user) {
    throw new AppError(status.BAD_REQUEST, message.user_not_exist);
  }

  const blockUser = await User.findById(userId);

  if (!blockUser) {
    throw new AppError(status.BAD_REQUEST, message.user_not_exist);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isAllReadyBlocked = user.block.find(
      (user) => user.toString() === userId
    );

    // const isAllReadyBlockBy = blockUser.blockedBy.find(
    //   (user) => user.toString() === userId
    // );

    let updatedData = {
      $addToSet: { block: userId },
    };

    let blockUserUpdatedData = {
      $addToSet: { blockedBy: user._id },
    };

    if (isAllReadyBlocked) {
      updatedData = {
        //@ts-ignore
        $pull: { block: userId },
      };
      blockUserUpdatedData = {
        //@ts-ignore
        $pull: { blockedBy: user._id },
      };
    }

    const result = await User.findByIdAndUpdate(id, updatedData, {
      session,
      new: true,
      fields: { block: 1 },
    });

    if (!result) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        message.user_blocking_error
      );
    }

    await User.findByIdAndUpdate(userId, blockUserUpdatedData, { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    console.log(error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      message.user_blocking_error
    );
  }
};

export const UserService = {
  updateUserIntoDB,
  blockUserIntoDB,
};
