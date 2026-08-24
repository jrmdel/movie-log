import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { AccountDocument, AccountSchema } from 'src/modules/account/schemas/account.document';
import { TokenService } from 'src/modules/account/token.service';

/**
 * Leaf module exposing token verification only, so any feature module can guard its
 * routes without depending on AccountModule and its wider (and cyclical) dependency graph.
 */
const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
});

@Module({
  imports: [MongooseModule.forFeature([{ name: AccountDocument.name, schema: AccountSchema }]), jwtModule],
  providers: [AccountRepository, TokenService],
  exports: [TokenService, jwtModule],
})
export class TokenModule {}
