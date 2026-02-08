import {
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../../../common/enums';

export class InvoiceItemDto {
  @IsString()
  id: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @Type(() => Date)
  @IsDate()
  issueDate: Date;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}

export class UpdateInvoiceDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  issueDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsOptional()
  items?: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarkAsPaidDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  paidDate?: Date;
}
