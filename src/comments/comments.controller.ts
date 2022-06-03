import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/commonInterfaces';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' })
  @ApiBody({
    description: 'Create a comment on post',
    type: CreateCommentDto,
  })
  createComment(
    @Param() { postId },
    @Req() req: RequestWithUser,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.create({
      message: body.message,
      postId,
      userId: req.user._id,
    });
  }

  @Get(':commentId')
  @ApiParam({ name: 'commentId' })
  get(@Param() { commentId }) {
    return this.commentsService.getCommentById(commentId);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' })
  @ApiBody({
    description: 'Edit a comment',
    type: EditCommentDto,
  })
  patchComment(
    @Param() { commentId },
    @Body() body: EditCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.editComment({
      message: body.message,
      commentId,
      userId: req.user._id,
    });
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' })
  delete(@Param() { commentId }, @Req() req: RequestWithUser) {
    return this.commentsService.deleteComment({
      commentId,
      userId: req.user._id,
    });
  }
}
