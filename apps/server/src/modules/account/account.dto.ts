import { IsNotEmpty, IsString } from 'class-validator';
import { IAccountLogin, ICreateAccount, ILoginResponse } from 'src/modules/account/account.model';

export class CreateAccountDto implements ICreateAccount {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginDto implements IAccountLogin {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto implements ILoginResponse {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
