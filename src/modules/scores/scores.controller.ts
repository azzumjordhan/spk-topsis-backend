import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Scores Module')
@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(createScoreDto);
  }

  @Get('employee-list-score')
  @ApiQuery({
    required: false,
    name: 'page',
  })
  @ApiQuery({
    required: false,
    name: 'limit',
  })
  async listEmployeeScore(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.scoresService.getListEmployeeScores({ page, limit });
  }

  @Get('employee/:employeeId')
  async findOne(@Param('employeeId') id: string) {
    return this.scoresService.findScoresByEmployeeId(id);
  }

  @Put('employee/:employeeId')
  async update(
    @Param('employeeId') id: string,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    return this.scoresService.update(id, updateScoreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.scoresService.removeEmployeeScore(id);
  }

  @Post('reset')
  async removeAll() {
    return this.scoresService.resetScore();
  }
}