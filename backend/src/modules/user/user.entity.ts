import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../common/enums';
import { Enterprise } from '../enterprise/enterprise.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.BUSINESS_OWNER,
  })
  role: Role;

  @Column({ name: 'enterprise_id', type: 'uuid', nullable: true })
  enterpriseId: string | null;

  @ManyToOne(() => Enterprise, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enterprise_id' })
  enterprise: Enterprise;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  @Exclude()
  refreshToken: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
