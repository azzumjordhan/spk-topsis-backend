import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/models/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { StatusUser } from '../user/enum/status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(payload: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const addUser = await this.userService.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    });

    return addUser;
  }

  async getAuthenticateUser(email: string, plainTextPassword: string) {
    const user = await this.userService.getUserByEmail(email.toLowerCase());
    if (user.status != StatusUser.AKTIF) {
      throw new HttpException('INVALID CREDENTIALS', HttpStatus.BAD_REQUEST);
    }

    await this.verifyPassword(plainTextPassword, user.password);

    user.password = undefined;

    return user;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error_code: 'INVALID CREDENTIALS',
          message: 'Invalid Credentials',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public generateJwt(user: User) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return { profile: payload, access_token: this.jwtService.sign(payload) };
  }
}
