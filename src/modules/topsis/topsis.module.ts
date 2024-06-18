import { Module } from '@nestjs/common';
import { TopsisService } from './topsis.service';
import { TopsisController } from './topsis.controller';

@Module({
  providers: [TopsisService],
  exports: [TopsisService],
  controllers: [TopsisController],
})
export class TopsisModule {}
