import { ICreateUserPayload } from '../User/user.interface';

// Save new user information to the database
const saveUserIntoDB = async (payload: ICreateUserPayload) => {
  console.log({ payload });
};

export const AuthService = {
  saveUserIntoDB,
};
