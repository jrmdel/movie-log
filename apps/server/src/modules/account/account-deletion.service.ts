import { Injectable } from '@nestjs/common';
import { HistoryService } from 'src/modules/history/history.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';
import { ListService } from 'src/modules/list/list.service';

@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly historyService: HistoryService,
    private readonly listService: ListService,
  ) {}

  public async deleteAccount(accountId: string): Promise<void> {
    await this.sessionRepository.deleteAllForUser(accountId);
    await this.historyService.deleteAllForAccount(accountId);
    await this.listService.deleteAllForAccount(accountId);
    await this.accountRepository.deleteById(accountId);
  }
}
