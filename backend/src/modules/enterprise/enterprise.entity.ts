import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EnterpriseStatus } from '../../common/enums';
import { Business } from '../business/business.entity';

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'tax_id' })
  taxId: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: EnterpriseStatus,
    default: EnterpriseStatus.PENDING,
  })
  status: EnterpriseStatus;

  @Column({ default: 'Tunisia' })
  country: string;

  @OneToMany(() => Business, (business) => business.enterprise)
  businesses: Business[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
