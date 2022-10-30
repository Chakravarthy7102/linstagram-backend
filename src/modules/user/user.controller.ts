import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { JwtGuard } from 'src/modules/auth/guards';
import { Payload } from 'src/types/payload.type';
import { UpdateBio } from './dto';
import { CustomRequest } from './interfaces';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @HttpCode(HttpStatus.OK)
  //we can put guards on the lower functional level or class level(class will reduce the usage of the same decorator over and over again on the class)
  getUser(@Req() req: CustomRequest) {
    return this.userService.getUser(req.user as Payload);
  }

  @Get('follow')
  @HttpCode(HttpStatus.OK)
  follow(@Req() req: CustomRequest, @Query() query: any) {
    console.log({
      query,
    });
    return this.userService.follow(req.user, query);
  }

  @Get('unfollow')
  @HttpCode(HttpStatus.OK)
  unfollow(@Req() req: CustomRequest, @Query() query: any) {
    console.log({
      query,
    });

    return this.userService.unFollow(req.user, query);
  }

  @Post('update-bio')
  @HttpCode(HttpStatus.OK)
  updateBio(@Req() req: CustomRequest, @Body() body: UpdateBio) {
    return this.userService.updateBio(req.user, body);
  }
}
