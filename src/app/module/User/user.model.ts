import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { role } from './user.constant';
import { IUser, IUserMethods, IUserModel } from './user.interface';

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    address: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    followers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: false,
    },
    following: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: false,
    },
    block: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: false,
    },
    blockedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: role,
      default: 'user',
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Custom hooks

// Modified password fields before save to database
userSchema.pre('save', async function (next) {
  try {
    // Check if the password is modified or this is a new user
    if (this.isModified('password') || this.isNew) {
      const hashPassword = await bcrypt.hash(
        this.password,
        Number(config.bcrypt_salt_rounds)
      );
      this.password = hashPassword;
    }
    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    next(error);
  }
});

// Check that the user exists to database
userSchema.statics.isUserExists = async function (email: string) {
  const result = await User.findOne({ email }).select('+password');
  return result;
};

// Check the password is correct
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Custom method for generating access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      image: this.image,
    },
    config.jwt_access_secret!,
    {
      expiresIn: config.jwt_access_expires_in,
    }
  );
};

// Custom method for generating refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    config.jwt_refresh_secret!,
    {
      expiresIn: config.jwt_refresh_expires_in,
    }
  );
};

// compare last password change time with jwt time
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
