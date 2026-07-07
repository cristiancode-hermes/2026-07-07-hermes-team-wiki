import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity.js';
import { User } from '../entities/user.entity.js';
import { Space } from '../entities/space.entity.js';
import { Page } from '../entities/page.entity.js';
import { PageVersion } from '../entities/page-version.entity.js';
import { Comment } from '../entities/comment.entity.js';
import { Fts5Service } from './fts5.service.js';

const entities = [Organization, User, Space, Page, PageVersion, Comment];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [Fts5Service],
  exports: [TypeOrmModule.forFeature(entities), Fts5Service],
})
export class CommonModule {}
