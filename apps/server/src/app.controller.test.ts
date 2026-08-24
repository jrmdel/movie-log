import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TokenService } from 'src/modules/account/token.service';

const tokenServiceMock = {
  resolveAuthenticatedUser: (token: string) => {
    if (!token) {
      return null;
    }

    return {
      _id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };
  },
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: TokenService, useValue: tokenServiceMock }],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  describe('checkStatus', () => {
    it('should return OK', () => {
      const result = controller.checkStatus();

      expect(result).toEqual({ status: 'OK' });
    });
  });

  describe('secure route', () => {
    it('should reject unauthenticated requests', async () => {
      const guard = new AuthGuard(tokenServiceMock as any);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
            user: undefined,
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should accept an authenticated request', async () => {
      const guard = new AuthGuard(tokenServiceMock as any);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
            user: undefined,
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});
