import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from 'src/modules/account/account.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { ListService } from 'src/modules/list/list.service';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

import { compare } from 'bcrypt';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let listService: jest.Mocked<ListService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: { create: jest.fn(), findByEmail: jest.fn(), findById: jest.fn(), updateById: jest.fn() },
        },
        {
          provide: ListService,
          useValue: { createSpecialLists: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AccountService);
    accountRepository = module.get(AccountRepository);
    listService = module.get(ListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('hashes the password and persists the account', async () => {
      accountRepository.create.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });

      await service.createAccount({ username: 'jdoe', email: 'jdoe@example.com', password: 'plain-password' });

      expect(accountRepository.create).toHaveBeenCalledWith({
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
      });
    });

    it('provisions the Watchlist and Favorites lists for the new account', async () => {
      accountRepository.create.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });

      await service.createAccount({ username: 'jdoe', email: 'jdoe@example.com', password: 'plain-password' });

      expect(listService.createSpecialLists).toHaveBeenCalledWith('account-1');
    });

    it('throws ConflictException when the email/username is already taken', async () => {
      accountRepository.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.createAccount({ username: 'jdoe', email: 'jdoe@example.com', password: 'plain-password' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows unrelated errors', async () => {
      accountRepository.create.mockRejectedValue(new Error('connection lost'));

      await expect(
        service.createAccount({ username: 'jdoe', email: 'jdoe@example.com', password: 'plain-password' }),
      ).rejects.toThrow('connection lost');
    });
  });

  describe('validateUser', () => {
    it('throws UnauthorizedException when no account matches the email', async () => {
      accountRepository.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('jdoe@example.com', 'plain-password')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      accountRepository.findByEmail.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('jdoe@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });

    it('returns the base account when credentials are valid', async () => {
      accountRepository.findByEmail.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('jdoe@example.com', 'plain-password');

      expect(result).toEqual({ _id: 'account-1', username: 'jdoe', email: 'jdoe@example.com' });
    });
  });

  describe('getById', () => {
    it('throws NotFoundException when the account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.getById('account-1')).rejects.toThrow(NotFoundException);
    });

    it('returns the base account', async () => {
      accountRepository.findById.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });

      const result = await service.getById('account-1');

      expect(result).toEqual({ _id: 'account-1', username: 'jdoe', email: 'jdoe@example.com' });
    });
  });

  describe('updateAccount', () => {
    it('throws NotFoundException when the account does not exist', async () => {
      accountRepository.updateById.mockResolvedValue(null);

      await expect(service.updateAccount('account-1', { username: 'new-name' })).rejects.toThrow(NotFoundException);
    });

    it('propagates errors from the repository', async () => {
      accountRepository.updateById.mockRejectedValue({ code: 11000 });

      await expect(service.updateAccount('account-1', { username: 'taken' })).rejects.toEqual({ code: 11000 });
    });

    it('returns the updated base account', async () => {
      accountRepository.updateById.mockResolvedValue({
        _id: 'account-1',
        username: 'new-name',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });

      const result = await service.updateAccount('account-1', { username: 'new-name' });

      expect(accountRepository.updateById).toHaveBeenCalledWith('account-1', { username: 'new-name' });
      expect(result).toEqual({ _id: 'account-1', username: 'new-name', email: 'jdoe@example.com' });
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundException when the account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('account-1', { currentPassword: 'old', newPassword: 'new-password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException when the current password is incorrect', async () => {
      accountRepository.findById.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('account-1', { currentPassword: 'wrong', newPassword: 'new-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('hashes and persists the new password', async () => {
      accountRepository.findById.mockResolvedValue({
        _id: 'account-1',
        username: 'jdoe',
        email: 'jdoe@example.com',
        passwordHash: 'hashed-password',
        lastLoginAt: new Date(),
      });
      (compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword('account-1', { currentPassword: 'old-password', newPassword: 'new-password' });

      expect(accountRepository.updateById).toHaveBeenCalledWith('account-1', { passwordHash: 'hashed-password' });
    });
  });
});
