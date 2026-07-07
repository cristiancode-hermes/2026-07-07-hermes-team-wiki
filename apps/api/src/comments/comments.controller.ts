import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('api/pages/:pageId/comments')
  @ApiOperation({ summary: 'Get all comments for a page' })
  findByPage(@CurrentUser() user: JwtUser, @Param('pageId') pageId: string) {
    return this.commentsService.findByPage(user.orgId, pageId);
  }

  @Post('api/pages/:pageId/comments')
  @ApiOperation({ summary: 'Create a comment on a page' })
  create(
    @CurrentUser() user: JwtUser,
    @Param('pageId') pageId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.orgId, pageId, dto, user.id);
  }

  @Put('api/comments/:id')
  @ApiOperation({ summary: 'Update a comment (5 min edit window)' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(user.orgId, id, dto, user.id);
  }

  @Delete('api/comments/:id')
  @ApiOperation({ summary: 'Delete a comment (5 min delete window)' })
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.commentsService.remove(user.orgId, id, user.id);
  }
}
