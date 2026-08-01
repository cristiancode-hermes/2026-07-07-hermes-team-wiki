import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Organization } from './organization.entity.js';
import { Page } from './page.entity.js';
import { User } from './user.entity.js';

@Entity('comments')
@Index(['pageId', 'createdAt'])
@Index(['authorId'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false, type: 'boolean' })
  isEdited: boolean;

  @Column({ type: 'varchar' })
  organizationId: string;

  @ManyToOne(() => Organization, org => org.comments)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar' })
  pageId: string;

  @ManyToOne(() => Page, page => page.comments)
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @Column({ nullable: true, type: 'varchar' })
  authorId: string | null;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
