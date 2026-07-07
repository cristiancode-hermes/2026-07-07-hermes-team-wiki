import {
  Controller, Get, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrgService } from './org.service.js';
import { UpdateMemberRoleDto } from './dto/org.dto.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get('members')
  @ApiOperation({ summary: 'List organization members' })
  getMembers(@CurrentUser() user: JwtUser) {
    return this.orgService.getMembers(user.orgId);
  }

  @Put('members/:userId')
  @ApiOperation({ summary: 'Update member role (admin only)' })
  updateMemberRole(
    @CurrentUser() user: JwtUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.orgService.updateMemberRole(user.orgId, userId, dto, user.id);
  }

  @Delete('members/:userId')
  @ApiOperation({ summary: 'Remove member (admin only)' })
  removeMember(
    @CurrentUser() user: JwtUser,
    @Param('userId') userId: string,
  ) {
    return this.orgService.removeMember(user.orgId, userId, user.id);
  }
}
