import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { BusinessAccessGuard } from './business-access.guard';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { ClientController } from '../../modules/client/client.controller';
import { InvoiceController } from '../../modules/invoice/invoice.controller';
import { ExpenseController } from '../../modules/expense/expense.controller';
import { AiController } from '../../modules/ai/ai.controller';
import { Role } from '../enums';

describe('Tenant isolation wiring', () => {
  it.each([
    ['ClientController', ClientController],
    ['InvoiceController', InvoiceController],
    ['ExpenseController', ExpenseController],
    ['AiController', AiController],
  ])('%s is protected by JwtAuthGuard + BusinessAccessGuard + RolesGuard (in that order)', (_name, controller) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller);
    expect(guards).toEqual([JwtAuthGuard, BusinessAccessGuard, RolesGuard]);
  });
});

describe('Expense approval roles', () => {
  const reflector = new Reflector();
  const rolesGuard = new RolesGuard(reflector);
  const handler = ExpenseController.prototype.approve;

  const ctx = (role: Role): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => ExpenseController,
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u', role } }) }),
    }) as any;

  it('denies team_member', () => {
    expect(rolesGuard.canActivate(ctx(Role.TEAM_MEMBER))).toBe(false);
  });

  it('denies client_external', () => {
    expect(rolesGuard.canActivate(ctx(Role.CLIENT_EXTERNAL))).toBe(false);
  });

  it.each([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN, Role.ACCOUNTANT])('allows %s', (role) => {
    expect(rolesGuard.canActivate(ctx(role))).toBe(true);
  });
});
