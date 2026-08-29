import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import {
  IAccountLogin,
  IChangePassword,
  ICreateAccount,
  ILoginResponse,
  IUpdateAccount,
} from 'src/modules/account/account.model';

const MIN_PASSWORD_LENGTH = 8;

export class CreateAccountDto implements ICreateAccount {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;
}

export class LoginDto implements IAccountLogin {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginResponseDto implements ILoginResponse {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class UpdateAccountDto implements IUpdateAccount {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;
}

export class ChangePasswordDto implements IChangePassword {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  newPassword!: string;
}
