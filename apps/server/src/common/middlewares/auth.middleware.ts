import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { IRequestWithUser } from 'src/common/types/auth.types';
import { AuthService } from 'src/modules/account/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly authService: AuthService) {}

  async use(
    request: IRequestWithUser,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      request.user = undefined;
      next();
      return;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      request.user = undefined;
      next();
      return;
    }

    const user = await this.authService.resolveAuthenticatedUser(token);
    request.user = user ?? undefined;

    if (request.user) {
      this.logger.debug(
        `Authenticated request for user ${request.user._id} (${request.user.email})`,
      );
    }

    next();
  }
}
