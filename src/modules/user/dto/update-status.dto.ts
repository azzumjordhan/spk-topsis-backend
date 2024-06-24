import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStatusUser {
  @ApiProperty()
  @IsNotEmpty()
  status: string;
}
