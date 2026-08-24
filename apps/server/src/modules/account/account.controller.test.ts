import { Test, TestingModule } from '@nestjs/testing';
import { type IAuthenticatedRequest } from 'src/common/types/auth.types';
import { AccountDeletionService } from 'src/modules/account/account-deletion.service';
import { AccountController } from 'src/modules/account/account.controller';
import { AccountService } from 'src/modules/account/account.service';
import { AuthService } from 'src/modules/account/auth.service';
import { TokenService } from 'src/modules/account/token.service';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: jest.Mocked<AccountService>;
  let authService: jest.Mocked<AuthService>;
  let accountDeletionService: jest.Mocked<AccountDeletionService>;

  const authenticatedRequest = {
    user: { _id: 'account-1', username: 'jdoe', email: 'jdoe@example.com' },
  } as IAuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: { createAccount: jest.fn() } },
        { provide: AuthService, useValue: { authenticate: jest.fn(), refreshSession: jest.fn(), logout: jest.fn() } },
        { provide: AccountDeletionService, useValue: { deleteAccount: jest.fn() } },
        { provide: TokenService, useValue: { resolveAuthenticatedUser: jest.fn() } },
      ],
    }).compile();

    controller = module.get(AccountController);
    accountService = module.get(AccountService);
    authService = module.get(AuthService);
    accountDeletionService = module.get(AccountDeletionService);
  });

  it('delegates registration to AccountService', async () => {
    const dto = { username: 'jdoe', email: 'jdoe@example.com', password: 'plain-password' };

    await controller.register(dto);

    expect(accountService.createAccount).toHaveBeenCalledWith(dto);
  });

  it('delegates login to AuthService', async () => {
    const dto = { email: 'jdoe@example.com', password: 'plain-password' };
    authService.authenticate.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

    const result = await controller.login(dto);

    expect(authService.authenticate).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('delegates refresh to AuthService', async () => {
    authService.refreshSession.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

    const result = await controller.refresh('old-refresh-token');

    expect(authService.refreshSession).toHaveBeenCalledWith('old-refresh-token');
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('logs out the authenticated user with their refresh token', async () => {
    await controller.logout(authenticatedRequest, 'refresh-token');

    expect(authService.logout).toHaveBeenCalledWith('account-1', 'refresh-token');
  });

  it('deletes the authenticated account', async () => {
    await controller.deleteMe(authenticatedRequest);

    expect(accountDeletionService.deleteAccount).toHaveBeenCalledWith('account-1');
  });
});
