import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(dto: AuthDto): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      throw new UnauthorizedException('User does already exists', dto.email);
    } else {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          password: await crypto
            .createHmac('sha256', process.env.USER_SALT)
            .update(dto.password)
            .digest('base64'),
        },
      });
    }
  }

  async signin(dto: AuthDto): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User does not exists', dto.email);
    }

    const hashedPassword = await crypto
      .createHmac('sha256', process.env.USER_SALT)
      .update(dto.password)
      .digest('base64');
    dto.password = hashedPassword;

    if (dto.password !== user.password || user.email !== dto.email)
      throw new UnauthorizedException('Password or email does not match');

    const tokens = await this.generateTokens(user);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      tokens,
      user,
    };
  }

  async validateUser(authHeader: any): Promise<any> {
    try {
      const verifiedToken = await this.jwtService.verify(
        authHeader.split(' ')[1],
        { secret: process.env.JWT_SECRET },
      );

      const userId = verifiedToken.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return verifiedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const { sub } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: sub,
        },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: tokens.refreshToken,
        },
      });

      return tokens;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserRefreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.refreshToken;
  }

  private async generateTokens(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(
        user.id.toString(),
        process.env.JWT_ACCESS_TOKEN_TTL ?? '60s',
      ),
      this.signToken(
        user.id.toString(),
        process.env.JWT_REFRESH_TOKEN_TTL ?? '60000s',
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken(userId: string, expiresIn: string, payload?: any) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn,
      },
    );
  }
}
