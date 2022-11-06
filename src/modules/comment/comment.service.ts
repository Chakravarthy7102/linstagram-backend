import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Comment, CommentLike } from '@prisma/client';
import { GenericResponse } from 'src/consts/generic_response';
import { CommonConnectionOptions } from 'tls';
import { PrismaService } from '../_prisma/prisma.service';

export interface CommentBody {
  postId: number;
  comment: string;
  commenter_id: number;
}

export interface DeleteCommentBody extends CommentBody {
  comment_id: number;
}

type _Comment = Comment & {
  Reply:
    | {
        comment: Comment;
      }[]
    | number;
  CommentLike: CommentLike[] | number;
  commenter: {
    avatar: string;
    username: string;
    verified: boolean;
  };
};

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  public async comment(
    commentBody: CommentBody,
  ): Promise<GenericResponse<Comment>> {
    try {
      console.log(commentBody);
      const { comment, commenter_id, postId } = commentBody;
      //find the post to like
      const post = await this.prisma.post.findFirst({
        where: {
          id: postId,
        },
        select: {
          id: true,
        },
      });

      if (!post) {
        //if there is no post with given id then throw error!
        throw new ConflictException({
          message: 'Post not found',
        });
      }

      //else create a new commnet for given post!
      const new_comment = await this.prisma.comment.create({
        data: {
          content: comment,
          commenter_id: commenter_id,
          postId: postId,
        },
      });

      return {
        data: new_comment,
        message: 'comment created!',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      throw new InternalServerErrorException({
        message: 'something went wrong!',
      });
    }
  }

  public async delete_comment(
    commentBody: DeleteCommentBody,
    userId: number,
  ): Promise<GenericResponse<Comment>> {
    try {
      console.log(commentBody);
      const { comment_id, postId } = commentBody;
      //find the comment to like
      const comment = await this.prisma.comment.findFirst({
        where: {
          id: comment_id,
          postId: postId,
        },
        select: {
          id: true,
          commenter_id: true,
        },
      });

      if (!comment || comment.commenter_id !== userId) {
        //if there is no commnet with given id then throw error!
        throw new ForbiddenException({
          message: 'Comment not found',
        });
      }

      //else delete commnet!
      await this.prisma.comment.delete({
        where: {
          id: comment_id,
        },
      });

      return {
        data: null,
        message: 'comment deleted!',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      throw error;
    }
  }

  public async post_comments(
    postId: string,
  ): Promise<GenericResponse<Array<Comment>>> {
    try {
      //find the comment to like
      const comment = await this.prisma.post.findUnique({
        where: {
          id: parseInt(postId),
        },
        select: {
          id: true,
        },
      });

      if (!comment) {
        //if there is no commnet with given id then throw error!
        throw new ForbiddenException({
          message: 'Comment not found',
        });
      }

      //else delete comment!
      const _comments = await this.prisma.comment.findMany({
        where: {
          postId: parseInt(postId),
        },
        include: {
          Reply: {
            select: {
              comment: true,
            },
          },
          CommentLike: true,
          commenter: {
            select: {
              avatar: true,
              username: true,
              verified: true,
            },
          },
        },
      });

      const comments = _comments.map((comment: _Comment) => {
        //conditional type checking
        if (comment.CommentLike instanceof Array) {
          comment.CommentLike = comment.CommentLike.length;
        }

        if (comment.Reply instanceof Array) {
          comment.Reply = comment.Reply.length;
        }

        return comment;
      });

      return {
        data: comments,
        message: 'commentss!',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      throw error;
    }
  }

  public async like_comment(
    userId: number,
    comment_id: number,
  ): Promise<GenericResponse<null>> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: comment_id,
        },
        select: {
          id: true,
        },
      });

      if (!comment) {
        throw new ForbiddenException({
          message: 'Comment not found',
        });
      }

      await this.prisma.commentLike.create({
        data: {
          comment_id: comment_id,
          commented_by_id: userId,
        },
      });

      return {
        data: null,
        message: 'liked commnete!',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      throw error;
    }
  }

  public async unlike_comment(
    userId: number,
    comment_id: number,
  ): Promise<GenericResponse<null>> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: comment_id,
        },
        select: {
          id: true,
          commenter_id: true,
        },
      });

      if (!comment || comment.commenter_id !== userId) {
        throw new ForbiddenException({
          message: 'Comment not found',
        });
      }

      await this.prisma.commentLike.delete({
        where: {
          id: comment_id,
        },
      });

      return {
        data: null,
        message: 'unliked commnete!',
        status: 'ok',
      };
    } catch (error) {
      console.log('err', error);
      throw error;
    }
  }
}
