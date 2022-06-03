import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  postPicture: any;

  description: string = 'Lorem ipsum dolor sit amet';

  @Transform(({ value }) => value.split(','))
  tags: string[] = ['Happy', 'Default', 'Design'];
}
