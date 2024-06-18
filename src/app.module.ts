import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { ScoresModule } from './modules/scores/scores.module';
import { TopsisModule } from './modules/topsis/topsis.module';
import ormconfig from './database/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    UserModule,
    EmployeesModule,
    CriteriaModule,
    ScoresModule,
    TopsisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
