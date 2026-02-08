import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Enterprise } from '../../enterprise/enterprise.entity';
import { Role } from '../../../common/enums';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('team_invitations')
export class TeamInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ name: 'enterprise_id' })
  enterpriseId: string;

  @ManyToOne(() => Enterprise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enterprise_id' })
  enterprise: Enterprise;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.TEAM_MEMBER,
  })
  role: Role;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @Column({ unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'business_ids', type: 'simple-array', nullable: true })
  businessIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
