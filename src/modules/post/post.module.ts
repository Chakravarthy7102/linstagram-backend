import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
