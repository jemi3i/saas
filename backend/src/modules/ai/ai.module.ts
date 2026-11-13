import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { InvoiceModule } from '../invoice/invoice.module';
import { Business } from '../business/business.entity';
import { UserBusiness } from '../team/entities/user-business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, UserBusiness]), InvoiceModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
