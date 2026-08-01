import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity.js';
import { Page } from './page.entity.js';
import { PageVersion } from './page-version.entity.js';
import { Comment } from './comment.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ default: 'editor', type: 'varchar' })
  role: 'admin' | 'editor' | 'viewer';

  @Column({ nullable: true, type: 'varchar' })
  avatarUrl: string | null;

  @Column({ default: 'active', type: 'varchar' })
  status: 'active' | 'inactive';

  @Column({ type: 'varchar' })
  organizationId: string;

  @ManyToOne(() => Organization, org => org.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Page, page => page.author)
  pages: Page[];

  @OneToMany(() => PageVersion, pv => pv.author)
  versions: PageVersion[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];
}
