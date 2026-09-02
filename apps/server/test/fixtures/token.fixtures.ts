import { ExecutionContext } from '@nestjs/common';
import { IBaseAccount } from 'src/modules/account/account.model';

export const userTokenFixture: IBaseAccount = {
  _id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
};

export const executionContextWithBearer: ExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => ({
      headers: {
        authorization: 'Bearer valid-token',
      },
      user: undefined,
    }),
  }),
} as ExecutionContext;

export const executionContextWithoutBearer: ExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => ({
      headers: {},
      user: undefined,
    }),
  }),
} as ExecutionContext;
