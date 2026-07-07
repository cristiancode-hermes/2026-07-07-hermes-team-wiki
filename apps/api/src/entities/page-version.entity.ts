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

  @Column()
  versionNumber: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  summary: string | null;

  @Column({ default: '+0/-0' })
  changeStats: string;

  @Column()
  pageId: string;

  @ManyToOne(() => Page, page => page.versions)
  @JoinColumn({ name: 'pageId' })
  page: Page;

  @Column({ nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, user => user.versions)
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
