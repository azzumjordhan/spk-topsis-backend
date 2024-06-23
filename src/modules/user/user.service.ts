import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import RepoService from 'src/models/repo.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/models/entities/user.entity';
import { StatusUser } from './enum/status.enum';
import { RoleUser } from './enum/role.enum';

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
        filter: `%${keyword}`,
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
    findUser.password = undefined;

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

    return findUser;
  }

  async update(id: string, data: UpdateUserDto) {
    console.log(data);
    return `This action updates a #${id} user`;
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
