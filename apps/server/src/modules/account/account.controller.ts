import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateAccountDto,
  LoginDto,
  LoginResponseDto,
} from 'src/modules/account/account.dto';
import { AccountService } from 'src/modules/account/account.service';
import { AuthService } from 'src/modules/account/auth.service';

@Controller({ version: '1', path: 'account' })
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() createAccountDto: CreateAccountDto): Promise<void> {
    return this.accountService.createAccount(createAccountDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.authenticate({ ...loginDto });
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<LoginResponseDto> {
    const tokens = await this.authService.refreshSession(refreshToken);
    return tokens;
  }
}
