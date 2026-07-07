import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity.js';
import { User } from '../entities/user.entity.js';
import { Space } from '../entities/space.entity.js';
import { Page } from '../entities/page.entity.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { Comment } from '../entities/comment.entity.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, Space, Page, PageVersion, Comment]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
