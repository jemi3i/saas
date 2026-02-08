import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { Business } from '../business/business.entity';
import { ExpenseStatus, ExpenseCategory } from '../../common/enums';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>
  ) {}

  async findByBusinessId(businessId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { businessId },
      order: { date: 'DESC' },
    });
  }

  async findById(id: string, businessId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, businessId },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async create(businessId: string, dto: CreateExpenseDto): Promise<Expense> {
    // Verify business exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const expense = this.expenseRepository.create({
      ...dto,
      businessId,
    });
    return this.expenseRepository.save(expense);
  }

  async update(id: string, businessId: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findById(id, businessId);
    Object.assign(expense, dto);
    return this.expenseRepository.save(expense);
  }

  async approve(
    id: string,
    businessId: string,
    userId: string,
    status: ExpenseStatus
  ): Promise<Expense> {
    const expense = await this.findById(id, businessId);
    expense.status = status;
    expense.approvedById = userId;
    expense.approvedAt = new Date();
    return this.expenseRepository.save(expense);
  }

  async delete(id: string, businessId: string): Promise<void> {
    const expense = await this.findById(id, businessId);
    await this.expenseRepository.remove(expense);
  }

  async getStats(businessId: string) {
    const expenses = await this.expenseRepository.find({ where: { businessId } });

    const totalExpenses = expenses
      .filter((exp) => exp.status === ExpenseStatus.APPROVED)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const pendingAmount = expenses
      .filter((exp) => exp.status === ExpenseStatus.PENDING)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const byCategory = expenses
      .filter((exp) => exp.status === ExpenseStatus.APPROVED)
      .reduce(
        (acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    return {
      totalExpenses,
      pendingAmount,
      pendingCount: expenses.filter((exp) => exp.status === ExpenseStatus.PENDING).length,
      approvedCount: expenses.filter((exp) => exp.status === ExpenseStatus.APPROVED).length,
      rejectedCount: expenses.filter((exp) => exp.status === ExpenseStatus.REJECTED).length,
      byCategory,
    };
  }

  async getExpensesByPeriod(businessId: string, startDate: Date, endDate: Date) {
    const expenses = await this.expenseRepository.find({
      where: {
        businessId,
        status: ExpenseStatus.APPROVED,
        date: Between(startDate, endDate),
      },
    });

    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }

  async getByCategory(businessId: string): Promise<{ category: ExpenseCategory; total: number }[]> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.businessId = :businessId', { businessId })
      .andWhere('expense.status = :status', { status: ExpenseStatus.APPROVED })
      .groupBy('expense.category')
      .getRawMany();

    return result;
  }
}
