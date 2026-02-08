import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './business.entity';
import { CreateBusinessDto, UpdateBusinessDto } from './dto';
import { Role } from '../../common/enums';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>
  ) {}

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      relations: ['enterprise'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEnterpriseId(enterpriseId: string): Promise<Business[]> {
    return this.businessRepository.find({
      where: { enterpriseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['enterprise'],
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async create(enterpriseId: string, ownerId: string, dto: CreateBusinessDto): Promise<Business> {
    const business = this.businessRepository.create({
      ...dto,
      enterpriseId,
      ownerId,
      currency: dto.currency || 'TND',
      taxRate: dto.taxRate ?? 19,
    });
    return this.businessRepository.save(business);
  }

  async update(
    id: string,
    dto: UpdateBusinessDto,
    userId: string,
    userRole: Role,
    userEnterpriseId: string
  ): Promise<Business> {
    const business = await this.findById(id);

    // Check access: Platform admin, business owner, or enterprise member
    const hasAccess =
      userRole === Role.PLATFORM_ADMIN ||
      business.ownerId === userId ||
      business.enterpriseId === userEnterpriseId;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this business');
    }

    // Only platform admin can change compliance status
    if (dto.isCompliant !== undefined && userRole !== Role.PLATFORM_ADMIN) {
      delete dto.isCompliant;
    }

    await this.businessRepository.update(id, dto);
    return this.findById(id);
  }

  async delete(
    id: string,
    userId: string,
    userRole: Role,
    userEnterpriseId: string
  ): Promise<void> {
    const business = await this.findById(id);

    // Check access
    const hasAccess =
      userRole === Role.PLATFORM_ADMIN ||
      business.ownerId === userId ||
      (business.enterpriseId === userEnterpriseId &&
        [Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN].includes(userRole));

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to delete this business');
    }

    await this.businessRepository.delete(id);
  }

  async updateComplianceStatus(id: string, isCompliant: boolean): Promise<Business> {
    await this.businessRepository.update(id, { isCompliant });
    return this.findById(id);
  }

  async getBusinessStatsByEnterprise(enterpriseId: string) {
    const businesses = await this.findByEnterpriseId(enterpriseId);
    const compliantCount = businesses.filter((b) => b.isCompliant).length;

    return {
      total: businesses.length,
      compliant: compliantCount,
      nonCompliant: businesses.length - compliantCount,
    };
  }
}
