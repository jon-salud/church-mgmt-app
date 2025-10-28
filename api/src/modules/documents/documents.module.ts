import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsDataStoreRepository } from './documents.datastore.repository';
import { DOCUMENTS_REPOSITORY } from './documents.repository.interface';
import { DataStoreModule } from '../../datastore';

@Module({
  imports: [DataStoreModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: DOCUMENTS_REPOSITORY,
      useClass: DocumentsDataStoreRepository,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
