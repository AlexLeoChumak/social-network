import { User } from './user.interface';

export interface UserResponse {
  user: User;
  iat: number;
  exp: number;
}
