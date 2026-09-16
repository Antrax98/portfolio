import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileLinkEntity } from './profile-link.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'full_name', type: 'varchar', length: 120, default: '' })
  fullName: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location: string | null;

  @Column({
    name: 'public_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  publicEmail: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @OneToMany(() => ProfileLinkEntity, (link) => link.profile, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  links: ProfileLinkEntity[];

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
