import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/types/auth.types';
import { AccountDeletionService } from 'src/modules/account/account-deletion.service';
import {
  ChangePasswordDto,
  CreateAccountDto,
  LoginDto,
  LoginResponseDto,
  UpdateAccountDto,
} from 'src/modules/account/account.dto';
import { IBaseAccount } from 'src/modules/account/account.model';
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
    await this.authService.logout(req.user._id, refreshToken);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Request() req: IAuthenticatedRequest): Promise<void> {
    await this.accountDeletionService.deleteAccount(req.user._id);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Request() req: IAuthenticatedRequest): Promise<IBaseAccount> {
    return this.accountService.getById(req.user._id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  updateMe(@Request() req: IAuthenticatedRequest, @Body() dto: UpdateAccountDto): Promise<IBaseAccount> {
    return this.accountService.updateAccount(req.user._id, dto);
  }

  @Patch('me/password')
  @UseGuards(AuthGuard)
  changePassword(@Request() req: IAuthenticatedRequest, @Body() dto: ChangePasswordDto): Promise<void> {
    return this.accountService.changePassword(req.user._id, dto);
  }
}
