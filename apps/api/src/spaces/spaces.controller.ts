import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SpacesService } from './spaces.service.js';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space.dto.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Spaces')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  @ApiOperation({ summary: 'List all spaces with page counts' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.spacesService.findAll(user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a space by ID' })
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.spacesService.findOne(user.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new space (creates a home page)' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateSpaceDto) {
    return this.spacesService.create(user.orgId, dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a space' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(user.orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a space' })
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.spacesService.remove(user.orgId, id);
  }
}
