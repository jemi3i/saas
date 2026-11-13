import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { BusinessAccessGuard, BUSINESS_ID_PARAM_KEY } from './business-access.guard';
import { BusinessController } from '../../modules/business/business.controller';
import { EnterpriseController } from '../../modules/enterprise/enterprise.controller';
import { EnterpriseStatus, Role } from '../enums';

const ENT_A = 'aaaaaaaa-0000-0000-0000-000000000000';
const ENT_B = 'bbbbbbbb-0000-0000-0000-000000000000';
const BIZ_A = 'aaaaaaaa-1111-0000-0000-000000000000';

const ownerB = { id: 'user-b', role: Role.BUSINESS_OWNER, enterpriseId: ENT_B };
const ownerA = { id: 'user-a', role: Role.BUSINESS_OWNER, enterpriseId: ENT_A };
const admin = { id: 'admin', role: Role.PLATFORM_ADMIN, enterpriseId: null };

describe('EnterpriseController access', () => {
  const service = {
    findById: jest.fn(async (id: string) => ({ id })),
    update: jest.fn(async (id: string) => ({ id })),
  };
  const controller = new EnterpriseController(service as any);

  beforeEach(() => jest.clearAllMocks());

  it('GET /enterprises/:id → 403 for another enterprise', async () => {
    await expect(controller.findById(ENT_A, ownerB)).rejects.toThrow(ForbiddenException);
    expect(service.findById).not.toHaveBeenCalled();
  });

  it('GET /enterprises/:id → allowed for own enterprise and platform_admin', async () => {
    await expect(controller.findById(ENT_A, ownerA)).resolves.toEqual({ id: ENT_A });
    await expect(controller.findById(ENT_A, admin)).resolves.toEqual({ id: ENT_A });
  });

  it('PUT /enterprises/:id → 403 for another enterprise', async () => {
    await expect(controller.update(ENT_A, {} as any, ownerB)).rejects.toThrow(ForbiddenException);
    expect(service.update).not.toHaveBeenCalled();
  });
});

describe('BusinessController access', () => {
  const service = {
    findByEnterpriseId: jest.fn(async () => []),
    getBusinessStatsByEnterprise: jest.fn(async (id: string) => ({ scope: id })),
    getGlobalBusinessStats: jest.fn(async () => ({ scope: 'global' })),
  };
  const controller = new BusinessController(service as any);

  beforeEach(() => jest.clearAllMocks());

  it('GET /businesses/enterprise/:enterpriseId → 403 for another enterprise', async () => {
    await expect(controller.findByEnterpriseId(ENT_A, ownerB)).rejects.toThrow(ForbiddenException);
    expect(service.findByEnterpriseId).not.toHaveBeenCalled();
  });

  it('GET /businesses/enterprise/:enterpriseId → allowed for own enterprise and platform_admin', async () => {
    await controller.findByEnterpriseId(ENT_A, ownerA);
    await controller.findByEnterpriseId(ENT_A, admin);
    expect(service.findByEnterpriseId).toHaveBeenCalledTimes(2);
  });

  it('GET /businesses/stats → scoped to the user enterprise, global for platform_admin', async () => {
    await expect(controller.getStats(ownerB)).resolves.toEqual({ scope: ENT_B });
    await expect(controller.getStats(admin)).resolves.toEqual({ scope: 'global' });
    await expect(controller.getStats({ role: Role.TEAM_MEMBER, enterpriseId: null })).resolves.toEqual({
      total: 0,
      compliant: 0,
      nonCompliant: 0,
    });
  });

  it.each(['findById', 'update'] as const)(
    'GET/PUT /businesses/:id (%s) is guarded by BusinessAccessGuard reading :id',
    (method) => {
      const handler = BusinessController.prototype[method];
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([BusinessAccessGuard]);
      expect(Reflect.getMetadata(BUSINESS_ID_PARAM_KEY, handler)).toBe('id');
    }
  );

  it('BusinessAccessGuard with @BusinessIdParam("id") denies owner B on business of A (403)', async () => {
    const businessRepo = {
      findOne: jest.fn(async () => ({
        id: BIZ_A,
        enterpriseId: ENT_A,
        enterprise: { id: ENT_A, status: EnterpriseStatus.ACTIVE },
      })),
    };
    const guard = new BusinessAccessGuard(businessRepo as any, { findOne: jest.fn() } as any, new Reflector());
    const ctx = {
      getHandler: () => BusinessController.prototype.findById,
      switchToHttp: () => ({ getRequest: () => ({ user: ownerB, params: { id: BIZ_A } }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(businessRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: BIZ_A } }));
  });
});
