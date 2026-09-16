import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectAssetEntity } from './project-asset.entity';

@Entity('projects')
@Index('UQ_projects_user_slug', ['userId', 'slug'], { unique: true })
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 140 })
  slug: string;

  @Column({ type: 'varchar', length: 140 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'started_at', type: 'date', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'ended_at', type: 'date', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'int', default: 0 })
  position: number;

  @OneToMany(() => ProjectAssetEntity, (asset) => asset.project, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  assets: ProjectAssetEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
