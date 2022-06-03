import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/commonInterfaces';
import { EditUserProfileDto } from './dto/edit-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  @ApiParam({ name: 'username' })
  getUserInformationByUsername(@Param() params: { username: string }) {
    return this.usersService.getUserInformationByUsername(params.username);
  }

  @Get(':username/posts')
  @ApiParam({ name: 'username' })
  getUserPostsByUsername(@Param() { username }) {
    return this.usersService.getUserPostsByUsername(username);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Edit user profile',
    type: EditUserProfileDto,
  })
  editProfile(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() body: EditUserProfileDto,
    @Req() req: RequestWithUser,
  ) {
    // FIXME: CHANGE PROPERTY id TO _id in all occurrences
    return this.usersService.editProfile({
      ...body,
      profilePicture,
      id: req.user._id,
    });
  }
}
