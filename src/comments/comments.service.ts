import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create({ userId: author, message, postId }) {
    const newComment = new this.commentModel({
      message,
      author,
      postId,
    });
    newComment.save(async (err) => {
      if (err) console.log(err);

      const retrievedPost = await this.postModel.findOneAndUpdate(
        {
          _id: postId,
        },
        {
          $push: { comments: newComment },
        },
      );
      await retrievedPost.save();
    });
  }

  async getCommentById(commentId) {
    const result = await this.commentModel.findById(commentId);
    return result;
  }

  async editComment({ message, commentId, userId: author }) {
    const result = await this.commentModel.findOneAndUpdate(
      { author, _id: commentId },
      {
        message,
      },
    );
    return { message: 'Update succesful' };
  }

  async deleteComment({ commentId, userId: author }) {
    const commentToDelete = await this.commentModel.findById(commentId);
    await this.postModel.findOneAndUpdate(
      { _id: commentToDelete.postId },
      { $pull: { comments: { $in: commentId } } },
    );
    await this.commentModel.deleteOne({ _id: commentId, author });
    return { message: 'Comment deleted' };
  }
}
