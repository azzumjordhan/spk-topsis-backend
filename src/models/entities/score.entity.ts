import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Criteria } from './criteria.entity';

@Entity({ name: 'scores' })
export class Score extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'employee_id',
  })
  employeeId: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'criteria_id',
  })
  criteriaId: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  score: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: false,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: false,
    name: 'deleted_at',
  })
  deletedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.score)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Criteria, (criteria) => criteria.score)
  @JoinColumn({ name: 'criteria_id' })
  criterion: Criteria;
}
