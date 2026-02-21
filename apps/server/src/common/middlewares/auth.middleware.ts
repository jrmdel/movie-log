import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { IAuthenticatedRequest } from 'src/common/interfaces/authenticated-request';
import { AuthService } from 'src/modules/account/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger('Auth');

  constructor(private readonly authService: AuthService) {}

  async use(request: IAuthenticatedRequest, _: Response, next: NextFunction): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      this.logger.warn('Invalid authorization header format');
      return next();
    }

    try {
      const user = await this.authService.resolveAuthenticatedUser(token);
      request.user = user ?? undefined;
      if (request.user) {
        this.logger.debug(`Authenticated request for user ${request.user._id} (${request.user.email})`);
      }
    } catch (error) {
      this.logger.warn(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    next();
  }
}
