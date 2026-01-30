import { Controller, Get } from '@nestjs/common';

interface IHealthStatus {
  status: 'OK' | 'NOT_OK';
}

@Controller()
export class AppController {
  @Get('health')
  checkStatus(): IHealthStatus {
    return { status: 'OK' };
  }
}
