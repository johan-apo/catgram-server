export class CreateUserDto {
  email: string = 'test@gmail.com';
  username: string = 'testing_user';
  name: string = 'Testing';
  password: string;
  dateOfBirth: Date;
}
