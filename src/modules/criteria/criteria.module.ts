import { Module } from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';
import { RepoModule } from 'src/models/repo.module';

@Module({
  controllers: [CriteriaController],
  providers: [CriteriaService],
  imports: [RepoModule],
})
export class CriteriaModule {}
