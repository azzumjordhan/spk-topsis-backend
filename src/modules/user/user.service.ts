import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import RepoService from 'src/models/repo.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/models/entities/user.entity';
import { StatusUser } from './enum/status.enum';
import { RoleUser } from './enum/role.enum';
import { UpdateStatusUser } from './dto/update-status.dto';

@Injectable()
export class UserService {
  constructor(private readonly repoService: RepoService) {}

  async create(payload: CreateUserDto) {
    await this.isEmailAlreadyRegistered(payload.email);

    const addUser = this.repoService.userRepo.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role:
        payload.role.toLowerCase() === 'admin'
          ? RoleUser.ADMIN
          : RoleUser.SUPER_ADMIN,
      status: StatusUser.AKTIF,
    });

    await this.repoService.userRepo.save(addUser);

    addUser.password = undefined;

    return addUser;
  }

  async findAll(options: IPaginationOptions, keyword: string) {
    let query = this.repoService.userRepo.createQueryBuilder('user');

    if (keyword && keyword != '') {
      query = query.andWhere('user.name ILIKE :filter', {
        filter: `%${keyword}%`,
      });
    }

    return paginate<User>(query, options);
  }

  async getUserById(id: string) {
    const findUser = await this.repoService.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'role',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!findUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'NOT_FOUND',
          message: 'User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    findUser.password = undefined;

    return findUser;
  }

  async update(id: string, data: UpdateUserDto, userId: string) {
    const user = await this.getUserById(id);

    if (user.id != userId) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Tidak memiliki akses',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.repoService.userRepo.findOne({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'EMAIL IS ALREADY REGISTERED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.password !== '') {
      await this.repoService.userRepo.update(
        { id: user.id },
        { name: data.name, password: data.password, email: data.email },
      );
    } else {
      await this.repoService.userRepo.update(
        { id: user.id },
        { name: data.name, email: data.email },
      );
    }

    return await this.getUserById(id);
  }

  async updateStatusAndRole(id: string, payload: UpdateStatusUser) {
    const user = await this.getUserById(id);

    await this.repoService.userRepo.update(
      { id: user.id },
      {
        status:
          payload.status.toLowerCase() === StatusUser.AKTIF
            ? StatusUser.AKTIF
            : StatusUser.TIDAK_AKTIF,
        role:
          payload.role.toLowerCase() === RoleUser.SUPER_ADMIN
            ? RoleUser.SUPER_ADMIN
            : RoleUser.ADMIN,
      },
    );

    return await this.getUserById(user.id);
  }

  async getUserByEmail(email: string) {
    const user = await this.repoService.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error_code: 'DATA_NOT_FOUND',
          message: 'User Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async isEmailAlreadyRegistered(email: string): Promise<void> {
    const user = await this.repoService.userRepo.findOne({ where: { email } });

    if (user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'BAD_REQUEST',
          message: 'Email sudah terdaftar',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
