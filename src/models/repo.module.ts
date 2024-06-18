import { Global, Module } from '@nestjs/common';
import RepoService from './repo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Criteria } from './entities/criteria.entity';
import { Score } from './entities/score.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Employee, Criteria, Score])],
  providers: [RepoService],
  exports: [RepoService],
})
export class RepoModule {}
