import { Post } from '@prisma/client';

export type FeedType = Partial<Post & { comments: number; likes: number }>[];

export type FeedQuery = {
  page: number;
};
