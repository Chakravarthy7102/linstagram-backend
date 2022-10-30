import { Post } from '@prisma/client';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

let Post: new () => Post;
export class PostDto implements Omit<Partial<Post>, 'creatorId'> {
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsNotEmpty()
  creatorId: number | string;
}

export class PostQuery {
  @IsNotEmpty()
  postId: string;
}
