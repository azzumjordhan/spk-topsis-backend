import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TopsisService } from './topsis.service';

@ApiTags('Module Topsis')
@Controller('topsis')
export class TopsisController {
  constructor(private readonly topsisService: TopsisService) {}

  // @Get()
  // async getResult() {
  //   return this.topsisService.evaluasiHasil();
  // }

  @Get('rank')
  async getRank() {
    const result = this.topsisService.resultEvaluation();
    return result;
  }
}
