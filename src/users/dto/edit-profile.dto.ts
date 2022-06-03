import { ApiProperty } from '@nestjs/swagger';

export class EditUserProfileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  profilePicture: any;
  username: string;
  name: string;
}
