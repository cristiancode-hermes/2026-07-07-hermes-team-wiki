import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: jest.Mocked<Repository<Comment>>;

  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Great page!',
    isEdited: false,
    organizationId: 'org-1',
    organization: null as any,
    pageId: 'page-1',
    page: null as any,
    authorId: 'user-1',
    author: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get(getRepositoryToken(Comment));
  });

  describe('findByPage', () => {
    it('should return comments for a page ordered by createdAt ASC', async () => {
      commentRepo.find.mockResolvedValue([mockComment]);

      const result = await service.findByPage('org-1', 'page-1');

      expect(result).toHaveLength(1);
      expect(commentRepo.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', pageId: 'page-1' },
        order: { createdAt: 'ASC' },
        relations: { author: true },
      });
    });

    it('should return empty array when no comments', async () => {
      commentRepo.find.mockResolvedValue([]);

      const result = await service.findByPage('org-1', 'page-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const commentWithRelations = {
        ...mockComment,
        author: { id: 'user-1', name: 'Ana' },
        page: { id: 'page-1', title: 'Test' },
      } as any;
      commentRepo.findOne.mockResolvedValue(commentWithRelations);

      const result = await service.findOne('org-1', 'comment-1');

      expect(result).toEqual(commentWithRelations);
    });

    it('should throw NotFoundException when comment not found', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('org-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateCommentDto = { content: 'Great page!' };

    it('should create a new comment', async () => {
      commentRepo.save.mockResolvedValue(mockComment);

      const result = await service.create('org-1', 'page-1', createDto, 'user-1');

      expect(result).toBeDefined();
      expect(commentRepo.save).toHaveBeenCalledWith({
        content: 'Great page!',
        organization: { id: 'org-1' },
        page: { id: 'page-1' },
        author: { id: 'user-1' },
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateCommentDto = { content: 'Updated comment' };

    it('should update comment within 5-minute window', async () => {
      const recentComment = { ...mockComment, createdAt: new Date() };
      commentRepo.findOne.mockResolvedValue(recentComment);
      commentRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      commentRepo.findOne.mockResolvedValue({ ...recentComment, content: 'Updated comment', isEdited: true } as any);

      const result = await service.update('org-1', 'comment-1', updateDto, 'user-1');

      expect(result.content).toBe('Updated comment');
      expect(commentRepo.update).toHaveBeenCalledWith('comment-1', {
        content: 'Updated comment',
        isEdited: true,
      });
    });

    it('should throw ForbiddenException if edit window expired (>5 min)', async () => {
      const oldComment = {
        ...mockComment,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };
      commentRepo.findOne.mockResolvedValue(oldComment);

      await expect(
        service.update('org-1', 'comment-1', updateDto, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if not the comment author', async () => {
      const recentComment = {
        ...mockComment,
        authorId: 'user-2',
        createdAt: new Date(),
      };
      commentRepo.findOne.mockResolvedValue(recentComment);

      await expect(
        service.update('org-1', 'comment-1', updateDto, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete comment within 5-minute window by author', async () => {
      const recentComment = { ...mockComment, createdAt: new Date() };
      commentRepo.findOne.mockResolvedValue(recentComment);
      commentRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.remove('org-1', 'comment-1', 'user-1');

      expect(result).toEqual({ deleted: true });
    });

    it('should throw ForbiddenException if delete window expired', async () => {
      const oldComment = {
        ...mockComment,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      };
      commentRepo.findOne.mockResolvedValue(oldComment);

      await expect(
        service.remove('org-1', 'comment-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if not the comment author', async () => {
      const recentComment = {
        ...mockComment,
        authorId: 'user-2',
        createdAt: new Date(),
      };
      commentRepo.findOne.mockResolvedValue(recentComment);

      await expect(
        service.remove('org-1', 'comment-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
