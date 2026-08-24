import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/interfaces/authenticated-request';
import { AccountDeletionService } from 'src/modules/account/account-deletion.service';
import { CreateAccountDto, LoginDto, LoginResponseDto } from 'src/modules/account/account.dto';
import { AccountService } from 'src/modules/account/account.service';
import { AuthService } from 'src/modules/account/auth.service';

@Controller({ version: '1', path: 'account' })
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly accountDeletionService: AccountDeletionService,
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
  async refresh(@Body('refreshToken') refreshToken: string): Promise<LoginResponseDto> {
    const tokens = await this.authService.refreshSession(refreshToken);
    return tokens;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: IAuthenticatedRequest, @Body('refreshToken') refreshToken: string): Promise<void> {
    await this.authService.logout(req.user!._id, refreshToken);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Request() req: IAuthenticatedRequest): Promise<void> {
    await this.accountDeletionService.deleteAccount(req.user!._id);
  }
}
