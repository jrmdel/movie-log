import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { randomInt } from 'crypto';
import {
  IAccountLogin,
  IBaseAccount,
  ICreateAccount,
  ILoginResponse,
} from 'src/modules/account/account.model';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';

const SEVEN_DAYS_IN_MS = 604800000;

@Injectable()
export class AccountService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  public async createAccount(body: ICreateAccount): Promise<void> {
    const saltRounds = this.getSaltRounds();
    const salt = await genSalt(saltRounds);
    const passwordHash = await hash(body.password, salt);

    await this.accountRepository.create({
      username: body.username,
      email: body.email,
      passwordHash,
    });
  }

  public async authenticate(login: IAccountLogin): Promise<ILoginResponse> {
    const user = await this.validateUser(login.email, login.password);

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  private generateTokens(user: IBaseAccount): ILoginResponse {
    const accessToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user._id },
      { expiresIn: '7d' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const isSessionValid = await this.checkSession(refreshToken);
    if (!isSessionValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = this.jwtService.verify<{ sub: string }>(refreshToken);
    return this.jwtService.sign({ sub: payload.sub }, { expiresIn: '15m' });
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS);
    await this.sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });
  }

  private async validateUser(
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

  private async checkSession(refreshToken: string): Promise<boolean> {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      return false;
    }
    if (session.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  private getSaltRounds(): number {
    return randomInt(10, 20);
  }
}
