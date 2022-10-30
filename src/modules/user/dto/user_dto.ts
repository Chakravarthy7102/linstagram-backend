import { IsString } from 'class-validator';

export class FollowQuery {
  leaderId: string;
}

export class UpdateBio {
  @IsString()
  bio: string;
}
