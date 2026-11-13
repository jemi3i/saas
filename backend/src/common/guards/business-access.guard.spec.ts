import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BusinessAccessGuard } from './business-access.guard';
import { EnterpriseStatus, Role } from '../enums';

const ENT_A = 'aaaaaaaa-0000-0000-0000-000000000000';
const ENT_B = 'bbbbbbbb-0000-0000-0000-000000000000';
const BIZ_B = 'bbbbbbbb-1111-0000-0000-000000000000';
const BIZ_A = 'aaaaaaaa-1111-0000-0000-000000000000';

const businesses: Record<string, any> = {
  [BIZ_A]: { id: BIZ_A, enterpriseId: ENT_A, enterprise: { id: ENT_A, status: EnterpriseStatus.ACTIVE } },
  [BIZ_B]: { id: BIZ_B, enterpriseId: ENT_B, enterprise: { id: ENT_B, status: EnterpriseStatus.ACTIVE } },
};

function makeGuard(links: Array<{ userId: string; businessId: string; isActive: boolean }> = [], overrides: Record<string, any> = {}) {
  const businessRepo = {
    findOne: jest.fn(async ({ where }) => overrides[where.id] ?? businesses[where.id] ?? null),
  };
  const userBusinessRepo = {
    findOne: jest.fn(async ({ where }) =>
      links.find(
        (l) => l.userId === where.userId && l.businessId === where.businessId && l.isActive === where.isActive
      ) ?? null
    ),
  };
  return new BusinessAccessGuard(businessRepo as any, userBusinessRepo as any);
}

function ctx(user: any, businessId?: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user, params: businessId ? { businessId } : {} }) }),
  } as any;
}

const user = (role: Role, enterpriseId: string | null = ENT_A, id = 'user-1') => ({ id, role, enterpriseId });

describe('BusinessAccessGuard', () => {
  it('denies a business_owner of enterprise A on a business of enterprise B (403)', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.BUSINESS_OWNER), BIZ_B))).rejects.toThrow(ForbiddenException);
  });

  it('denies a business_admin of enterprise A on a business of enterprise B (403)', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.BUSINESS_ADMIN), BIZ_B))).rejects.toThrow(ForbiddenException);
  });

  it('allows a business_owner on a business of their own enterprise', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.BUSINESS_OWNER), BIZ_A))).resolves.toBe(true);
  });

  it('allows platform_admin on any business', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.PLATFORM_ADMIN, null), BIZ_B))).resolves.toBe(true);
  });

  it('denies a team_member of the same enterprise WITHOUT a UserBusiness link (403)', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.TEAM_MEMBER), BIZ_A))).rejects.toThrow(ForbiddenException);
  });

  it('allows a team_member WITH an active UserBusiness link', async () => {
    const guard = makeGuard([{ userId: 'user-1', businessId: BIZ_A, isActive: true }]);
    await expect(guard.canActivate(ctx(user(Role.TEAM_MEMBER), BIZ_A))).resolves.toBe(true);
  });

  it('denies a team_member whose UserBusiness link is inactive (403)', async () => {
    const guard = makeGuard([{ userId: 'user-1', businessId: BIZ_A, isActive: false }]);
    await expect(guard.canActivate(ctx(user(Role.TEAM_MEMBER), BIZ_A))).rejects.toThrow(ForbiddenException);
  });

  it('denies an accountant without a link, allows with a link', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.ACCOUNTANT), BIZ_A))).rejects.toThrow(ForbiddenException);
    const guard = makeGuard([{ userId: 'user-1', businessId: BIZ_A, isActive: true }]);
    await expect(guard.canActivate(ctx(user(Role.ACCOUNTANT), BIZ_A))).resolves.toBe(true);
  });

  it('denies client_external (403)', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.CLIENT_EXTERNAL), BIZ_A))).rejects.toThrow(ForbiddenException);
  });

  it('denies access when the enterprise is pending (403)', async () => {
    const guard = makeGuard([], {
      [BIZ_A]: { ...businesses[BIZ_A], enterprise: { id: ENT_A, status: EnterpriseStatus.PENDING } },
    });
    await expect(guard.canActivate(ctx(user(Role.BUSINESS_OWNER), BIZ_A))).rejects.toThrow(ForbiddenException);
  });

  it('returns 404 when the business does not exist', async () => {
    await expect(
      makeGuard().canActivate(ctx(user(Role.BUSINESS_OWNER), 'cccccccc-0000-0000-0000-000000000000'))
    ).rejects.toThrow(NotFoundException);
  });

  it('lets requests without :businessId through', async () => {
    await expect(makeGuard().canActivate(ctx(user(Role.TEAM_MEMBER)))).resolves.toBe(true);
  });
});
