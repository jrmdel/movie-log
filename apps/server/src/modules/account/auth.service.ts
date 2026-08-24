import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { IAuthenticatedUser, IUserPayload } from 'src/common/types/auth.types';
import { IAccountLogin, IBaseAccount, ILoginResponse } from 'src/modules/account/account.model';
import { AccountService } from 'src/modules/account/account.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';

const SEVEN_DAYS_IN_MS = 604800000;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  public async authenticate(login: IAccountLogin): Promise<ILoginResponse> {
    const user = await this.accountService.validateUser(login.email, login.password);
    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  public async refreshSession(refreshToken: string): Promise<ILoginResponse> {
    const session = await this.sessionRepository.findByRefreshTokenHash(this.hashToken(refreshToken));
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.verify<{ sub: string }>(refreshToken);
    const account = await this.accountRepository.findById(payload.sub);
    if (!account) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user: IBaseAccount = {
      _id: account._id.toString(),
      username: account.username,
      email: account.email,
    };

    const tokens = this.generateTokens(user);
    await this.sessionRepository.updateRefreshTokenHash(
      this.hashToken(refreshToken),
      this.hashToken(tokens.refreshToken),
      new Date(Date.now() + SEVEN_DAYS_IN_MS),
    );

    return tokens;
  }

  public async logout(userId: string, refreshToken: string): Promise<void> {
    await this.sessionRepository.deleteByRefreshTokenHash(this.hashToken(refreshToken), userId);
  }

  public async resolveAuthenticatedUser(token: string): Promise<IAuthenticatedUser | null> {
    try {
      const payload = this.jwtService.verify<IUserPayload>(token);
      const userId = payload.sub ?? payload._id;
      const userEmail = payload.email ?? '';

      const dbUser = await this.accountRepository.findBySubOrEmail(userId ?? '', userEmail);

      if (!dbUser) {
        return null;
      }

      return {
        _id: dbUser._id.toString(),
        username: dbUser.username,
        email: dbUser.email,
      };
    } catch {
      return null;
    }
  }

  private generateTokens(user: IBaseAccount): ILoginResponse {
    const accessToken = this.jwtService.sign({ sub: user._id, email: user.email }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS);
    await this.sessionRepository.create({
      userId,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt,
    });
  }

  // Refresh tokens are hashed before persistence so a database leak doesn't expose usable tokens directly.
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
