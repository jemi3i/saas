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
import { EnterpriseService } from './enterprise.service';
import {
  CreateEnterpriseDto,
  UpdateEnterpriseDto,
  UpdateEnterpriseStatusDto,
  EnterpriseResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../common/enums';

@ApiTags('enterprises')
@Controller('enterprises')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Get()
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get all enterprises (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'List of enterprises', type: [EnterpriseResponseDto] })
  async findAll() {
    return this.enterpriseService.findAll();
  }

  @Get('statistics')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get enterprise statistics (Platform Admin only)' })
  async getStatistics() {
    return this.enterpriseService.getStatistics();
  }

  @Get('pending')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get pending enterprises (Platform Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of pending enterprises',
    type: [EnterpriseResponseDto],
  })
  async getPendingEnterprises() {
    return this.enterpriseService.getPendingEnterprises();
  }

  @Get('my-enterprise')
  @ApiOperation({ summary: 'Get current user enterprise' })
  @ApiResponse({ status: 200, description: 'User enterprise', type: EnterpriseResponseDto })
  async getMyEnterprise(@CurrentUser('enterpriseId') enterpriseId: string) {
    if (!enterpriseId) {
      return null;
    }
    return this.enterpriseService.findById(enterpriseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enterprise by ID' })
  @ApiResponse({ status: 200, description: 'Enterprise found', type: EnterpriseResponseDto })
  @ApiResponse({ status: 404, description: 'Enterprise not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    // Platform admin can access any enterprise
    // Others can only access their own enterprise
    if (user.role !== Role.PLATFORM_ADMIN && user.enterpriseId !== id) {
      return this.enterpriseService.findById(user.enterpriseId);
    }
    return this.enterpriseService.findById(id);
  }

  @Post()
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new enterprise (Platform Admin only)' })
  @ApiResponse({ status: 201, description: 'Enterprise created', type: EnterpriseResponseDto })
  async create(@Body() dto: CreateEnterpriseDto) {
    return this.enterpriseService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update enterprise' })
  @ApiResponse({ status: 200, description: 'Enterprise updated', type: EnterpriseResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnterpriseDto,
    @CurrentUser() user: any
  ) {
    // Only owner or platform admin can update
    if (user.role !== Role.PLATFORM_ADMIN && user.enterpriseId !== id) {
      throw new Error('Forbidden');
    }
    // Remove status from update if not platform admin
    if (user.role !== Role.PLATFORM_ADMIN) {
      delete dto.status;
    }
    return this.enterpriseService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update enterprise status (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated', type: EnterpriseResponseDto })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnterpriseStatusDto,
    @CurrentUser('role') userRole: Role
  ) {
    return this.enterpriseService.updateStatus(id, dto.status, userRole);
  }

  @Delete(':id')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Delete enterprise (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Enterprise deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.enterpriseService.delete(id);
    return { message: 'Enterprise deleted successfully' };
  }
}
