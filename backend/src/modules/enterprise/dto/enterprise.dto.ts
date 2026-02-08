import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { EnterpriseStatus } from '../../../common/enums';

export class CreateEnterpriseDto {
  @ApiProperty({ example: 'My Company LLC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ example: 'Tunisia' })
  @IsString()
  @IsOptional()
  country?: string;
}

export class UpdateEnterpriseDto {
  @ApiPropertyOptional({ example: 'Updated Company Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 'Tunisia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ enum: EnterpriseStatus })
  @IsEnum(EnterpriseStatus)
  @IsOptional()
  status?: EnterpriseStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  ownerId?: string;
}

export class UpdateEnterpriseStatusDto {
  @ApiProperty({ enum: EnterpriseStatus })
  @IsEnum(EnterpriseStatus)
  @IsNotEmpty()
  status: EnterpriseStatus;
}

export class EnterpriseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  taxId: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ enum: EnterpriseStatus })
  status: EnterpriseStatus;

  @ApiProperty()
  country: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
