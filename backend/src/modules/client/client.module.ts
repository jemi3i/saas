import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Business } from '../business/business.entity';
import { UserBusiness } from '../team/entities/user-business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Business, UserBusiness])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
