import { Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessAccessGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, BusinessAccessGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('insights/business/:businessId')
  @Roles(Role.BUSINESS_OWNER)
  @ApiOperation({ summary: 'Generate AI financial insights from the business invoices' })
  async getInsights(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.aiService.getFinancialInsights(businessId);
  }
}
