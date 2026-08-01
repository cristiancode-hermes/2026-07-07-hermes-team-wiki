import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpacesService } from './spaces.service';
import { Space } from '../entities/space.entity';
import { Page } from '../entities/page.entity';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space.dto';

describe('SpacesService', () => {
  let service: SpacesService;
  let spaceRepo: jest.Mocked<Repository<Space>>;
  let pageRepo: jest.Mocked<Repository<Page>>;

  const mockSpace: Space = {
    id: 'space-1',
    name: 'Engineering',
    description: 'Engineering team space',
    icon: '🔧',
    sortOrder: 0,
    organizationId: 'org-1',
    organization: null as any,
    homePageId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
  };

  const mockPage: Page = {
    id: 'page-1',
    title: 'Welcome to Engineering',
    slug: 'welcome',
    content: '# Welcome\n\nThis space is ready for your content.',
    versionNumber: 1,
    isHomePage: true,
    sortOrder: 0,
    organizationId: 'org-1',
    organization: null as any,
    spaceId: 'space-1',
    space: null as any,
    authorId: null,
    author: null as any,
    parentId: null,
    parent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    versions: [],
    comments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        {
          provide: getRepositoryToken(Space),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Page),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
    spaceRepo = module.get(getRepositoryToken(Space));
    pageRepo = module.get(getRepositoryToken(Page));
  });

  describe('findAll', () => {
    it('should return all spaces with page counts', async () => {
      const spaceWithPages = { ...mockSpace, pages: [mockPage] };
      spaceRepo.find.mockResolvedValue([spaceWithPages]);

      const result = await service.findAll('org-1');

      expect(result).toHaveLength(1);
      expect(result[0].pageCount).toBe(1);
    });

    it('should return empty array when no spaces exist', async () => {
      spaceRepo.find.mockResolvedValue([]);

      const result = await service.findAll('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a space by id', async () => {
      const spaceWithPages = { ...mockSpace, pages: [{ ...mockPage, author: { id: 'user-1' } }] };
      spaceRepo.findOne.mockResolvedValue(spaceWithPages as any);

      const result = await service.findOne('org-1', 'space-1');

      expect(result).toEqual(spaceWithPages);
    });

    it('should throw NotFoundException when space not found', async () => {
      spaceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('org-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateSpaceDto = {
      name: 'Engineering',
      description: 'Engineering team space',
      icon: '🔧',
    };

    it('should create a space with a home page and return it', async () => {
      spaceRepo.save.mockResolvedValue(mockSpace);
      pageRepo.save.mockResolvedValue(mockPage);
      const spaceWithHomePage = {
        ...mockSpace,
        homePageId: 'page-1',
        pages: [],
      };
      spaceRepo.save.mockResolvedValue(spaceWithHomePage);
      spaceRepo.findOne.mockResolvedValue(spaceWithHomePage);

      const result = await service.create('org-1', createDto);

      expect(result).toBeDefined();
      expect(spaceRepo.save).toHaveBeenCalledTimes(2);
      expect(pageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Welcome to Engineering',
          slug: 'welcome',
          isHomePage: true,
        }),
      );
    });

    it('should create space with authorId when provided', async () => {
      spaceRepo.save.mockResolvedValue(mockSpace);
      pageRepo.save.mockResolvedValue(mockPage);
      spaceRepo.save.mockResolvedValue({ ...mockSpace, homePageId: 'page-1' });
      spaceRepo.findOne.mockResolvedValue({ ...mockSpace, homePageId: 'page-1', pages: [] });
      pageRepo.save.mockClear();

      await service.create('org-1', createDto, 'user-1');

      expect(pageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          author: { id: 'user-1' },
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateSpaceDto = { name: 'Updated Engineering' };

    it('should update a space and return updated entity', async () => {
      spaceRepo.findOne.mockResolvedValue(mockSpace);
      spaceRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      const updatedSpace = { ...mockSpace, name: 'Updated Engineering' };
      spaceRepo.findOne.mockResolvedValue(updatedSpace);

      const result = await service.update('org-1', 'space-1', updateDto);

      expect(result.name).toBe('Updated Engineering');
      expect(spaceRepo.update).toHaveBeenCalledWith('space-1', { name: 'Updated Engineering' });
    });
  });

  describe('remove', () => {
    it('should delete a space and return confirmation', async () => {
      spaceRepo.findOne.mockResolvedValue(mockSpace);
      spaceRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.remove('org-1', 'space-1');

      expect(result).toEqual({ deleted: true });
      expect(spaceRepo.delete).toHaveBeenCalledWith('space-1');
    });
  });
});
