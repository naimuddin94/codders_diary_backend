import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../module/User/user.interface';
import User from '../module/User/user.model';
import AppError from './AppError';
import asyncHandler from './asyncHandler';

const auth = (...requiredRoles: TUserRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.cookies?.accessToken;

    // Checking if the token is missing
    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Forbidden');
    }
    // checking if the given token is valid
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        accessToken,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    // checking if the user is exist
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not exist!');
    }

    // Check if the user password changed
    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        decoded.iat as number
      )
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no access to this route'
      );
    }

    if (requiredRoles && !requiredRoles.includes(user.role as TUserRole)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no access to this route'
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });

export default auth;
