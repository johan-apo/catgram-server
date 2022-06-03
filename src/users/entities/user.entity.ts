import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  password: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  profilePicture: string;
}
