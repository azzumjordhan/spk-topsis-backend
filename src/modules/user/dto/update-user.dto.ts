import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
