import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import RepoService from 'src/models/repo.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Employee } from 'src/models/entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private readonly repoService: RepoService) {}

  async create(payload: CreateEmployeeDto) {
    const addEmployee = this.repoService.employeeRepo.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: '-',
      position: payload.position,
      department: payload.department,
    });
    await this.repoService.employeeRepo.save(addEmployee);

    return addEmployee;
  }

  async findAll(options: IPaginationOptions, keyword: string) {
    let query = this.repoService.employeeRepo.createQueryBuilder('employee');

    if (keyword && keyword != '') {
      query = query.andWhere('employee.name ILIKE :name', {
        name: `%${keyword}%`,
      });
    }

    return paginate<Employee>(query, options);
  }

  async findOne(id: string) {
    const employee = await this.repoService.employeeRepo
      .createQueryBuilder('employee')
      .where('employee.id = :id', { id })
      .getOne();

    if (!employee) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'DATA_NOT_FOUND',
          message: 'Employee Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return employee;
  }

  async remove(id: string) {
    await this.checkDataEmployeeScore(id);

    const dataEmployee = await this.findOne(id);

    await this.repoService.employeeRepo.softDelete(dataEmployee.id);

    return `DELETE SUCCESS`;
  }

  async removeAll() {
    await this.checkDataEmployeeScore();

    const deleteAll = await this.repoService.employeeRepo
      .createQueryBuilder('employee')
      .softDelete()
      .execute();

    if (!deleteAll.affected) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Tidak ada data yang perlu dihapus.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return `RESET SUCCESS`;
  }

  async checkDataEmployeeScore(employeeId?: string): Promise<void> {
    if (employeeId) {
      const dataScore = await this.repoService.scoreRepo
        .createQueryBuilder('employeeScore')
        .andWhere('employeeScore.employee_id = :id', { id: employeeId })
        .getMany();

      if (dataScore.length !== 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error_code: 'BAD_REQUEST',
            message:
              'Terdapat data score Karyawan, tolong hapus terlebih dahulu sebelum menghapus data karyawan.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      const dataScore = await this.repoService.scoreRepo
        .createQueryBuilder('employeeScore')
        .getMany();

      if (dataScore.length !== 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error_code: 'BAD_REQUEST',
            message:
              'Terdapat data score Karyawan, tolong reset terlebih dahulu data score karyawan.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
