import { NotFoundException, Injectable } from '@nestjs/common';
import { Post, User } from '@prisma/client';
import { static_file_base_url } from 'src/consts/constants';
import { GenericResponse } from 'src/consts/generic_response';
import { Payload } from 'src/types';
import { PrismaService } from '../_prisma/prisma.service';
import { PostDto, PostQuery } from './dto';
import { FeedQuery } from './interfaces';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(
    body: PostDto,
    file: Express.Multer.File,
  ): Promise<GenericResponse<Post>> {
    try {
      body.creatorId = parseInt(body.creatorId as string);
      const post = await this.prisma.post.create({
        data: {
          image: `${static_file_base_url}${file.filename}`,
          location: body.location,
          caption: body.caption,
          creatorId: body.creatorId,
        },
      });
      return {
        data: post,
        message: 'post created',
        status: 'ok',
      };
    } catch (error) {
      throw error;
    }
  }

  async getPost({ postId }: PostQuery): Promise<GenericResponse<Post>> {
    try {
      const raw_post = await this.prisma.post.findFirst({
        where: {
          id: parseInt(postId),
        },
        include: {
          Like: true,
          Comment: true,
          creator: {
            select: {
              avatar: true,
              username: true,
              verified: true,
            },
          },
        },
      });

      if (!raw_post) {
        throw new NotFoundException('Post not found');
      }

      const { Comment, Like, ...rest } = raw_post;

      const post = {
        ...rest,
        comments: Comment.length,
        likes: Like.length,
      };

      return {
        data: post,
        message: 'got the post',
        status: 'ok',
      };
    } catch (error) {
      throw error;
    }
  }

  async feed(query: FeedQuery): Promise<GenericResponse<Array<Post>>> {
    try {
      //pagination
      const limit = 20;
      const skip = (query.page - 1) * 20;
      const raw_posts = await this.prisma.post.findMany({
        where: {},
        include: {
          Like: true,
          Comment: true,
          creator: {
            select: {
              avatar: true,
              username: true,
              verified: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        skip: skip,
        take: limit,
      });

      if (raw_posts.length < 1) {
        throw new NotFoundException('End of the feed');
      }

      let posts: Array<Post & { comments: number; likes: number }> = [];

      for (const raw_post of raw_posts) {
        const { Comment, Like, ...rest } = raw_post;

        posts.push({
          ...rest,
          comments: Comment.length,
          likes: Like.length,
        });
      }

      return {
        data: posts,
        message: 'here is the feed',
        status: 'ok',
      };
    } catch (error) {
      throw error;
    }
  }

  async like(postId: string, user: Payload): Promise<GenericResponse<null>> {
    try {
      const post = await this.prisma.post.findFirst({
        where: {
          id: parseInt(postId),
        },
      });

      if (!post) {
        return {
          data: null,
          message: 'post not found',
          status: 'error',
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
