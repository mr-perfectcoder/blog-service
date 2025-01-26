import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ description: 'The title of the blog' })
  title: string;

  @ApiProperty({ description: 'The content of the blog' })
  content: string;
}
