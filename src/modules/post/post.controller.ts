import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtGuard } from '../auth/guards';
import { singlePostInterceptor } from '../multer';
import { CustomRequest } from '../user/interfaces';
import { PostDto, PostQuery } from './dto';
import { FeedQuery } from './interfaces';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}
  @UseGuards(JwtGuard)
  @Post('post')
  @UseInterceptors(singlePostInterceptor)
  createPost(
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    body: PostDto,
  ) {
    return this.postService.createPost(body, file);
  }

  @UseGuards(JwtGuard)
  @Get('post')
  getPost(@Query() query: PostQuery) {
    return this.postService.getPost(query);
  }

  @Get('feed')
  feed(@Query() query: FeedQuery) {
    return this.postService.feed(query);
  }

  //returns the static photos to the feed
  @UseGuards(JwtGuard)
  @Get('image/:imgpath')
  seeUploadedFile(@Param('imgpath') image: any, @Res() res: Response) {
    return res.sendFile(image, { root: './upload' });
  }

  @Post('like/:postId')
  @UseGuards(JwtGuard)
  like(@Param('postId') postId: string, @Req() req: CustomRequest) {
    return this.postService.like(postId, req.user);
  }

  @Post('unlike/:likeId/:postId')
  @UseGuards(JwtGuard)
  unlike(
    @Param('likeId') likeId: string,
    @Req() req: CustomRequest,
    @Param('postId') postId: string,
  ) {
    return this.postService.unlike(likeId, postId, req.user);
  }
}
