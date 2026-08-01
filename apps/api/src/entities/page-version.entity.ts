import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Page } from './page.entity.js';
import { User } from './user.entity.js';

@Entity('page_versions')
@Index(['pageId', 'versionNumber'])
export class PageVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'text' })
  summary: string | null;

  @Column({ default: '+0/-0', type: 'varchar' })
  changeStats: string;

  @Column({ type: 'varchar' })
  pageId: string;

  @ManyToOne(() => Page, page => page.versions)
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @Column({ nullable: true, type: 'varchar' })
  authorId: string | null;

  @ManyToOne(() => User, user => user.versions)
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
