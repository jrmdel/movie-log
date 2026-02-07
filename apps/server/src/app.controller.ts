import { Controller, Get } from '@nestjs/common';

interface IHealthStatus {
  status: 'OK' | 'NOT_OK';
}

@Controller({ version: '1' })
export class AppController {
  @Get('health')
  checkStatus(): IHealthStatus {
    return { status: 'OK' };
  }
}
