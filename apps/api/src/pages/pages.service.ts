import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto.js';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageVersion)
    private readonly versionRepo: Repository<PageVersion>,
  ) {}

  async findAll(organizationId: string, spaceId?: string) {
    const where: any = { organizationId };
    if (spaceId) where.spaceId = spaceId;
    return this.pageRepo.find({
      where,
      order: { sortOrder: 'ASC', updatedAt: 'DESC' },
      relations: { author: true, space: true, parent: true },
    });
  }

  async findOne(organizationId: string, id: string) {
    const page = await this.pageRepo.findOne({
      where: { id, organizationId },
      relations: { author: true, space: true, parent: true, children: { author: true } },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findBySlug(organizationId: string, slug: string, spaceId?: string) {
    const where: any = { organizationId, slug };
    if (spaceId) where.spaceId = spaceId;
    const page = await this.pageRepo.findOne({
      where,
      relations: { author: true, space: true, parent: true, children: { author: true } },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(organizationId: string, dto: CreatePageDto, authorId: string) {
    const page = await this.pageRepo.save({
      title: dto.title,
      slug: dto.slug,
      content: dto.content || '',
      isHomePage: dto.isHomePage || false,
      sortOrder: dto.sortOrder || 0,
      organization: { id: organizationId },
      space: { id: dto.spaceId },
      author: { id: authorId },
      parent: dto.parentId ? { id: dto.parentId } : undefined,
    });

    // Create initial version
    await this.versionRepo.save({
      versionNumber: 1,
      title: page.title,
      content: page.content,
      page: { id: page.id },
      author: { id: authorId },
    });

    return this.findOne(organizationId, page.id);
  }

  async update(organizationId: string, id: string, dto: UpdatePageDto, userId: string) {
    const page = await this.findOne(organizationId, id);

    // Save current version before updating
    await this.versionRepo.save({
      versionNumber: page.versionNumber,
      title: page.title,
      content: page.content,
      page: { id: page.id },
      author: { id: userId },
    });

    const updateData: any = { ...dto };
    if (dto.parentId) updateData.parent = { id: dto.parentId };
    else if (dto.parentId === null) updateData.parent = null;
    if (dto.title) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.slug) updateData.slug = dto.slug;

    await this.pageRepo.update(id, {
      ...dto,
      versionNumber: page.versionNumber + 1,
      parent: dto.parentId ? { id: dto.parentId } : undefined,
    });

    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string) {
    const page = await this.findOne(organizationId, id);
    await this.pageRepo.delete(id);
    return { deleted: true };
  }

  async getVersions(organizationId: string, pageId: string) {
    const page = await this.findOne(organizationId, pageId);
    return this.versionRepo.find({
      where: { pageId: page.id },
      order: { versionNumber: 'DESC' },
      relations: { author: true },
    });
  }

  async getVersion(organizationId: string, pageId: string, versionId: string) {
    const page = await this.findOne(organizationId, pageId);
    const version = await this.versionRepo.findOne({
      where: { id: versionId, pageId: page.id },
      relations: { author: true },
    });
    if (!version) throw new NotFoundException('Version not found');
    return version;
  }

  async revertToVersion(organizationId: string, pageId: string, versionId: string, userId: string) {
    const page = await this.findOne(organizationId, pageId);
    const version = await this.versionRepo.findOne({
      where: { id: versionId, pageId: page.id },
    });
    if (!version) throw new NotFoundException('Version not found');

    // Save current as version
    await this.versionRepo.save({
      versionNumber: page.versionNumber,
      title: page.title,
      content: page.content,
      summary: `Auto-saved before revert to v${version.versionNumber}`,
      page: { id: page.id },
      author: { id: userId },
    });

    // Restore version content
    await this.pageRepo.update(page.id, {
      title: version.title,
      content: version.content,
      versionNumber: page.versionNumber + 1,
    });

    return this.findOne(organizationId, pageId);
  }
}
