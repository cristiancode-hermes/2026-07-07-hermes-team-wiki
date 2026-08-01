import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { Organization } from './organization.entity.js';
import { Space } from './space.entity.js';
import { User } from './user.entity.js';
import { PageVersion } from './page-version.entity.js';
import { Comment } from './comment.entity.js';

@Entity('pages')
@Index(['organizationId', 'spaceId'])
@Index(['organizationId', 'slug'])
@Index(['organizationId', 'parentId'])
@Index(['organizationId', 'updatedAt'])
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  slug: string;

  @Column({ default: '', type: 'text' })
  content: string;

  @Column({ default: 1, type: 'int' })
  versionNumber: number;

  @Column({ default: false, type: 'boolean' })
  isHomePage: boolean;

  @Column({ default: 0, type: 'int' })
  sortOrder: number;

  @Column({ type: 'varchar' })
  organizationId: string;

  @ManyToOne(() => Organization, org => org.pages)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar' })
  spaceId: string;

  @ManyToOne(() => Space, space => space.pages)
  @JoinColumn({ name: 'spaceId' })
  space: Space;

  @Column({ nullable: true, type: 'varchar' })
  authorId: string | null;

  @ManyToOne(() => User, user => user.pages)
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @Column({ nullable: true, type: 'varchar' })
  parentId: string | null;

  @ManyToOne(() => Page, page => page.children)
  @JoinColumn({ name: 'parentId' })
  parent: Page | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Page, page => page.parent)
  children: Page[];

  @OneToMany(() => PageVersion, pv => pv.page)
  versions: PageVersion[];

  @OneToMany(() => Comment, comment => comment.page)
  comments: Comment[];
}
