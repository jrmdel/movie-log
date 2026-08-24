import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { IBaseAccount, ICreateAccount } from 'src/modules/account/account.model';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { ListService } from 'src/modules/list/list.service';

const BCRYPT_SALT_ROUNDS = 10;
const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000;

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly listService: ListService,
  ) {}

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

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: number }).code === MONGO_DUPLICATE_KEY_ERROR_CODE
    );
  }
}
