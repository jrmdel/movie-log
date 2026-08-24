import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'src/modules/account/token.module';
import { ListController } from 'src/modules/list/list.controller';
import { ListDocument, ListSchema } from 'src/modules/list/list.document';
import { ListRepository } from 'src/modules/list/list.repository';
import { ListService } from 'src/modules/list/list.service';
import { MovieModule } from 'src/modules/movie/movie.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ListDocument.name, schema: ListSchema }]), MovieModule, TokenModule],
  controllers: [ListController],
  providers: [ListRepository, ListService],
  exports: [ListService],
})
export class ListModule {}
