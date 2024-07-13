import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // if (!token) {
    //   throw new UnauthorizedException('You must be authenticated.');
    // }

    // try {
      // const payload = this.jwtService.verify(token);
      // request.userId = payload.sub;
      return true;
    // } catch (err) {
    //   if (err.name === 'TokenExpiredError') {
    //     throw new UnauthorizedException('Token has expired.');
    //   } else if (err.name === 'JsonWebTokenError') {
    //     throw new UnauthorizedException('Invalid token.');
    //   } else {
    //     throw new UnauthorizedException('Could not authenticate.');
    //   }
    // }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
