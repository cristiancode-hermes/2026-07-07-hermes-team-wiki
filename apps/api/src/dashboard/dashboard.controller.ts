import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getStats(user.orgId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently updated pages' })
  @ApiQuery({ name: 'limit', required: false })
  getRecent(@CurrentUser() user: JwtUser, @Query('limit') limit?: number) {
    return this.dashboardService.getRecent(user.orgId, limit || 10);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiQuery({ name: 'limit', required: false })
  getActivity(@CurrentUser() user: JwtUser, @Query('limit') limit?: number) {
    return this.dashboardService.getActivity(user.orgId, limit || 20);
  }
}
