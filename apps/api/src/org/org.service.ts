import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { UpdateMemberRoleDto } from './dto/org.dto.js';

@Injectable()
export class OrgService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getMembers(organizationId: string) {
    return this.userRepo.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateMemberRole(organizationId: string, userId: string, dto: UpdateMemberRoleDto, requesterId: string) {
    const requester = await this.userRepo.findOne({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can change roles');
    }

    const user = await this.userRepo.findOne({ where: { id: userId, organizationId } });
    if (!user) throw new NotFoundException('Member not found');

    if (user.id === requesterId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    await this.userRepo.update(userId, { role: dto.role });
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async removeMember(organizationId: string, userId: string, requesterId: string) {
    const requester = await this.userRepo.findOne({ where: { id: requesterId } });
    if (!requester || requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can remove members');
    }

    const user = await this.userRepo.findOne({ where: { id: userId, organizationId } });
    if (!user) throw new NotFoundException('Member not found');

    if (user.id === requesterId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    await this.userRepo.delete(userId);
    return { deleted: true };
  }
}
