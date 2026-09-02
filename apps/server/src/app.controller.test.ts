import { createMock } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TokenService } from 'src/modules/account/token.service';
import {
  executionContextWithBearer,
  executionContextWithoutBearer,
  userTokenFixture,
} from 'test/fixtures/token.fixtures';

describe('AppController', () => {
  let controller: AppController;
  let tokenService: TokenService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: TokenService, useValue: createMock<TokenService>() }],
    }).compile();

    controller = app.get<AppController>(AppController);
    tokenService = app.get<TokenService>(TokenService);
  });

  describe('checkStatus', () => {
    it('should return OK', () => {
      const result = controller.checkStatus();

      expect(result).toEqual({ status: 'OK' });
    });
  });

  describe('secure route', () => {
    it('should reject unauthenticated requests', async () => {
      const guard = new AuthGuard(tokenService);

      await expect(guard.canActivate(executionContextWithoutBearer)).rejects.toThrow(UnauthorizedException);
    });

    it('should accept an authenticated request', async () => {
      const guard = new AuthGuard(tokenService);
      jest.spyOn(tokenService, 'resolveAuthenticatedUser').mockResolvedValue(userTokenFixture);

      await expect(guard.canActivate(executionContextWithBearer)).resolves.toBe(true);
    });
  });
});
