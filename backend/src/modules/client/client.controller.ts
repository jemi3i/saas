import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessAccessGuard, RolesGuard } from '../../common/guards';

@Controller('clients')
@UseGuards(JwtAuthGuard, BusinessAccessGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('business/:businessId')
  async getByBusinessId(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.clientService.findByBusinessId(businessId);
  }

  @Get('business/:businessId/search')
  async search(@Param('businessId', ParseUUIDPipe) businessId: string, @Query('q') query: string) {
    return this.clientService.search(businessId, query);
  }

  @Get(':id/business/:businessId')
  async getById(@Param('id', ParseUUIDPipe) id: string, @Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.clientService.findById(id, businessId);
  }

  @Post('business/:businessId')
  async create(@Param('businessId', ParseUUIDPipe) businessId: string, @Body() dto: CreateClientDto) {
    return this.clientService.create(businessId, dto);
  }

  @Put(':id/business/:businessId')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: UpdateClientDto
  ) {
    return this.clientService.update(id, businessId, dto);
  }

  @Delete(':id/business/:businessId')
  async delete(@Param('id', ParseUUIDPipe) id: string, @Param('businessId', ParseUUIDPipe) businessId: string) {
    await this.clientService.delete(id, businessId);
    return { message: 'Client deleted successfully' };
  }
}
