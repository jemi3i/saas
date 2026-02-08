import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkAsPaidDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('business/:businessId')
  async getByBusinessId(@Param('businessId') businessId: string) {
    return this.invoiceService.findByBusinessId(businessId);
  }

  @Get('business/:businessId/stats')
  async getStats(@Param('businessId') businessId: string) {
    return this.invoiceService.getStats(businessId);
  }

  @Get(':id/business/:businessId')
  async getById(@Param('id') id: string, @Param('businessId') businessId: string) {
    return this.invoiceService.findById(id, businessId);
  }

  @Post('business/:businessId')
  async create(@Param('businessId') businessId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(businessId, dto);
  }

  @Put(':id/business/:businessId')
  async update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: UpdateInvoiceDto
  ) {
    return this.invoiceService.update(id, businessId, dto);
  }

  @Put(':id/business/:businessId/paid')
  async markAsPaid(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: MarkAsPaidDto
  ) {
    return this.invoiceService.markAsPaid(id, businessId, dto.paidDate);
  }

  @Put(':id/business/:businessId/sent')
  async markAsSent(@Param('id') id: string, @Param('businessId') businessId: string) {
    return this.invoiceService.markAsSent(id, businessId);
  }

  @Delete(':id/business/:businessId')
  async delete(@Param('id') id: string, @Param('businessId') businessId: string) {
    await this.invoiceService.delete(id, businessId);
    return { message: 'Invoice deleted successfully' };
  }
}
