import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user.userId;
    // do the db call and attach the user data to this decorator by
    // returning the value

    //use this decdorator in controllers to get the userdata
    //like @GetUser() user: User ==> type from prisma
    return null;
  },
);
