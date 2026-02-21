import { Injectable } from '@nestjs/common';
import { HistoryRepository } from 'src/modules/history/repositories/history.repository';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async getAll() {
    return this.historyRepository.find();
  }

  async getById(id: string) {
    return this.historyRepository.findById(id);
  }

  async create(data: any) {
    return this.historyRepository.create(data);
  }
}
