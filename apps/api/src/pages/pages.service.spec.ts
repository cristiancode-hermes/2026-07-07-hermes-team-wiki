import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PagesService } from './pages.service';
import { Page } from '../entities/page.entity';
import { PageVersion } from '../entities/page-version.entity';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

describe('PagesService', () => {
  let service: PagesService;
  let pageRepo: jest.Mocked<Repository<Page>>;
  let versionRepo: jest.Mocked<Repository<PageVersion>>;

  const mockPage: Page = {
    id: 'page-1',
    title: 'Getting Started',
    slug: 'getting-started',
    content: '# Welcome',
    versionNumber: 1,
    isHomePage: false,
    sortOrder: 0,
    organizationId: 'org-1',
    organization: null as any,
    spaceId: 'space-1',
    space: null as any,
    authorId: 'user-1',
    author: null as any,
    parentId: null,
    parent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    versions: [],
    comments: [],
  };

  const mockVersion: PageVersion = {
    id: 'ver-1',
    versionNumber: 1,
    title: 'Getting Started',
    content: '# Welcome',
    summary: null,
    changeStats: '+0/-0',
    pageId: 'page-1',
    page: null as any,
    authorId: 'user-1',
    author: null as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        {
          provide: getRepositoryToken(Page),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PageVersion),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    pageRepo = module.get(getRepositoryToken(Page));
    versionRepo = module.get(getRepositoryToken(PageVersion));
  });

  describe('findAll', () => {
    it('should return all pages for an organization', async () => {
      pageRepo.find.mockResolvedValue([mockPage]);

      const result = await service.findAll('org-1');

      expect(result).toHaveLength(1);
      expect(pageRepo.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        order: { sortOrder: 'ASC', updatedAt: 'DESC' },
        relations: { author: true, space: true, parent: true },
      });
    });

    it('should filter by spaceId when provided', async () => {
      pageRepo.find.mockResolvedValue([mockPage]);

      await service.findAll('org-1', 'space-1');

      expect(pageRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1', spaceId: 'space-1' },
        }),
      );
    });

    it('should return empty array when no pages exist', async () => {
      pageRepo.find.mockResolvedValue([]);

      const result = await service.findAll('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a page by id', async () => {
      const pageWithRelations = {
        ...mockPage,
        author: { id: 'user-1', name: 'Ana' },
        space: { id: 'space-1', name: 'General' },
      } as any;
      pageRepo.findOne.mockResolvedValue(pageWithRelations);

      const result = await service.findOne('org-1', 'page-1');

      expect(result).toEqual(pageWithRelations);
    });

    it('should throw NotFoundException when page not found', async () => {
      pageRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('org-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a page by slug', async () => {
      const pageWithRelations = { ...mockPage, author: { id: 'user-1' }, space: { id: 'space-1' } } as any;
      pageRepo.findOne.mockResolvedValue(pageWithRelations);

      const result = await service.findBySlug('org-1', 'getting-started');

      expect(result).toEqual(pageWithRelations);
    });

    it('should include spaceId in query when provided', async () => {
      pageRepo.findOne.mockResolvedValue(mockPage);

      await service.findBySlug('org-1', 'getting-started', 'space-1');

      expect(pageRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1', slug: 'getting-started', spaceId: 'space-1' },
        }),
      );
    });
  });

  describe('create', () => {
    const createDto: CreatePageDto = {
      title: 'New Page',
      slug: 'new-page',
      content: '# Content',
      spaceId: 'space-1',
    };

    it('should create a page and its initial version', async () => {
      pageRepo.save.mockResolvedValue(mockPage);
      pageRepo.findOne.mockResolvedValue(mockPage);
      versionRepo.save.mockResolvedValue(mockVersion);

      const result = await service.create('org-1', createDto, 'user-1');

      expect(result).toBeDefined();
      expect(pageRepo.save).toHaveBeenCalled();
      expect(versionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          versionNumber: 1,
          page: { id: 'page-1' },
        }),
      );
    });

    it('should create page with parent when parentId is provided', async () => {
      const dtoWithParent: CreatePageDto = { ...createDto, parentId: 'parent-1' };
      pageRepo.save.mockResolvedValue(mockPage);
      pageRepo.findOne.mockResolvedValue(mockPage);
      versionRepo.save.mockResolvedValue(mockVersion);

      await service.create('org-1', dtoWithParent, 'user-1');

      expect(pageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: { id: 'parent-1' },
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdatePageDto = {
      title: 'Updated Title',
      content: '# Updated content',
    };

    it('should save current version and update the page', async () => {
      pageRepo.findOne
        .mockResolvedValueOnce(mockPage) // first call: fetch current page (v1)
        .mockResolvedValueOnce({ ...mockPage, title: 'Updated Title', versionNumber: 2 } as any); // second call: return updated page
      versionRepo.save.mockResolvedValue(mockVersion);
      pageRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.update('org-1', 'page-1', updateDto, 'user-1');

      expect(result.title).toBe('Updated Title');
      expect(versionRepo.save).toHaveBeenCalled();
      expect(pageRepo.update).toHaveBeenCalledWith('page-1',
        expect.objectContaining({
          versionNumber: 2,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a page and return confirmation', async () => {
      pageRepo.findOne.mockResolvedValue(mockPage);
      pageRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.remove('org-1', 'page-1');

      expect(result).toEqual({ deleted: true });
      expect(pageRepo.delete).toHaveBeenCalledWith('page-1');
    });
  });

  describe('getVersions', () => {
    it('should return versions in descending order', async () => {
      pageRepo.findOne.mockResolvedValue(mockPage);
      versionRepo.find.mockResolvedValue([mockVersion, { ...mockVersion, id: 'ver-2', versionNumber: 2 }]);

      const result = await service.getVersions('org-1', 'page-1');

      expect(result).toHaveLength(2);
      expect(versionRepo.find).toHaveBeenCalledWith({
        where: { pageId: 'page-1' },
        order: { versionNumber: 'DESC' },
        relations: { author: true },
      });
    });
  });

  describe('revertToVersion', () => {
    it('should save current version and restore target version content', async () => {
      const targetVersion: PageVersion = {
        ...mockVersion,
        versionNumber: 1,
        title: 'Original Title',
        content: '# Original content',
      };
      pageRepo.findOne
        .mockResolvedValueOnce(mockPage) // first: fetch page to revert
        .mockResolvedValueOnce({ ...mockPage, title: 'Original Title', content: '# Original content', versionNumber: 2 } as any); // second: return reverted page
      versionRepo.findOne.mockResolvedValue(targetVersion);
      versionRepo.save.mockResolvedValue(mockVersion);
      pageRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.revertToVersion('org-1', 'page-1', 'ver-1', 'user-1');

      expect(result.title).toBe('Original Title');
      expect(result.versionNumber).toBe(2);
      expect(versionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: 'Auto-saved before revert to v1',
        }),
      );
      expect(pageRepo.update).toHaveBeenCalledWith('page-1',
        expect.objectContaining({
          title: 'Original Title',
          versionNumber: 2,
        }),
      );
    });

    it('should throw NotFoundException if version not found', async () => {
      pageRepo.findOne.mockResolvedValue(mockPage);
      versionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.revertToVersion('org-1', 'page-1', 'nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
