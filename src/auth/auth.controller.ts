import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto as signupDto } from 'src/users/dto/create-user.dto';
import { RequestWithUser } from 'src/utils/commonInterfaces';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupData: signupDto) {
    return this.authService.signup(signupData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
    type: loginDto,
  })
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { password, email, dateOfBirth, ...user } = req.user;
    this.authService.setCookiesForLogin(res, user._id);
    return { ...user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.setCookiesForLogout(res);
    return { message: 'You have successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  amIAuthenticated(@Req() req) {
    const user = req.user;
    return { message: `You are authenticated, ${user.name}.` };
  }
}
