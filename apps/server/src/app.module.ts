import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { RequestMiddleware } from 'src/common/middlewares/request.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('');
  }
}
