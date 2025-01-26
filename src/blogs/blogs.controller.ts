import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.blogsService.create(createBlogDto, userId, file);
  }

  @Public()
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @Get('/user')
  findAllByUser(@Req() req) {
    const userId = req.user.id;
    return this.blogsService.findAll(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.blogsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: number,
    @Req() req,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.blogsService.update(+id, updateBlogDto, userId, file);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;
    return this.blogsService.remove(+id, userId);
  }
}
