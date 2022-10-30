import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/_prisma/prisma.service';
import { User } from '@prisma/client';
import { GenericResponse } from 'src/consts/generic_response';
import { Payload } from 'src/types';
import { FollowQuery, UpdateBio } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(
    payload: Payload,
  ): Promise<Omit<GenericResponse, 'data'> & { data: User }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.userId,
        },
        include: {
          Follow: true,
        },
      });

      return {
        data: user,
        message: 'sucess',
        status: 'ok',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async follow(payload: Payload, query: FollowQuery): Promise<GenericResponse> {
    try {
      const following = await this.prisma.follow.create({
        data: {
          leader_id: parseInt(query.leaderId as string),
          follower_id: payload.userId,
        },
      });

      return {
        data: following,
        message: 'Following',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('You are already following this user');
      }
      throw error;
    }
  }

  async unFollow(
    payload: Payload,
    query: FollowQuery,
  ): Promise<GenericResponse> {
    try {
      const following = await this.prisma.follow.findFirst({
        where: {
          follower_id: payload.userId,
          leader_id: parseInt(query.leaderId),
        },
      });

      if (!following) {
        throw new ForbiddenException(
          'You are not following this user to unfollow',
        );
      }

      await this.prisma.follow.deleteMany({
        where: {
          AND: [
            {
              follower_id: payload.userId,
            },
            {
              leader_id: parseInt(query.leaderId),
            },
          ],
        },
      });

      return {
        data: null,
        message: 'Unfollowed Sucessfully',
        status: 'ok',
      };
    } catch (error) {
      throw error;
    }
  }

  async updateBio(
    { userId }: Payload,
    { bio }: UpdateBio,
  ): Promise<Omit<GenericResponse, 'data'> & { data: string }> {
    try {
      const { bio: updatedBio } = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          bio: bio,
        },
        select: {
          bio: true,
        },
      });

      return {
        data: updatedBio,
        message: 'Bio updated!',
        status: 'ok',
      };
    } catch (error) {
      throw error;
    }
  }
}
