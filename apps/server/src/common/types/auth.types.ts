import { Request } from 'express';

export interface IAuthenticatedUser {
  _id: string;
  username: string;
  email: string;
}

export interface IUserPayload {
  sub?: string;
  _id?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface IRequestWithUser extends Request {
  user?: IAuthenticatedUser;
}
