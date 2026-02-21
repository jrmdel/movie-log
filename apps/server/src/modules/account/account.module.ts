import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountController } from 'src/modules/account/account.controller';
import { AccountService } from 'src/modules/account/account.service';
import { AuthService } from 'src/modules/account/auth.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';
import { AccountDocument, AccountSchema } from 'src/modules/account/schemas/account.document';
import { SessionDocument, SessionSchema } from 'src/modules/account/schemas/session.document';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountDocument.name, schema: AccountSchema },
      { name: SessionDocument.name, schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    AuthService,
    AccountRepository,
    SessionRepository,
  ],
  exports: [AccountService, AuthService, AccountRepository],
})
export class AccountModule {}
