import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/commonInterfaces';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('postPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new post',
    type: CreatePostDto,
  })
  createPost(
    @UploadedFile() postPicture: Express.Multer.File,
    @Body()
    body: CreatePostDto,
    @Req() req: RequestWithUser,
  ) {
    this.postsService.createPost({
      ...body,
      postPicture,
      // @ts-ignore
      author: req.user._id,
    });
  }

  @Get()
  listAllPosts() {
    return this.postsService.listAllPosts();
  }

  @Get(':postId')
  @ApiParam({ name: 'postId' })
  get(@Param() { postId }) {
    return this.postsService.getPost(postId);
  }

  @Patch(':postId/likeOrUnlike')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' })
  async likeOrUnlike(@Param() { postId }, @Req() req: RequestWithUser) {
    return this.postsService.addOrRemoveLikeToPost({
      postId,
      userId: req.user._id,
    });
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' })
  delete(@Param() { postId }, @Req() req: RequestWithUser) {
    return this.postsService.deletePostById({ postId, userId: req.user._id });
  }
}
