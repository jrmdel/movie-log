import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryModule } from 'src/modules/history/history.module';
import { ListModule } from 'src/modules/list/list.module';
import { AccountDeletionService } from 'src/modules/account/account-deletion.service';
import { AccountController } from 'src/modules/account/account.controller';
import { AccountService } from 'src/modules/account/account.service';
import { AuthService } from 'src/modules/account/auth.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';
import { AccountDocument, AccountSchema } from 'src/modules/account/schemas/account.document';
import { SessionDocument, SessionSchema } from 'src/modules/account/schemas/session.document';

@Module({
  imports: [
    HistoryModule,
    ListModule,
    MongooseModule.forFeature([
      { name: AccountDocument.name, schema: AccountSchema },
      { name: SessionDocument.name, schema: SessionSchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService, AuthService, AccountRepository, SessionRepository, AccountDeletionService],
  exports: [AccountService, AuthService, AccountRepository],
})
export class AccountModule {}
