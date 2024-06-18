import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import RepoService from 'src/models/repo.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Criteria } from 'src/models/entities/criteria.entity';

@Injectable()
export class CriteriaService {
  constructor(private readonly repoService: RepoService) {}

  async create(payload: CreateCriterionDto) {
    const totalWeight = await this.checkTotalWeight();

    if (totalWeight + payload.weight > 1) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Total bobot melebihi batas, pastikan total bobot adalah 1.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newCriteria = this.repoService.criteriaRepo.create({
      criteriaName: payload.criteriaName,
      weight: payload.weight,
    });
    await this.repoService.criteriaRepo.save(newCriteria);
    return newCriteria;
  }

  async findAll(options: IPaginationOptions, keyword: string) {
    let query = this.repoService.criteriaRepo.createQueryBuilder('criteria');

    if (keyword && keyword != '') {
      query = query.andWhere('criteria.criteriaName ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    return paginate<Criteria>(query, options);
  }

  async findOne(id: string) {
    const criteria = await this.repoService.criteriaRepo
      .createQueryBuilder('criteria')
      .where('criteria.id = :id', { id })
      .getOne();

    if (!criteria) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'DATA_NOT_FOUND',
          message: 'Criteria Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return criteria;
  }

  async remove(id: string) {
    await this.checkDataScores(
      'Masih ada data score, jika Anda ingin menghapus criteria, tolong reset data score terlebih dahulu.',
    );

    const dataCriteria = await this.findOne(id);

    await this.repoService.criteriaRepo.softDelete(dataCriteria.id);

    return `DELETE SUCCESS`;
  }

  async removeAll() {
    await this.checkDataScores(
      'Masih ada data score, jika anda ingin reset criteria, tolong reset data score terlebih dahulu.',
    );

    const deleteAll = await this.repoService.criteriaRepo
      .createQueryBuilder('criteria')
      .softDelete()
      .execute();

    if (!deleteAll.affected) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Hapus semua data gagal, tidak ada data yang perlu dihapus',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return `RESET SUCCESS`;
  }

  async checkDataScores(message: string): Promise<void> {
    const checkDataScores = await this.repoService.scoreRepo
      .createQueryBuilder('scores')
      .getMany();
    if (checkDataScores.length !== 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: `${message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkTotalWeight() {
    const dataCriteria = await this.repoService.criteriaRepo
      .createQueryBuilder('criteria')
      .select('SUM(criteria.weight)')
      .getRawOne();

    return parseFloat(dataCriteria.sum);
  }
}
