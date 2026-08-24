import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserPayload } from 'src/common/types/auth.types';
import { IBaseAccount } from 'src/modules/account/account.model';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountRepository: AccountRepository,
  ) {}

  public async resolveAuthenticatedUser(token: string): Promise<IBaseAccount | null> {
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
}
