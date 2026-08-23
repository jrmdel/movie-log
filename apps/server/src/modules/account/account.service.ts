import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import {
  IBaseAccount,
  ICreateAccount,
} from 'src/modules/account/account.model';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  public async createAccount(body: ICreateAccount): Promise<void> {
    const salt = await genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await hash(body.password, salt);

    await this.accountRepository.create({
      username: body.username,
      email: body.email,
      passwordHash,
    });
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<IBaseAccount> {
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
}
