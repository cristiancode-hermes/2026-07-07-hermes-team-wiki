import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity.js';
import { Page } from './page.entity.js';

@Entity('spaces')
export class Space {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ default: '📁', type: 'varchar' })
  icon: string;

  @Column({ default: 0, type: 'int' })
  sortOrder: number;

  @Column({ type: 'varchar' })
  organizationId: string;

  @ManyToOne(() => Organization, org => org.spaces)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true, type: 'varchar' })
  homePageId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Page, page => page.space)
  pages: Page[];
}
