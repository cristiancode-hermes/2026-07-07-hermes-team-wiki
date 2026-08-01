import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity.js';
import { Space } from './space.entity.js';
import { Page } from './page.entity.js';
import { Comment } from './comment.entity.js';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  slug: string | null;

  @Column({ nullable: true, type: 'varchar' })
  logoUrl: string | null;

  @Column({ default: 'active', type: 'varchar' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Space, space => space.organization)
  spaces: Space[];

  @OneToMany(() => Page, page => page.organization)
  pages: Page[];

  @OneToMany(() => Comment, comment => comment.organization)
  comments: Comment[];
}
