import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopsisService } from './topsis.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Module Topsis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('topsis')
export class TopsisController {
  constructor(private readonly topsisService: TopsisService) {}

  @Get('rank')
  async getRank() {
    const result = this.topsisService.resultEvaluation();
    return result;
  }
}
