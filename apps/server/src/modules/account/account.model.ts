export interface IBaseAccount {
  _id: string;
  username: string;
  email: string;
}

export interface IAccount extends IBaseAccount {
  passwordHash: string;
  lastLoginAt: Date;
}

export interface ICreateAccount {
  username: string;
  email: string;
  password: string;
}

export interface ICreateAccountDocument {
  username: string;
  email: string;
  passwordHash: string;
}

export interface IAccountLogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IUpdateAccount {
  username?: string;
  email?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface ICreateSessionDocument {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface ISession extends ICreateSessionDocument {
  _id: string;
  createdAt: Date;
}

export type UpdatableAccount = Partial<Omit<IAccount, '_id'>>;
