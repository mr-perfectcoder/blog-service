import { ApiExtraModels, ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';

@ApiExtraModels(CreateBlogDto) // Include CreateBlogDto schema in Swagger documentation
export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @ApiProperty({
    description: 'The ID of the blog to update',
  })
  id?: number;
}
