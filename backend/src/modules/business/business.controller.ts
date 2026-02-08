import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto, BusinessResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/enums';

@ApiTags('businesses')
@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get all businesses (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all businesses', type: [BusinessResponseDto] })
  async findAll() {
    return this.businessService.findAll();
  }

  @Get('my-businesses')
  @ApiOperation({ summary: 'Get businesses for current user enterprise' })
  @ApiResponse({ status: 200, description: 'List of user businesses', type: [BusinessResponseDto] })
  async getMyBusinesses(@CurrentUser('enterpriseId') enterpriseId: string) {
    if (!enterpriseId) {
      return [];
    }
    return this.businessService.findByEnterpriseId(enterpriseId);
  }

  @Get('enterprise/:enterpriseId')
  @ApiOperation({ summary: 'Get businesses by enterprise ID' })
  @ApiResponse({
    status: 200,
    description: 'List of enterprise businesses',
    type: [BusinessResponseDto],
  })
  async findByEnterpriseId(
    @Param('enterpriseId', ParseUUIDPipe) enterpriseId: string,
    @CurrentUser() user: any
  ) {
    // Only allow access to own enterprise businesses unless platform admin
    if (user.role !== Role.PLATFORM_ADMIN && user.enterpriseId !== enterpriseId) {
      return this.businessService.findByEnterpriseId(user.enterpriseId);
    }
    return this.businessService.findByEnterpriseId(enterpriseId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get business statistics for user enterprise' })
  async getStats(@CurrentUser('enterpriseId') enterpriseId: string) {
    if (!enterpriseId) {
      return { total: 0, compliant: 0, nonCompliant: 0 };
    }
    return this.businessService.getBusinessStatsByEnterprise(enterpriseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiResponse({ status: 200, description: 'Business found', type: BusinessResponseDto })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const business = await this.businessService.findById(id);

    // Check access
    if (user.role !== Role.PLATFORM_ADMIN && business.enterpriseId !== user.enterpriseId) {
      throw new Error('Forbidden');
    }

    return business;
  }

  @Post()
  @Roles(Role.PLATFORM_ADMIN, Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, description: 'Business created', type: BusinessResponseDto })
  async create(@Body() dto: CreateBusinessDto, @CurrentUser() user: any) {
    if (!user.enterpriseId) {
      throw new Error('User must belong to an enterprise');
    }
    return this.businessService.create(user.enterpriseId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update business' })
  @ApiResponse({ status: 200, description: 'Business updated', type: BusinessResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBusinessDto,
    @CurrentUser() user: any
  ) {
    return this.businessService.update(id, dto, user.id, user.role, user.enterpriseId);
  }

  @Patch(':id/compliance')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update business compliance status (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Compliance status updated', type: BusinessResponseDto })
  async updateComplianceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isCompliant') isCompliant: boolean
  ) {
    return this.businessService.updateComplianceStatus(id, isCompliant);
  }

  @Delete(':id')
  @Roles(Role.PLATFORM_ADMIN, Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN)
  @ApiOperation({ summary: 'Delete business' })
  @ApiResponse({ status: 200, description: 'Business deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    await this.businessService.delete(id, user.id, user.role, user.enterpriseId);
    return { message: 'Business deleted successfully' };
  }
}
