import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { type IRequestWithUser } from 'src/common/types/auth.types';

interface IHealthStatus {
  status: 'OK' | 'NOT_OK';
}

@Controller({ version: '1' })
export class AppController {
  @Get('health')
  checkStatus(): IHealthStatus {
    return { status: 'OK' };
  }

  @Get('secure-test')
  @UseGuards(AuthGuard)
  getSecureTest(@Req() request: IRequestWithUser): {
    ok: true;
    user: IRequestWithUser['user'];
  } {
    return {
      ok: true,
      user: request.user,
    };
  }
}
