import { z } from 'zod';
import { role, USER_ROLE } from './user.constant';

const loginUserValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({ message: 'Invalid email format' }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(4, { message: 'Password must be at least 6 characters' })
      .max(20, { message: 'Password no longer that 20 characters' }),
  }),
});

const userValidationSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be string',
    })
    .min(4, { message: 'Name must be at least 6 characters' })
    .max(30, { message: 'Name no longer that 30 characters' }),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({ message: 'Invalid email format' }),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password no longer that 20 characters' }),
  address: z
    .string({ message: 'Please enter a valid address as string' })
    .optional(),
  phone: z
    .string({ message: 'Please enter a valid phone number as string' })
    .optional(),
  role: z
    .enum([...role] as [string], {
      message: 'Role is required in valid format user or admin',
    })
    .default(USER_ROLE.user),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const accessTokenValidationSchema = z.object({
  cookies: z.object({
    accessToken: z.string({
      required_error: 'Access token is required!',
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required!',
    }),
    newPassword: z.string({
      required_error: 'New password is required!',
    }),
  }),
});

const createUserValidationSchema = z.object({
  body: userValidationSchema,
});

const updateUserValidationSchema = z.object({
  body: userValidationSchema.partial(),
});

export const UserValidation = {
  userValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
  loginUserValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
  accessTokenValidationSchema,
};
