import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service.js';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pages, optionally filtered by spaceId' })
  @ApiQuery({ name: 'spaceId', required: false })
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('spaceId') spaceId?: string,
  ) {
    return this.pagesService.findAll(user.orgId, spaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by ID' })
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.pagesService.findOne(user.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreatePageDto) {
    return this.pagesService.create(user.orgId, dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a page (creates a new version)' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(user.orgId, id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page' })
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.pagesService.remove(user.orgId, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a page' })
  getVersions(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.pagesService.getVersions(user.orgId, id);
  }

  @Get(':id/versions/:vid')
  @ApiOperation({ summary: 'Get a specific version' })
  getVersion(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('vid') vid: string,
  ) {
    return this.pagesService.getVersion(user.orgId, id, vid);
  }

  @Post(':id/revert/:vid')
  @ApiOperation({ summary: 'Revert page to a previous version' })
  revertToVersion(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('vid') vid: string,
  ) {
    return this.pagesService.revertToVersion(user.orgId, id, vid, user.id);
  }
}
