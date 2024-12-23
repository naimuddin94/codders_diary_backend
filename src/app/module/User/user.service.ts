/* eslint-disable @typescript-eslint/ban-ts-comment */
import status from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builders/QueryBuilder';
import { verifyToken } from '../../lib';
import { AppError, fileUploadOnCloudinary } from '../../utils';
import { userSearchableFields } from './user.constant';
import { ICreateUserPayload } from './user.interface';
import User from './user.model';

// Update user information in the database
const updateUserIntoDB = async (
  payload: ICreateUserPayload,
  accessToken: string,
  // eslint-disable-next-line no-undef
  file: Express.Multer.File | undefined
) => {
  if (!accessToken) {
    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access');
  }

  const { id } = await verifyToken(accessToken);

  const isUserExists = await User.findById(id);

  if (!isUserExists) {
    throw new AppError(status.BAD_REQUEST, 'User does not exist');
  }

  if (file) {
    payload['image'] = await fileUploadOnCloudinary(file.buffer);
  }

  const result = await User.findByIdAndUpdate(id, payload).select(
    '-password -createdAt'
  );

  if (!result) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'Something went wrong while updating user information'
    );
  }

  return result;
};

// Block the user the database
const blockUserIntoDB = async (userId: string, accessToken: string) => {
  if (!accessToken) {
    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access');
  }

  const { id } = await verifyToken(accessToken);

  const user = await User.findById(id);

  if (!user) {
    throw new AppError(status.BAD_REQUEST, 'User does not exist');
  }

  const blockUser = await User.findById(userId);

  if (!blockUser) {
    throw new AppError(status.BAD_REQUEST, 'User does not exist');
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
        'Something went wrong when blocking user'
      );
    }

    await User.findByIdAndUpdate(userId, blockUserUpdatedData, { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch {
    await session.abortTransaction();
    await session.endSession();

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'Something went wrong when blocking user'
    );
  }
};

// Flow the user the database
const followUserIntoDB = async (userId: string, accessToken: string) => {
  if (!accessToken) {
    throw new AppError(status.UNAUTHORIZED, 'Unauthorized access');
  }

  const { id } = await verifyToken(accessToken);

  const user = await User.findById(id);

  if (!user) {
    throw new AppError(status.BAD_REQUEST, 'User does not exist');
  }

  const followUser = await User.findById(userId);

  if (!followUser) {
    throw new AppError(status.BAD_REQUEST, 'User does not exist');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isAllReadyFollowing = user.following.find(
      (user) => user.toString() === userId
    );

    let updatedData = {
      $addToSet: { following: userId },
    };

    let followersUpdatedData = {
      $addToSet: { followers: user._id },
    };

    if (isAllReadyFollowing) {
      updatedData = {
        //@ts-ignore
        $pull: { following: userId },
      };
      followersUpdatedData = {
        //@ts-ignore
        $pull: { followers: user._id },
      };
    }

    const result = await User.findByIdAndUpdate(id, updatedData, {
      session,
      new: true,
      fields: { following: 1 },
    });

    if (!result) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        'Something went wrong when blocking user'
      );
    }

    await User.findByIdAndUpdate(userId, followersUpdatedData, { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch {
    await session.abortTransaction();
    await session.endSession();

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'Something went wrong when blocking user'
    );
  }
};

// Fetch all the users
const fetchAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate();

  const data = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    data,
    meta,
  };
};

export const UserService = {
  updateUserIntoDB,
  blockUserIntoDB,
  followUserIntoDB,
  fetchAllUsersFromDB,
};
