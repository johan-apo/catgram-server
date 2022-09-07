import { PartialType } from '@nestjs/swagger';
import { CreateDogDto } from './create-dog.dto';

export class UpdateDogDto extends PartialType(CreateDogDto) {}
