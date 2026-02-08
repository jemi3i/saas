import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory, ExpenseStatus } from '../../../common/enums';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @IsOptional()
  vendor?: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  vendor?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApproveExpenseDto {
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus.APPROVED | ExpenseStatus.REJECTED;

  @IsString()
  @IsOptional()
  notes?: string;
}
