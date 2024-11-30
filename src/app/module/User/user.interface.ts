/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-unused-vars */
import { HydratedDocument, Model, ObjectId } from 'mongoose';
import { z } from 'zod';
import { USER_ROLE } from './user.constant';
import { UserValidation } from './user.validation';

export interface IUser
  extends z.infer<typeof UserValidation.userValidationSchema> {
  image?: string;
  refreshToken?: string;
  passwordChangedAt?: Date;
  followers: ObjectId[];
  following: ObjectId[];
  block: ObjectId[];
  blockedBy: ObjectId[];
  verified: boolean;
  premium: boolean;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface IUserModel
  extends Model<IUser, Record<string, never>, IUserMethods> {
  isUserExists(email: string): Promise<HydratedDocument<IUser, IUserMethods>>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ICreateUserPayload
  extends z.infer<typeof UserValidation.userValidationSchema> {}

export type TUserRole = keyof typeof USER_ROLE;
