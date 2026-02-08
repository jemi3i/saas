import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('business/:businessId')
  async getByBusinessId(@Param('businessId') businessId: string) {
    return this.expenseService.findByBusinessId(businessId);
  }

  @Get('business/:businessId/stats')
  async getStats(@Param('businessId') businessId: string) {
    return this.expenseService.getStats(businessId);
  }

  @Get('business/:businessId/by-category')
  async getByCategory(@Param('businessId') businessId: string) {
    return this.expenseService.getByCategory(businessId);
  }

  @Get(':id/business/:businessId')
  async getById(@Param('id') id: string, @Param('businessId') businessId: string) {
    return this.expenseService.findById(id, businessId);
  }

  @Post('business/:businessId')
  async create(@Param('businessId') businessId: string, @Body() dto: CreateExpenseDto) {
    return this.expenseService.create(businessId, dto);
  }

  @Put(':id/business/:businessId')
  async update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: UpdateExpenseDto
  ) {
    return this.expenseService.update(id, businessId, dto);
  }

  @Put(':id/business/:businessId/approve')
  async approve(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: ApproveExpenseDto,
    @Req() req: any
  ) {
    return this.expenseService.approve(id, businessId, req.user.sub, dto.status);
  }

  @Delete(':id/business/:businessId')
  async delete(@Param('id') id: string, @Param('businessId') businessId: string) {
    await this.expenseService.delete(id, businessId);
    return { message: 'Expense deleted successfully' };
  }
}
