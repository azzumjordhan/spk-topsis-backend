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
} from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Criteria Module')
@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  async create(@Body() body: CreateCriterionDto) {
    return this.criteriaService.create(body);
  }

  @Get()
  @ApiQuery({
    name: 'keyword',
    required: false,
  })
  @ApiQuery({
    required: false,
    name: 'page',
  })
  @ApiQuery({
    required: false,
    name: 'limit',
  })
  async findAll(
    @Query('keyword') keyword: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.criteriaService.findAll({ page, limit }, keyword);
  }

  @Get('test-total-weight')
  async totalWeight() {
    return this.criteriaService.checkTotalWeight();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.criteriaService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.criteriaService.remove(id);
  }

  @Post('reset')
  async removeAll() {
    return this.criteriaService.removeAll();
  }
}
