import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  // MI TÖRTÉNIK
  async validate(payload: any) {
    /*
    console.log(payload);
    console.log(new Date(payload.iat * 1000));
    console.log(new Date(payload.exp * 1000));
    console.log(new Date());
    try {
      if (new Date(payload.exp * 1000) < new Date()) {
        console.log('expired');
        const refreshToken = await this.authService.getUserRefreshToken(
          payload.sub,
        );
        if (!refreshToken) {
          throw new Error('Token expired and no refresh token available');
        }
        const tokens =
          await this.authService.validateRefreshToken(refreshToken);
        console.log('new tokens', tokens);
        return tokens;
      }

      if (!payload?.sub) {
        throw new Error('Invalid tokenASD');
      }
      console.log('new payload', payload);

      return payload;
    } catch (error) {
      throw new Error('Invalid token: ' + error);
    }
    */
    return payload;
  }
}
