import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { CreateEnterpriseDto, UpdateEnterpriseDto } from './dto';
import { EnterpriseStatus, Role } from '../../common/enums';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>
  ) {}

  async findAll(): Promise<Enterprise[]> {
    return this.enterpriseRepository.find({
      relations: ['businesses'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id },
      relations: ['businesses'],
    });
    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }
    return enterprise;
  }

  async findByOwnerId(ownerId: string): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { ownerId },
      relations: ['businesses'],
    });
  }

  async create(data: Partial<Enterprise>): Promise<Enterprise> {
    const enterprise = this.enterpriseRepository.create({
      ...data,
      status: data.status || EnterpriseStatus.PENDING,
    });
    return this.enterpriseRepository.save(enterprise);
  }

  async update(id: string, data: UpdateEnterpriseDto): Promise<Enterprise> {
    await this.enterpriseRepository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: EnterpriseStatus, userRole: Role): Promise<Enterprise> {
    // Only Platform Admin can change enterprise status
    if (userRole !== Role.PLATFORM_ADMIN) {
      throw new ForbiddenException('Only Platform Admin can change enterprise status');
    }

    const enterprise = await this.findById(id);
    enterprise.status = status;
    return this.enterpriseRepository.save(enterprise);
  }

  async delete(id: string): Promise<void> {
    const result = await this.enterpriseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Enterprise not found');
    }
  }

  async getPendingEnterprises(): Promise<Enterprise[]> {
    return this.enterpriseRepository.find({
      where: { status: EnterpriseStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async getStatistics() {
    const total = await this.enterpriseRepository.count();
    const pending = await this.enterpriseRepository.count({
      where: { status: EnterpriseStatus.PENDING },
    });
    const active = await this.enterpriseRepository.count({
      where: { status: EnterpriseStatus.ACTIVE },
    });
    const suspended = await this.enterpriseRepository.count({
      where: { status: EnterpriseStatus.SUSPENDED },
    });

    return { total, pending, active, suspended };
  }
}
