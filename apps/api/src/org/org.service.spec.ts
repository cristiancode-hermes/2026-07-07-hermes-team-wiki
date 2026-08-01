import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrgService } from './org.service';
import { User } from '../entities/user.entity';
import { UpdateMemberRoleDto } from './dto/org.dto';

describe('OrgService', () => {
  let service: OrgService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockAdminUser: User = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@acme.com',
    passwordHash: 'hash',
    role: 'admin',
    avatarUrl: null,
    status: 'active',
    organizationId: 'org-1',
    organization: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
    versions: [],
    comments: [],
  };

  const mockEditorUser: User = {
    id: 'editor-1',
    name: 'Editor',
    email: 'editor@acme.com',
    passwordHash: 'hash',
    role: 'editor',
    avatarUrl: null,
    status: 'active',
    organizationId: 'org-1',
    organization: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
    versions: [],
    comments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrgService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrgService>(OrgService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('getMembers', () => {
    it('should return all members for an organization', async () => {
      userRepo.find.mockResolvedValue([mockAdminUser, mockEditorUser]);

      const result = await service.getMembers('org-1');

      expect(result).toHaveLength(2);
      expect(userRepo.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('updateMemberRole', () => {
    const updateDto: UpdateMemberRoleDto = { role: 'editor' };

    it('should update member role when requester is admin', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser); // requester
      userRepo.findOne.mockResolvedValueOnce(mockEditorUser); // target
      userRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      userRepo.findOne.mockResolvedValue({ ...mockEditorUser, role: 'editor' });

      const result = await service.updateMemberRole('org-1', 'editor-1', updateDto, 'admin-1');

      expect(result).toBeDefined();
      expect(userRepo.update).toHaveBeenCalledWith('editor-1', { role: 'editor' });
    });

    it('should throw ForbiddenException if requester is not admin', async () => {
      userRepo.findOne.mockResolvedValue(mockEditorUser); // requester is editor

      await expect(
        service.updateMemberRole('org-1', 'editor-1', updateDto, 'editor-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if target member not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser); // requester
      userRepo.findOne.mockResolvedValueOnce(null); // target

      await expect(
        service.updateMemberRole('org-1', 'nonexistent', updateDto, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if admin tries to change own role', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser); // requester is admin
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser); // target is self

      await expect(
        service.updateMemberRole('org-1', 'admin-1', updateDto, 'admin-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member when requester is admin', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser);
      userRepo.findOne.mockResolvedValueOnce(mockEditorUser);
      userRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.removeMember('org-1', 'editor-1', 'admin-1');

      expect(result).toEqual({ deleted: true });
    });

    it('should throw ForbiddenException if requester is not admin', async () => {
      userRepo.findOne.mockResolvedValue(mockEditorUser);

      await expect(
        service.removeMember('org-1', 'editor-1', 'editor-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if member not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser);
      userRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.removeMember('org-1', 'nonexistent', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if admin tries to remove self', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser);
      userRepo.findOne.mockResolvedValueOnce(mockAdminUser);

      await expect(
        service.removeMember('org-1', 'admin-1', 'admin-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
