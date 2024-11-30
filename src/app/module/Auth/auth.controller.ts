import httpStatus from 'http-status';
import { AppResponse, asyncHandler } from '../../utils';
import { AuthService } from './auth.service';

// Create a new user
const createUser = asyncHandler(async (req, res) => {
  const result = await AuthService.saveUserIntoDB(req.body);

  res
    .status(httpStatus.CREATED)
    .json(
      new AppResponse(
        httpStatus.CREATED,
        result,
        'Account created successfully'
      )
    );
});

export const AuthController = {
  createUser,
};
