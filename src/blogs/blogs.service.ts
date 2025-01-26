import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../entities/user.entity';
import { FileService } from './file.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
  ) {}

  async create(
    createBlogDto: CreateBlogDto,
    userId: string,
    file: Express.Multer.File,
  ) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate the file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if the file is an image
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only image files (JPEG, PNG, GIF, WebP) are allowed',
      );
    }

    // Check if the file size is less than or equal to 2 MB
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('File size should not exceed 2 MB');
    }

    // Upload the image to your service
    const url = await this.fileService.uploadImage(file, 'blogx-images');

    // Create the blog with the uploaded image URL
    const blog = this.blogRepository.create({
      ...createBlogDto,
      user,
      image: url,
    });

    // Save the blog to the database
    return this.blogRepository.save(blog);
  }

  findAll(userId?: string) {
    return this.blogRepository.find({
      where: userId ? { user: { id: userId } } : {}, // Add condition if userId is provided
      relations: ['user'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!blog) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }

    return blog;
  }

  async update(
    id: number,
    updateBlog: UpdateBlogDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Blog> {
    const payload: any = { ...updateBlog };

    const blog = await this.blogRepository.findOne({
      where: { id, userId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found or update failed');
    }

    if (file) {
      // Delete the old image if it exists
      if (blog.image) {
        await this.fileService.deleteFileByLocation(blog.image);
      }

      // Upload the new image
      const url = await this.fileService.uploadImage(file, 'blogx-images');
      payload.image = url;
    }

    const updateResult = await this.blogRepository.update(id, payload);

    if (updateResult.affected === 0) {
      throw new NotFoundException('Blog not found or update failed');
    }

    const updatedBlog = await this.blogRepository.findOneBy({ id });
    if (!updatedBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found after update`);
    }

    return updatedBlog;
  }

  async remove(id: number, userId: string): Promise<void> {
    const blog = await this.blogRepository.findOne({
      where: { id, userId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found or delete failed');
    }

    if (blog.image) {
      await this.fileService.deleteFileByLocation(blog.image);
    }

    const deleteResult = await this.blogRepository.delete(blog.id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Blog not found or delete failed`);
    }
  }
}
