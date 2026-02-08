import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamInvitation, UserBusiness } from './entities';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamInvitation, UserBusiness, User, Business])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
