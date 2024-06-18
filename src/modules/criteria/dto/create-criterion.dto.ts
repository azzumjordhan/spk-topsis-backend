import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCriterionDto {
  @ApiProperty()
  @IsNotEmpty()
  criteriaName: string;

  @ApiProperty()
  weight: number;
}
