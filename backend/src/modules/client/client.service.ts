import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './dto';
import { Business } from '../business/business.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>
  ) {}

  async findByBusinessId(businessId: string): Promise<Client[]> {
    return this.clientRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, businessId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id, businessId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async create(businessId: string, dto: CreateClientDto): Promise<Client> {
    // Verify business exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const client = this.clientRepository.create({
      ...dto,
      businessId,
    });
    return this.clientRepository.save(client);
  }

  async update(id: string, businessId: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id, businessId);
    Object.assign(client, dto);
    return this.clientRepository.save(client);
  }

  async delete(id: string, businessId: string): Promise<void> {
    const client = await this.findById(id, businessId);
    await this.clientRepository.remove(client);
  }

  async search(businessId: string, query: string): Promise<Client[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .where('client.businessId = :businessId', { businessId })
      .andWhere('(client.name ILIKE :query OR client.email ILIKE :query)', { query: `%${query}%` })
      .orderBy('client.name', 'ASC')
      .getMany();
  }

  async updateTotalRevenue(clientId: string, amount: number): Promise<void> {
    await this.clientRepository.increment({ id: clientId }, 'totalRevenue', amount);
  }
}
