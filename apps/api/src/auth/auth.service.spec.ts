import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Space } from '../entities/space.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

// Mock bcryptjs at module level so all tests can use it
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let orgRepo: jest.Mocked<Repository<Organization>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let spaceRepo: jest.Mocked<Repository<Space>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockOrg: Organization = {
    id: 'org-1',
    name: 'Acme Corp',
    slug: null,
    logoUrl: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
    spaces: [],
    pages: [],
    comments: [],
  };

  const mockUser: User = {
    id: 'user-1',
    name: 'Ana Silva',
    email: 'ana@acme.com',
    passwordHash: 'hashed-password',
    role: 'admin',
    avatarUrl: null,
    status: 'active',
    organizationId: 'org-1',
    organization: mockOrg,
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
    versions: [],
    comments: [],
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Space),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    orgRepo = module.get(getRepositoryToken(Organization));
    userRepo = module.get(getRepositoryToken(User));
    spaceRepo = module.get(getRepositoryToken(Space));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Ana Silva',
      email: 'ana@acme.com',
      password: 'secure123',
      organizationName: 'Acme Corp',
    };

    it('should register a new user with organization and default space', async () => {
      userRepo.findOne.mockResolvedValue(null);
      orgRepo.save.mockResolvedValue(mockOrg);
      userRepo.save.mockResolvedValue(mockUser);
      spaceRepo.save.mockResolvedValue({
        id: 'space-1',
        name: 'General',
        description: null,
        icon: '📁',
        sortOrder: 0,
        organizationId: 'org-1',
        organization: mockOrg,
        homePageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        pages: [],
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('ana@acme.com');
      expect(result.organization.name).toBe('Acme Corp');
      expect(orgRepo.save).toHaveBeenCalledWith({ name: 'Acme Corp' });
      expect(userRepo.save).toHaveBeenCalled();
      expect(spaceRepo.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(orgRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'ana@acme.com',
      password: 'secure123',
    };

    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockReset();
    });

    it('should login successfully with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const userWithOrg = { ...mockUser, organization: mockOrg };
      userRepo.findOne.mockResolvedValue(userWithOrg);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user.email).toBe('ana@acme.com');
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: { organization: true },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const userWithOrg = { ...mockUser, organization: mockOrg };
      userRepo.findOne.mockResolvedValue(userWithOrg);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const inactiveUser = {
        ...mockUser,
        status: 'inactive' as const,
        organization: mockOrg,
      };
      userRepo.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is inactive',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile with organization', async () => {
      const userWithOrg = { ...mockUser, organization: mockOrg };
      userRepo.findOne.mockResolvedValue(userWithOrg);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(userWithOrg);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: { organization: true },
      });
    });

    it('should return null if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.getProfile('nonexistent');

      expect(result).toBeNull();
    });
  });
});
