import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import {
  addPictureToBucket,
  deletePictureFromBucket,
  getBucketImageUrlWithAuthorAndPictureName,
  getResourceFromURL,
} from 'src/utils/utilsFunctions';
import { Comment, CommentDocument } from 'src/comments/schemas/comment.schema';
import { Like, LikeDocument } from './schemas/like.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private readonly likeModel: Model<LikeDocument>,
  ) {}
  async createPost(data: {
    postPicture: Express.Multer.File;
    author: string;
    description: string;
    tags: string[];
  }) {
    try {
      await addPictureToBucket(data.postPicture, {
        bucketName: 'catgram-app',
        prefixKey: `posts/${data.author}`,
      });

      const newPost = new this.postModel({
        description: data.description,
        tags: data.tags,
        postImageUrl: getBucketImageUrlWithAuthorAndPictureName(
          data.author,
          data.postPicture.originalname,
        ),
        author: data.author,
      });
      newPost.save();
      return { message: 'Your post has been created' };
    } catch (error) {
      console.error(error);
    }
  }

  async listAllPosts() {
    const retrievedPosts = await this.postModel.find().exec();
    return retrievedPosts;
  }

  async getPost(postId: string) {
    const retrievedPost = await this.postModel
      .findOne({ _id: postId })
      .populate('author', ['username'])
      .populate('likes', ['author'])
      .populate({
        path: 'comments',
        select: ['message', 'updateAt'],
        populate: {
          path: 'author',
          select: ['username'],
        },
      });

    return retrievedPost;
  }

  async addOrRemoveLikeToPost({ postId, userId: author }) {
    const retrievedLike = await this.likeModel.findOne({ postId, author });
    const postIsNotLiked = retrievedLike == null;
    if (postIsNotLiked) {
      const newLike = new this.likeModel({
        postId,
        author,
      });

      newLike.save(async (err) => {
        if (err) console.log(err);

        const likedPost = await this.postModel.findByIdAndUpdate(postId, {
          $push: { likes: newLike },
        });

        await likedPost.save();
      });
      return { message: 'Post liked' };
    } else {
      const removedLike = await this.likeModel.findOneAndDelete({
        postId,
        author,
      });

      await this.postModel.findByIdAndUpdate(postId, {
        $pull: { likes: { $in: removedLike._id } },
      });

      return { messsage: 'Post unliked' };
    }
  }

  async deletePostById({ postId, userId: author }) {
    try {
      const post = await this.postModel.findById(postId);
      const filename = getResourceFromURL(post.postImageUrl);
      await deletePictureFromBucket(filename, {
        bucketName: 'catgram-app',
        prefixKey: `posts/${author}`,
      });
      await this.commentModel.deleteMany({ postId });
      await this.likeModel.deleteMany({ postId });
      await this.postModel.deleteOne({ _id: postId, author });
      return { message: 'Post successfully deleted' };
    } catch (error) {
      console.error(error);
    }
  }
}
