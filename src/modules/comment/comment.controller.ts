import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards';
import { CustomRequest } from '../user/interfaces';
import {
  CommentBody,
  CommentService,
  DeleteCommentBody,
} from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('post-comment')
  @UseGuards(JwtGuard)
  comment(@Body() body: CommentBody) {
    return this.commentService.comment(body);
  }

  @Delete('post-comment')
  @UseGuards(JwtGuard)
  delete_comment(
    @Body() body: DeleteCommentBody,
    @Req() request: CustomRequest,
  ) {
    const { userId } = request.user;
    return this.commentService.delete_comment(body, userId);
  }

  @Get('post-comments/:postId')
  @UseGuards(JwtGuard)
  get_comments(@Param('postId') postId: string) {
    return this.commentService.post_comments(postId);
  }

  @Get('like-comment/:commentId')
  @UseGuards(JwtGuard)
  like_comment(
    @Param('commentId') commentId: string,
    @Req() request: CustomRequest,
  ) {
    const { userId } = request.user;
    return this.commentService.like_comment(userId, parseInt(commentId));
  }
}
