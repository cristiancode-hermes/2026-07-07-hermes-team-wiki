import { IsString, IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'ana@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2)
  organizationName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ana@acme.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure123' })
  @IsString()
  password: string;
}
