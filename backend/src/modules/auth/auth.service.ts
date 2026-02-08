import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { RegisterDto, LoginDto, AuthResponseDto, TokensResponseDto } from './dto';
import { Role, EnterpriseStatus } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly enterpriseService: EnterpriseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let enterpriseId: string | null = null;

    // Create enterprise if enterprise name is provided
    if (dto.enterpriseName) {
      const enterprise = await this.enterpriseService.create({
        name: dto.enterpriseName,
        taxId: dto.taxId || '',
        country: dto.country || 'Tunisia',
        status: EnterpriseStatus.PENDING,
        ownerId: '', // Will be updated after user creation
      });
      enterpriseId = enterprise.id;
    }

    // Create user
    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Role.BUSINESS_OWNER,
      enterpriseId,
      avatar: `https://ui-avatars.com/api/?name=${dto.firstName}+${dto.lastName}&background=random`,
    });

    // Update enterprise owner
    if (enterpriseId) {
      await this.enterpriseService.update(enterpriseId, { ownerId: user.id });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.enterpriseId);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.enterpriseId);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        enterpriseId: user.enterpriseId,
        avatar: user.avatar,
      },
      tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensResponseDto> {
    const isValid = await this.userService.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findById(userId);
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.enterpriseId);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, null);
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      enterpriseId: user.enterpriseId,
      avatar: user.avatar,
      enterprise: user.enterprise,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
    enterpriseId?: string | null
  ): Promise<TokensResponseDto> {
    const payload = {
      sub: userId,
      email,
      role,
      enterpriseId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
