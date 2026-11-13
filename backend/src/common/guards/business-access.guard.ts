import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../modules/business/business.entity';
import { UserBusiness } from '../../modules/team/entities/user-business.entity';
import { EnterpriseStatus, Role } from '../enums';

export const BUSINESS_ID_PARAM_KEY = 'businessIdParam';

/**
 * Tells BusinessAccessGuard which route param holds the business id
 * (defaults to `businessId`). Example: `@BusinessIdParam('id')` on `GET /businesses/:id`.
 */
export const BusinessIdParam = (paramName: string) => SetMetadata(BUSINESS_ID_PARAM_KEY, paramName);

/**
 * Ensures the authenticated user may access the business identified by the route param
 * (`:businessId` by default, see `@BusinessIdParam`).
 *
 * - platform_admin: always allowed
 * - business_owner / business_admin: business must belong to the user's enterprise
 * - accountant / team_member: requires an active UserBusiness link
 * - client_external (and any other role): denied
 * - The business's enterprise must be ACTIVE (except for platform_admin)
 *
 * Must run after JwtAuthGuard (needs `req.user`).
 */
@Injectable()
export class BusinessAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(UserBusiness)
    private readonly userBusinessRepository: Repository<UserBusiness>,
    private readonly reflector: Reflector = new Reflector()
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler?.();
    const paramName =
      (handler && this.reflector.get<string>(BUSINESS_ID_PARAM_KEY, handler)) || 'businessId';
    const businessId: string | undefined = request.params?.[paramName];
    const user = request.user;

    if (!businessId) {
      return true;
    }
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === Role.PLATFORM_ADMIN) {
      return true;
    }
    if (user.role === Role.CLIENT_EXTERNAL) {
      throw new ForbiddenException('Access denied');
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['enterprise'],
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.enterprise?.status !== EnterpriseStatus.ACTIVE) {
      throw new ForbiddenException('Enterprise is not active');
    }

    if (user.role === Role.BUSINESS_OWNER || user.role === Role.BUSINESS_ADMIN) {
      if (user.enterpriseId && business.enterpriseId === user.enterpriseId) {
        return true;
      }
      throw new ForbiddenException('Access denied to this business');
    }

    if (user.role === Role.ACCOUNTANT || user.role === Role.TEAM_MEMBER) {
      const link = await this.userBusinessRepository.findOne({
        where: { userId: user.id, businessId, isActive: true },
      });
      if (link) {
        return true;
      }
      throw new ForbiddenException('Access denied to this business');
    }

    throw new ForbiddenException('Access denied');
  }
}
