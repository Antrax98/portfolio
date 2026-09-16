import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Entity('profile_links')
export class ProfileLinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  kind: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @Column({ type: 'int', default: 0 })
  position: number;

  @ManyToOne(() => ProfileEntity, (profile) => profile.links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: ProfileEntity;
}
