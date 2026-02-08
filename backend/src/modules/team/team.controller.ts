import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamService } from './team.service';
import {
  InviteTeamMemberDto,
  CreateTeamMemberDto,
  AcceptInvitationDto,
  UpdateTeamMemberDto,
  AssignBusinessDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/enums';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // Public endpoint to accept invitation
  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accept team invitation and create account' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.teamService.acceptInvitation(dto);
  }

  // Get team members (protected)
  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all team members' })
  async getTeamMembers(@CurrentUser('enterpriseId') enterpriseId: string) {
    return this.teamService.getTeamMembers(enterpriseId);
  }

  // Get pending invitations
  @Get('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending invitations' })
  async getPendingInvitations(@CurrentUser('enterpriseId') enterpriseId: string) {
    return this.teamService.getPendingInvitations(enterpriseId);
  }

  // Send invitation (Option B)
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a team member via email' })
  async inviteTeamMember(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @CurrentUser('id') inviterId: string,
    @Body() dto: InviteTeamMemberDto
  ) {
    return this.teamService.inviteTeamMember(enterpriseId, inviterId, dto);
  }

  // Create team member directly (Option A)
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a team member directly with credentials' })
  async createTeamMember(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @Body() dto: CreateTeamMemberDto
  ) {
    return this.teamService.createTeamMember(enterpriseId, dto);
  }

  // Update team member
  @Put('members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team member' })
  async updateTeamMember(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @CurrentUser('id') currentUserId: string,
    @Param('id', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateTeamMemberDto
  ) {
    return this.teamService.updateTeamMember(enterpriseId, memberId, dto, currentUserId);
  }

  // Remove team member
  @Delete('members/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove team member' })
  async removeTeamMember(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @CurrentUser('id') currentUserId: string,
    @Param('id', ParseUUIDPipe) memberId: string
  ) {
    return this.teamService.removeTeamMember(enterpriseId, memberId, currentUserId);
  }

  // Cancel invitation
  @Delete('invitations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel pending invitation' })
  async cancelInvitation(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @Param('id', ParseUUIDPipe) invitationId: string
  ) {
    return this.teamService.cancelInvitation(enterpriseId, invitationId);
  }

  // Assign user to business
  @Post('assign-business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign team member to a business' })
  async assignToBusiness(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @Body() dto: AssignBusinessDto
  ) {
    return this.teamService.assignToBusiness(enterpriseId, dto);
  }

  // Remove user from business
  @Delete('members/:userId/business/:businessId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove team member from a business' })
  async removeFromBusiness(
    @CurrentUser('enterpriseId') enterpriseId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('businessId', ParseUUIDPipe) businessId: string
  ) {
    return this.teamService.removeFromBusiness(enterpriseId, userId, businessId);
  }

  // Get my accessible businesses
  @Get('my-businesses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get businesses accessible to current user' })
  async getMyBusinesses(@CurrentUser('id') userId: string) {
    return this.teamService.getMyBusinesses(userId);
  }
}
