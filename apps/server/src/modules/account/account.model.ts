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

export interface ICreateSessionDocument {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface ISession extends ICreateSessionDocument {
  _id: string;
  createdAt: Date;
}
