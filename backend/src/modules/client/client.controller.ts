import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('business/:businessId')
  async getByBusinessId(@Param('businessId') businessId: string) {
    return this.clientService.findByBusinessId(businessId);
  }

  @Get('business/:businessId/search')
  async search(@Param('businessId') businessId: string, @Query('q') query: string) {
    return this.clientService.search(businessId, query);
  }

  @Get(':id/business/:businessId')
  async getById(@Param('id') id: string, @Param('businessId') businessId: string) {
    return this.clientService.findById(id, businessId);
  }

  @Post('business/:businessId')
  async create(@Param('businessId') businessId: string, @Body() dto: CreateClientDto) {
    return this.clientService.create(businessId, dto);
  }

  @Put(':id/business/:businessId')
  async update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: UpdateClientDto
  ) {
    return this.clientService.update(id, businessId, dto);
  }

  @Delete(':id/business/:businessId')
  async delete(@Param('id') id: string, @Param('businessId') businessId: string) {
    await this.clientService.delete(id, businessId);
    return { message: 'Client deleted successfully' };
  }
}
