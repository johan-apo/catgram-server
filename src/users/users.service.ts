import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';
import { getResourceFromURL } from 'src/utils/utility';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { S3Service } from 'src/services/s3.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).lean();
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: CreateUserDto) {
    try {
      const newUserDocument = new this.userModel({
        ...userData,
      });
      await newUserDocument.save();
    } catch (error) {
      if (error.code === 11000)
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      else throw new HttpException(error.code, HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'You have succesfully signed up',
    };
  }

  async getById(id: number) {
    const retrievedUser = await this.userModel.findById(id).lean();

    if (retrievedUser._id) {
      return retrievedUser;
    }

    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getUserPostsByUsername(username: string) {
    const { _id: userId } = await this.userModel.findOne({ username });
    const posts = await this.postModel.find({ author: userId });
    return posts;
  }

  async editProfile(data: {
    profilePicture: Express.Multer.File;
    id: string;
    username: string;
    name: string;
  }) {
    const user = await this.userModel.findById(data.id);

    if (user.profilePicture) {
      const pictureKey = getResourceFromURL(user.profilePicture);
      await this.s3Service.deletePicture({
        filename: pictureKey,
        prefixKey: 'users',
      });
    }

    try {
      await this.s3Service.uploadPicture({
        file: data.profilePicture,
        prefixKey: 'users',
      });
      await this.userModel.findByIdAndUpdate(data.id, {
        name: data.name,
        username: data.username,
        profilePicture: this.s3Service.getProfileImageUrl(
          data.profilePicture.originalname,
        ),
      });

      return {
        message: 'Your profile has been updated!',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY);
    }
  }

  async getUserInformationByUsername(username: string) {
    const userInformation = await this.userModel.findOne({ username }).lean();
    if (userInformation) {
      const { email, password, dateOfBirth, ...neededUserInformation } =
        userInformation;
      return neededUserInformation;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }
}
