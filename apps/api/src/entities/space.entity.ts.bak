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

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ default: '📁' })
  icon: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, org => org.spaces)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  homePageId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Page, page => page.space)
  pages: Page[];
}
