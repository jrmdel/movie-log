import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from 'src/app.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestMiddleware } from 'src/common/middlewares/request.middleware';
import { AccountModule } from 'src/modules/account/account.module';
import { TokenModule } from 'src/modules/account/token.module';
import { HistoryModule } from 'src/modules/history/history.module';
import { ListModule } from 'src/modules/list/list.module';
import { MovieModule } from 'src/modules/movie/movie.module';

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
    TokenModule,
    HistoryModule,
    ListModule,
    MovieModule,
  ],
  controllers: [AppController],
  providers: [Logger, AuthGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMiddleware).forRoutes('');
  }
}
