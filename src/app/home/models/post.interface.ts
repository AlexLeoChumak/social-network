import { User } from 'src/app/auth/models/user.interface';

export interface Post {
  id: number;
  body: string;
  createdAt: Date;
  author: User;
}
