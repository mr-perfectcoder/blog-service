import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FileService } from './file.service';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('BlogsService', () => {
  let service: BlogsService;
  let blogRepository: Repository<Blog>;
  let userRepository: Repository<User>;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            uploadImage: jest.fn(),
            deleteFileByLocation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog',
      };
      const blog = new Blog();
      blog.id = 1;
      blog.title = createBlogDto.title;
      blog.content = createBlogDto.content;
      blog.createdAt = new Date();
      blog.image = 'uploaded_image_url'; // This should be set after file upload
      blog.user = new User(); // Assuming the user is added after retrieving the user

      // Mock user repository
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(new User());

      // Mock file upload service
      jest
        .spyOn(fileService, 'uploadImage')
        .mockResolvedValue('uploaded_image_url');

      // Mock create and save methods
      jest.spyOn(blogRepository, 'create').mockReturnValue(blog);
      jest.spyOn(blogRepository, 'save').mockResolvedValue(blog);

      // Mock a valid file with an allowed mimetype
      const validFile: Express.Multer.File = {
        originalname: 'image.png',
        mimetype: 'image/png',
        buffer: Buffer.from('file-content'),
        size: 12345,
        fieldname: 'file',
        encoding: '7bit',
        stream: null,
        destination: '',
        filename: 'image.png',
        path: '',
      };

      // Call the service method
      const result = await service.create(createBlogDto, 'userId', validFile);

      // Verify the result
      expect(result).toEqual(blog);

      // Verify that the methods were called with the correct parameters
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'userId' },
      });
      expect(blogRepository.create).toHaveBeenCalledWith({
        ...createBlogDto, // Spread the original DTO
        image: 'uploaded_image_url', // Add the image field
        user: expect.any(User), // Ensure the user is added
      });
      expect(blogRepository.save).toHaveBeenCalledWith(blog);
      expect(fileService.uploadImage).toHaveBeenCalledWith(
        validFile,
        'blogx-images',
      );
    });
  });

  // describe('update', () => {
  //   it('should update a blog with an image', async () => {
  //     const updateBlogDto: UpdateBlogDto = {
  //       title: 'Updated Title',
  //       content: 'Updated content',
  //     };
  //     const file: Express.Multer.File = {
  //       originalname: 'image.png',
  //       mimetype: 'image/png',
  //       buffer: Buffer.from('file-content'),
  //       size: 12345,
  //       fieldname: 'file',
  //       encoding: '7bit',
  //       stream: null,
  //       destination: '',
  //       filename: 'image.png',
  //       path: '',
  //     };

  //     const blog = new Blog();
  //     blog.id = 1;
  //     blog.userId = 'userId';
  //     blog.title = 'Test Blog';
  //     blog.content = 'Test content';
  //     blog.createdAt = new Date();
  //     blog.image = 'old_image_url';

  //     const updatedBlog = new Blog();
  //     updatedBlog.id = 1;
  //     updatedBlog.userId = 'userId';
  //     updatedBlog.title = 'Updated Title';
  //     updatedBlog.content = 'Updated content';
  //     updatedBlog.createdAt = new Date();
  //     updatedBlog.image = 'uploaded_image_url';
  //     updatedBlog.user = new User();

  //     const updateResult: UpdateResult = {
  //       raw: [],
  //       generatedMaps: [],
  //       affected: 1,
  //     };

  //     // Mock the repository methods
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(blog); // Mock findOneBy instead of findOne
  //     jest.spyOn(fileService, 'uploadImage').mockResolvedValue('uploaded_image_url');
  //     jest.spyOn(blogRepository, 'update').mockResolvedValue(updateResult);
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(updatedBlog); // Mock after update with findOneBy

  //     // Call the service method
  //     const result = await service.update(1, updateBlogDto, 'userId', file);

  //     // Verify the result
  //     expect(result).toEqual(updatedBlog);

  //     // Verify method calls
  //     expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: 1, userId: 'userId' }); // Use findOneBy
  //     expect(fileService.uploadImage).toHaveBeenCalledWith(file, 'blogx-images');
  //     expect(blogRepository.update).toHaveBeenCalledWith(1, {
  //       ...updateBlogDto,
  //       image: 'uploaded_image_url',
  //     });
  //     expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: 1 }); // Again, findOneBy
  //   });

  //   it('should update a blog without image', async () => {
  //     const updateBlogDto: UpdateBlogDto = {
  //       title: 'Updated Title without image',
  //       content: 'Updated content without image',
  //     };

  //     const blog = new Blog();
  //     blog.id = 1;
  //     blog.userId = 'userId';
  //     blog.title = 'Test Blog';
  //     blog.content = 'Test content';
  //     blog.createdAt = new Date();
  //     blog.image = 'old_image_url';

  //     const updatedBlog = new Blog();
  //     updatedBlog.id = 1;
  //     updatedBlog.userId = 'userId';
  //     updatedBlog.title = 'Updated Title without image';
  //     updatedBlog.content = 'Updated content without image';
  //     updatedBlog.createdAt = new Date();
  //     updatedBlog.image = 'old_image_url'; // Image is not changed
  //     updatedBlog.user = new User();

  //     const updateResult: UpdateResult = {
  //       raw: [],
  //       generatedMaps: [],
  //       affected: 1,
  //     };

  //     // Mock the repository methods
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(blog); // Use findOneBy instead of findOne
  //     jest.spyOn(blogRepository, 'update').mockResolvedValue(updateResult); // Simulate successful update without image
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(updatedBlog); // Mock after update with findOneBy

  //     // Call the service method
  //     const result = await service.update(1, updateBlogDto, 'userId', null); // Passing null for file

  //     // Verify the result
  //     expect(result).toEqual(updatedBlog);

  //     // Verify method calls
  //     expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: 1, userId: 'userId' }); // Use findOneBy
  //     expect(blogRepository.update).toHaveBeenCalledWith(1, {
  //       ...updateBlogDto,
  //       image: 'old_image_url', // No image change
  //     });
  //     expect(blogRepository.findOneBy).toHaveBeenCalledWith({ id: 1 }); // Again, findOneBy
  //   });
  // });

  // describe('remove', () => {
  //   it('should delete a blog and its associated image', async () => {
  //     const blog = new Blog();
  //     blog.id = 1;
  //     blog.userId = 'userId';
  //     blog.title = 'Test Blog';
  //     blog.content = 'Test content';
  //     blog.createdAt = new Date();
  //     blog.image = 'old_image_url'; // Assuming this blog has an image that needs to be deleted
  //     blog.user = new User();

  //     // Mock the repository method to find a blog
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(blog); // Ensure blog is found

  //     const deleteResult: DeleteResult = {
  //       raw: [],
  //       affected: 1,
  //     };
  //     jest.spyOn(blogRepository, 'delete').mockResolvedValue(deleteResult);

  //     // Mock file deletion
  //     jest.spyOn(fileService, 'deleteFileByLocation').mockResolvedValue(null);

  //     // Call the remove method
  //     await service.remove(1, 'userId');

  //     // Verify that the blog was found
  //     expect(blogRepository.findOneBy).toHaveBeenCalledWith({
  //       id: 1,
  //       userId: 'userId',
  //     });

  //     // Verify that the image deletion was called
  //     expect(fileService.deleteFileByLocation).toHaveBeenCalledWith(
  //       'old_image_url',
  //     );

  //     // Verify that the delete method was called
  //     expect(blogRepository.delete).toHaveBeenCalledWith(1);
  //   });

  //   it('should throw NotFoundException if the blog does not exist', async () => {
  //     // Mock the repository to simulate that the blog is not found
  //     jest.spyOn(blogRepository, 'findOneBy').mockResolvedValueOnce(null);

  //     // Call the remove method and expect it to throw a NotFoundException
  //     await expect(service.remove(1, 'userId')).rejects.toThrow(
  //       NotFoundException,
  //     );

  //     // Verify that the repository delete method is never called
  //     expect(blogRepository.delete).not.toHaveBeenCalled();
  //   });
  // });
});
