import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAuthenticatedRequest } from 'src/common/types/auth.types';
import { TokenService } from 'src/modules/account/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();

    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authentication required');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.tokenService.resolveAuthenticatedUser(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = user;
    return true;
  }
}
