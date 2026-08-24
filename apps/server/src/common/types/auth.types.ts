import { Request } from 'express';
import { IBaseAccount } from 'src/modules/account/account.model';

export interface IAuthenticatedRequest extends Request {
  user: IBaseAccount;
}

export interface IUserPayload {
  sub?: string;
  _id?: string;
  email?: string;
  iat?: number;
  exp?: number;
}
