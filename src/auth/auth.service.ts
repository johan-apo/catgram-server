import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto as SignupData } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupData: SignupData) {
    // Info: 'Digest' is the hashed password
    const digest = await bcrypt.hash(signupData.password, 10);
    const createdUser = await this.usersService.create({
      ...signupData,
      password: digest,
    });
    return createdUser;
  }

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    const user = await this.usersService.getByEmail(email);
    await this.verifyPassword(plainTextPassword, user.password);
    return user;
  }

  private async verifyPassword(plainTextPassword: string, digest: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, digest);
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  setCookiesForLogin(res: Response, id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload);
    res.cookie('Authentication', token, {
      maxAge: this.configService.get('JWT_EXPIRATION_TIME') * 1000,
      httpOnly: true,
      secure: true,
      path: '/',
    });
  }

  setCookiesForLogout(res: Response) {
    res.cookie('Authentication', '', { httpOnly: true, maxAge: 0 });
  }
}
