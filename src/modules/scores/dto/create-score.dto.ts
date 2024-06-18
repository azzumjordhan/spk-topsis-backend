import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

class Scores {
  @ApiProperty()
  @IsUUID('all', { message: 'Is uuid and cannot empty' })
  criteriaId: string;

  @ApiProperty()
  score: number;
}

export class CreateScoreDto {
  @ApiProperty()
  @IsUUID('all', { message: 'Is uuid and cannot empty' })
  employeeId: string;

  @ApiProperty({
    type: () => [Scores],
  })
  scores: [Scores];
}
