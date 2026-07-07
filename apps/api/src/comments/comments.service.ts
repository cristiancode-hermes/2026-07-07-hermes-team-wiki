import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity.js';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async findByPage(organizationId: string, pageId: string) {
    return this.commentRepo.find({
      where: { organizationId, pageId },
      order: { createdAt: 'ASC' },
      relations: { author: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const comment = await this.commentRepo.findOne({
      where: { id, organizationId },
      relations: { author: true, page: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(organizationId: string, pageId: string, dto: CreateCommentDto, authorId: string) {
    return this.commentRepo.save({
      content: dto.content,
      organization: { id: organizationId },
      page: { id: pageId },
      author: { id: authorId },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(organizationId, id);

    // 5-minute edit window
    const fiveMinutes = 5 * 60 * 1000;
    const elapsed = Date.now() - comment.createdAt.getTime();
    if (elapsed > fiveMinutes) {
      throw new ForbiddenException('Comments can only be edited within 5 minutes');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    await this.commentRepo.update(id, {
      content: dto.content,
      isEdited: true,
    });

    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string, userId: string) {
    const comment = await this.findOne(organizationId, id);

    // 5-minute delete window
    const fiveMinutes = 5 * 60 * 1000;
    const elapsed = Date.now() - comment.createdAt.getTime();
    if (elapsed > fiveMinutes) {
      throw new ForbiddenException('Comments can only be deleted within 5 minutes');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.delete(id);
    return { deleted: true };
  }
}
