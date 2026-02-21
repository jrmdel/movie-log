import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryController } from 'src/modules/history/history.controller';
import { HistoryDocument, HistorySchema } from 'src/modules/history/history.document';
import { HistoryService } from 'src/modules/history/history.service';
import { HistoryRepository } from 'src/modules/history/repositories/history.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: HistoryDocument.name, schema: HistorySchema }])],
  controllers: [HistoryController],
  providers: [HistoryRepository, HistoryService],
})
export class HistoryModule {}
