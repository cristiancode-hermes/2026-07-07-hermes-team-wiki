import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Fts5Service } from '../common/fts5.service.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/search')
export class SearchController {
  constructor(private readonly fts5Service: Fts5Service) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search pages' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'spaceId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @CurrentUser() user: JwtUser,
    @Query('q') q: string,
    @Query('spaceId') spaceId?: string,
    @Query('limit') limit?: number,
  ) {
    const results = await this.fts5Service.search(q || '', limit || 10, spaceId);
    // Filter by organization
    return results.filter(r => r.organizationId === user.orgId);
  }
}
