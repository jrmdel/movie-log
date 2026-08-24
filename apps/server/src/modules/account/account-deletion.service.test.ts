import { Test, TestingModule } from '@nestjs/testing';
import { AccountDeletionService } from 'src/modules/account/account-deletion.service';
import { AccountRepository } from 'src/modules/account/repositories/account.repository';
import { SessionRepository } from 'src/modules/account/repositories/session.repository';
import { HistoryService } from 'src/modules/history/history.service';
import { ListService } from 'src/modules/list/list.service';

describe('AccountDeletionService', () => {
  let service: AccountDeletionService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let historyService: jest.Mocked<HistoryService>;
  let listService: jest.Mocked<ListService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountDeletionService,
        { provide: AccountRepository, useValue: { deleteById: jest.fn() } },
        { provide: SessionRepository, useValue: { deleteAllForUser: jest.fn() } },
        { provide: HistoryService, useValue: { deleteAllForAccount: jest.fn() } },
        { provide: ListService, useValue: { deleteAllForAccount: jest.fn() } },
      ],
    }).compile();

    service = module.get(AccountDeletionService);
    accountRepository = module.get(AccountRepository);
    sessionRepository = module.get(SessionRepository);
    historyService = module.get(HistoryService);
    listService = module.get(ListService);
  });

  it('cascades sessions, history, lists, then the account itself', async () => {
    await service.deleteAccount('account-1');

    expect(sessionRepository.deleteAllForUser).toHaveBeenCalledWith('account-1');
    expect(historyService.deleteAllForAccount).toHaveBeenCalledWith('account-1');
    expect(listService.deleteAllForAccount).toHaveBeenCalledWith('account-1');
    expect(accountRepository.deleteById).toHaveBeenCalledWith('account-1');
  });
});
