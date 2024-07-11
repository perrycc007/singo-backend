import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';

@Module({
  providers: [PracticeService],
  controllers: [PracticeController]
})
export class PracticeModule {}
