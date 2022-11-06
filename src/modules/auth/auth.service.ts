import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/_prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GenericResponse } from 'src/consts/generic_response';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<GenericResponse<Record<string, string>>> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isCorrectPassword = await argon.verify(user.password, dto.password);
      if (!isCorrectPassword) {
        throw new ForbiddenException('Wrong password or email address');
      }

      const token = await this.signToken(user.id, user.username);

      return {
        data: {
          access_token: token,
        },
        message: 'token is here',
        status: 'ok',
      };
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async register(
    dto: RegisterDto,
  ): Promise<GenericResponse<Record<string, string>>> {
    try {
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          password: hash,
          phone: dto.phone,
        },
        select: {
          username: true,
          createdAt: true,
          id: true,
        },
      });

      console.log('user', user);
      const token = await this.signToken(user.id, user.username);
      return {
        data: {
          access_token: token,
        },
        message: 'token is here',
        status: 'ok',
      };
    } catch (err) {
      console.error(err);
      if (err.code === 'P2002') {
        throw new ForbiddenException('Duplicate User');
      }
      throw err;
    }
  }

  signToken(userId: number, username: string): Promise<string> {
    try {
      const payload = {
        sub: userId,
        username,
      };

      const secret = this.config.get('JWT_SECRET');

      return this.jwt.signAsync(payload, {
        secret: secret,
        expiresIn: '20d',
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
