import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'src/modules/account/token.module';
import { BulkImportController } from 'src/modules/bulk-import/bulk-import.controller';
import { BulkImportJobDocument, BulkImportJobSchema } from 'src/modules/bulk-import/bulk-import.document';
import { BulkImportService } from 'src/modules/bulk-import/bulk-import.service';
import { BulkImportRepository } from 'src/modules/bulk-import/repositories/bulk-import.repository';
import { HistoryModule } from 'src/modules/history/history.module';
import { MovieModule } from 'src/modules/movie/movie.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BulkImportJobDocument.name, schema: BulkImportJobSchema }]),
    MovieModule,
    HistoryModule,
    TokenModule,
  ],
  controllers: [BulkImportController],
  providers: [BulkImportRepository, BulkImportService],
})
export class BulkImportModule {}
