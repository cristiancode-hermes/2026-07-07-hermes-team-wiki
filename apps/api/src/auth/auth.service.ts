import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization.entity.js';
import { User } from '../entities/user.entity.js';
import { Space } from '../entities/space.entity.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const org = await this.orgRepo.save({ name: dto.organizationName });
    const user = await this.userRepo.save({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: 'admin',
      organization: { id: org.id },
    });

    // Create default space
    const homePage = { title: 'Welcome', slug: 'welcome', content: '# Welcome\n\nThis is your wiki.', organization: { id: org.id } };
    const space = await this.spaceRepo.save({
      name: 'General',
      organization: { id: org.id },
    });

    const token = this.jwtService.sign({ sub: user.id, orgId: org.id, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      organization: { id: org.id, name: org.name },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: { organization: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status === 'inactive') throw new UnauthorizedException('Account is inactive');

    const token = this.jwtService.sign({ sub: user.id, orgId: user.organizationId, role: user.role });
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      organization: { id: user.organizationId, name: user.organization.name },
      token,
    };
  }

  async getProfile(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: { organization: true },
    });
  }
}
