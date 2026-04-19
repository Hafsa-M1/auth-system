import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 🔹 REGISTER
  @Post('register')
  register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(email, password);
  }

  // 🔹 LOGIN
  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  // 🔹 LOGOUT
  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  // 🔐 PROTECTED ROUTE (/auth/me)
  @UseGuards(JwtGuard)
  @Post('me')
  getMe(@Request() req) {
    return {
      message: 'Protected data access successful',
      user: req.user,
    };
  }

  @Post('forgot-password')
forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
}
}