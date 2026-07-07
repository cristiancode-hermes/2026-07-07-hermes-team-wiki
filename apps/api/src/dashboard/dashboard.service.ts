import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity.js';
import { Comment } from '../entities/comment.entity.js';
import { User } from '../entities/user.entity.js';
import { Space } from '../entities/space.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
  ) {}

  async getStats(organizationId: string) {
    const [pageCount, spaceCount, commentCount, userCount] = await Promise.all([
      this.pageRepo.count({ where: { organizationId } }),
      this.spaceRepo.count({ where: { organizationId } }),
      this.commentRepo.count({ where: { organizationId } }),
      this.userRepo.count({ where: { organizationId } }),
    ]);
    return { pageCount, spaceCount, commentCount, userCount };
  }

  async getRecent(organizationId: string, limit: number = 10) {
    return this.pageRepo.find({
      where: { organizationId },
      order: { updatedAt: 'DESC' },
      take: limit,
      relations: { author: true, space: true },
    });
  }

  async getActivity(organizationId: string, limit: number = 20) {
    // Recent pages and comments combined
    const recentPages = await this.pageRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: { author: true, space: true },
    });

    const recentComments = await this.commentRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: { author: true, page: true },
    });

    const activity = [
      ...recentPages.map(p => ({
        type: 'page' as const,
        id: p.id,
        title: p.title,
        user: p.author?.name || 'Unknown',
        space: p.space?.name || '',
        timestamp: p.createdAt,
      })),
      ...recentComments.map(c => ({
        type: 'comment' as const,
        id: c.id,
        title: `Comment on page`,
        content: c.content.substring(0, 100),
        user: c.author?.name || 'Unknown',
        timestamp: c.createdAt,
      })),
    ];

    activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activity.slice(0, limit);
  }
}
