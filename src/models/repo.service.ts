import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Criteria } from './entities/criteria.entity';
import { Score } from './entities/score.entity';

@Injectable()
export default class RepoService {
  public constructor(
    @InjectRepository(User)
    public readonly userRepo: Repository<User>,

    @InjectRepository(Employee)
    public readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Criteria)
    public readonly criteriaRepo: Repository<Criteria>,

    @InjectRepository(Score)
    public readonly scoreRepo: Repository<Score>,
  ) {}
}
