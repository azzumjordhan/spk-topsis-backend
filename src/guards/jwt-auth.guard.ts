import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error_code: 'UNAUTHORIZED',
            message: 'Unauthorized User',
          },
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
