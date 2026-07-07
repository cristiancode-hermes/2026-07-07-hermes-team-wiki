import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity.js';
import { Page } from '../entities/page.entity.js';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space.dto.js';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async findAll(organizationId: string) {
    const spaces = await this.spaceRepo.find({
      where: { organizationId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { pages: true },
    });
    return spaces.map(s => ({
      ...s,
      pageCount: s.pages?.length || 0,
    }));
  }

  async findOne(organizationId: string, id: string) {
    const space = await this.spaceRepo.findOne({
      where: { id, organizationId },
      relations: { pages: { author: true } },
    });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  async create(organizationId: string, dto: CreateSpaceDto, authorId?: string) {
    const space = await this.spaceRepo.save({
      ...dto,
      organization: { id: organizationId },
    });

    // Create home page for the space
    const homePage = await this.pageRepo.save({
      title: `Welcome to ${dto.name}`,
      slug: 'welcome',
      content: `# Welcome to ${dto.name}\n\nThis space is ready for your content.`,
      isHomePage: true,
      organization: { id: organizationId },
      space: { id: space.id },
      author: authorId ? { id: authorId } : undefined,
    });

    // Update space with homePageId
    space.homePageId = homePage.id;
    await this.spaceRepo.save(space);

    return this.findOne(organizationId, space.id);
  }

  async update(organizationId: string, id: string, dto: UpdateSpaceDto) {
    const space = await this.findOne(organizationId, id);
    await this.spaceRepo.update(id, { ...dto });
    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string) {
    const space = await this.findOne(organizationId, id);
    await this.spaceRepo.delete(id);
    return { deleted: true };
  }
}
