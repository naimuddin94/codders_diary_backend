const message = {
  unauthorized: 'You are not authorized!',
  email_exists: 'Email already exists!',
  forbidden: 'You are not allowed!',
  invalid_data_format: 'Requested data is in an invalid format',

  // auth related
  login: 'Signin Successfully',
  logout: 'Signout Successfully',
  password_not_match: 'Password does not match',
  password_changed: 'Password changed successfully',
  invalid_credentials: 'Invalid credentials',

  // user related
  user_created: 'Account registered successfully',
  user_creating_error: 'Something went wrong while creating the user',
  user_update: 'Your profile updated successfully',
  user_updating_error:
    'Something went wrong while updating the user information',
  user_not_exist: 'User does not exist',
  user_delete: 'User deleted successfully',
  user_blocked: 'User blocked successfully',
  user_blocking_error: 'Something went wrong while blocking the user',

  // post related
  post_created: 'Post created successfully',
  post_fetched: 'Post retrieved successfully',
  posts_fetched: 'Posts retrieved successfully',
  post_creating_error: 'Something went wrong while creating the post',
  post_updated: 'Post updated successfully',
  post_updating_error: 'Something went wrong while updating the post',
  post_reaction: 'Reaction updated successfully',
  post_delete: 'Post deleted successfully',
  post_not_exist: 'Post does not exist',
  post_premium_status: 'Post status updated successfully',

  // comment related
  comment_created: 'Comment added successfully',
  comment_creating_error: 'Something went wrong while adding the comment',
  comment_updated: 'Comment updated successfully',
  comment_updating_error: 'Something went wrong while updating the comment',
  comment_delete: 'Comment deleted successfully',
  comment_not_exist: 'Comment does not exist',
};

export default message;
