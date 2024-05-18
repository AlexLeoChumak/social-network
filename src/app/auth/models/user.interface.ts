import { Post } from 'src/app/home/models/post.interface';

export type Role = 'admin' | 'premium' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  posts?: Post[];
}