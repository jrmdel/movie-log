import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { BaseDatabaseService } from 'src/common/base/base-database.service';
import {
  IAccount,
  IBaseAccount,
  IChangePassword,
  ICreateAccount,
  IUpdateAccount,
} from 'src/modules/account/account.model';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { ListService } from 'src/modules/list/list.service';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AccountService extends BaseDatabaseService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly listService: ListService,
  ) {
    super();
  }

  public async createAccount(body: ICreateAccount): Promise<void> {
    const salt = await genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await hash(body.password, salt);

    try {
      const account = await this.accountRepository.create({
        username: body.username,
        email: body.email,
        passwordHash,
      });
      await this.listService.createSpecialLists(account._id);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email or username already in use');
      }
      throw error;
    }
  }

  public async validateUser(email: string, password: string): Promise<IBaseAccount> {
    const user = await this.accountRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
  }

  public async getById(id: string): Promise<IBaseAccount> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return this.toBaseAccount(account);
  }

  public async updateAccount(id: string, dto: IUpdateAccount): Promise<IBaseAccount> {
    const updated = await this.accountRepository.updateById(id, dto);
    if (!updated) {
      throw new NotFoundException('Account not found');
    }
    return this.toBaseAccount(updated);
  }

  public async changePassword(id: string, dto: IChangePassword): Promise<void> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const isCurrentPasswordValid = await compare(dto.currentPassword, account.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await hash(dto.newPassword, salt);
    await this.accountRepository.updateById(id, { passwordHash });
  }

  private toBaseAccount(account: IAccount): IBaseAccount {
    return {
      _id: account._id.toString(),
      username: account.username,
      email: account.email,
    };
  }
}
