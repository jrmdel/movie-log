import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'src/modules/account/token.module';
import { HistoryController } from 'src/modules/history/history.controller';
import { HistoryDocument, HistorySchema } from 'src/modules/history/history.document';
import { HistoryService } from 'src/modules/history/history.service';
import { HistoryRepository } from 'src/modules/history/repositories/history.repository';
import { MovieModule } from 'src/modules/movie/movie.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HistoryDocument.name, schema: HistorySchema }]),
    MovieModule,
    TokenModule,
  ],
  controllers: [HistoryController],
  providers: [HistoryRepository, HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
