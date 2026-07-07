import {
  Controller, Get, Sse, UseGuards, MessageEvent, Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { NotificationsService, WikiNotification } from './notifications.service.js';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List recent notifications' })
  getNotifications(@CurrentUser() user: JwtUser) {
    return [];
  }

  @Sse('stream')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'SSE stream for real-time notifications' })
  stream(@CurrentUser() user: JwtUser): Observable<MessageEvent> {
    return this.notificationsService.getStream(user.orgId).pipe(
      map((notif: WikiNotification) => ({
        type: 'notification',
        data: JSON.stringify(notif),
      }) as MessageEvent),
    );
  }
}
