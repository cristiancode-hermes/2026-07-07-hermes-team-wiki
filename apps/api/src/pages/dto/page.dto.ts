import { IsString, IsOptional, MinLength, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Getting Started' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'getting-started' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiPropertyOptional({ example: '# Getting Started\n\nWelcome to the wiki.' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'uuid-of-space' })
  @IsString()
  spaceId: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHomePage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdatePageDto {
  @ApiPropertyOptional({ example: 'Getting Started' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'getting-started' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '# Updated content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHomePage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
