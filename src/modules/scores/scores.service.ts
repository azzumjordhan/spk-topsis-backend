import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import RepoService from 'src/models/repo.service';
import { EmployeeScore, Score } from './interface/score-employee.interface';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { EmployeeScoreList } from './interface/list-employee-score.interface';
import { CustomPagination } from '../utils/custom-pagination/custom-pagination';

@Injectable()
export class ScoresService {
  constructor(private readonly repoService: RepoService) {}

  async create(payload: CreateScoreDto) {
    await this.isValidEmployee(payload.employeeId);

    const existingScore = await this.repoService.scoreRepo
      .createQueryBuilder('score')
      .select(['score.employeeId', 'score.criteriaId', 'score.score'])
      .leftJoin('score.criterion', 'criteria')
      .addSelect(['criteria.id', 'criteria.criteriaName'])
      .where('score.employeeId = :id', { id: payload.employeeId })
      .getMany();

    if (existingScore.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'The score data already exists, you can just update it',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const data of payload.scores) {
      const addScore = this.repoService.scoreRepo.create({
        employeeId: payload.employeeId,
        criteriaId: data.criteriaId,
        score: data.score,
      });
      await this.repoService.scoreRepo.save(addScore);
    }

    const result = await this.findScoresByEmployeeId(payload.employeeId);
    return result;
  }

  async getListEmployeeScores(
    options: IPaginationOptions,
    keyword: string,
  ): Promise<CustomPagination<EmployeeScoreList>> {
    let query = this.repoService.scoreRepo
      .createQueryBuilder('score')
      .leftJoinAndSelect('score.employee', 'employee');

    if (keyword && keyword != '') {
      query = query.andWhere('employee.name ILIKE :filter', {
        filter: `%${keyword}%`,
      });
    }

    const data = query
      .select([
        'score.employeeId AS employeeId',
        'employee.name AS employeeName',
        'SUM(score.score) AS totalScore',
      ])
      .groupBy('score.employeeId')
      .addGroupBy('employee.name');

    const result = await data.getRawMany();

    const scoreData = await data
      .limit(Number(options.limit))
      .offset((Number(options.page) - 1) * Number(options.limit))
      .getRawMany();

    const mapData: EmployeeScoreList[] = scoreData.map((row) => ({
      employeeId: row.employeeid,
      employeeName: row.employeename,
      totalScores: Number(row.totalscore),
    }));

    return new CustomPagination<EmployeeScoreList>(
      mapData,
      result.length,
      Number(options.page),
      Number(options.limit),
    );
  }

  async findScoresByEmployeeId(id: string): Promise<EmployeeScore> {
    const employeeScore = await this.repoService.scoreRepo
      .createQueryBuilder('score')
      .select(['score.employeeId', 'score.criteriaId', 'score.score'])
      .leftJoin('score.criterion', 'criteria')
      .addSelect(['criteria.id', 'criteria.criteriaName'])
      .where('score.employeeId = :id', { id: id })
      .getMany();

    if (employeeScore.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'No scores found for the specified employee',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const scores: Score[] = employeeScore.map((item) => ({
      criteriaId: item.criteriaId,
      criteriaName: item.criterion.criteriaName,
      score: item.score,
    }));

    const employee = await this.repoService.employeeRepo.findOne({
      where: { id },
    });

    const result: EmployeeScore = {
      employeeId: id,
      employeeName: employee.name,
      scores,
    };

    return result;
  }

  async update(employeeId: string, data: UpdateScoreDto) {
    await this.isValidEmployee(employeeId);
    const existingScore = await this.findScoresByEmployeeId(employeeId);

    for (const item of data.score) {
      for (const score of existingScore.scores) {
        if (item.criteriaId === score.criteriaId) {
          await this.repoService.scoreRepo.update(
            { employeeId: employeeId, criteriaId: item.criteriaId },
            { score: item.score },
          );
        }
      }
    }

    return await this.findScoresByEmployeeId(employeeId);
  }

  async removeEmployeeScore(employeeId: string) {
    const deleteScore = await this.repoService.scoreRepo
      .createQueryBuilder()
      .softDelete()
      .where('employee_id = :id', { id: employeeId })
      .execute();

    if (!deleteScore.affected) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'DELETE SCORE FAILED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return `DELETE SUCCESS`;
  }

  async resetScore(): Promise<string> {
    const reset = await this.repoService.scoreRepo
      .createQueryBuilder('scores')
      .softDelete()
      .execute();

    if (!reset.affected) {
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

  private async isValidEmployee(id: string) {
    const findEmployee = await this.repoService.employeeRepo.findOne({
      where: { id },
    });

    if (!findEmployee) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'NOT FOUND',
          message: 'Employee Not Exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
