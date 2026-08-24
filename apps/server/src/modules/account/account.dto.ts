import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IAccountLogin, ICreateAccount, ILoginResponse } from 'src/modules/account/account.model';

const MIN_PASSWORD_LENGTH = 8;

export class CreateAccountDto implements ICreateAccount {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
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
