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

  @Column()
  content: string;

  @Column({ default: false })
  isEdited: boolean;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, org => org.comments)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  pageId: string;

  @ManyToOne(() => Page, page => page.comments)
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @Column({ nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
