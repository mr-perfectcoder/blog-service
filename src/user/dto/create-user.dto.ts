import { IsString, IsEmail, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { Provider } from 'src/entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsUrl()
  profileUrl: string;

  @IsEnum(Provider)
  provider: Provider;

  @IsOptional()
  @IsString()
  createdAt?: Date;
}
