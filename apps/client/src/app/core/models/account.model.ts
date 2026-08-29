export interface IBaseAccount {
  _id: string;
  username: string;
  email: string;
}

export interface ICreateAccount {
  username: string;
  email: string;
  password: string;
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
