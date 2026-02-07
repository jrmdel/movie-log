import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from 'src/app.controller';
import { RequestMiddleware } from 'src/common/middlewares/request.middleware';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_CONNECTION_STRING'),
      }),
      inject: [ConfigService],
    }),
    AccountModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('');
  }
}
