import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from '../entities/blog.entity';
import { Provider } from '../entities/user.entity';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const mockData = [
  {
    id: 1,
    title: 'Blog 1',
    content: 'Content 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: userId,
      email: 'user1@example.com',
      firstName: 'User 1',
      lastName: 'Ranjan',
      profileUrl: 'profile-url-1',
      provider: Provider.GOOGLE,
      createdAt: new Date(),
      updatedAt: new Date(),
      blogs: [],
    },
    userId: userId,
    image: 'image1.jpg',
  },
  {
    id: 2,
    title: 'Blog 2',
    content: 'Content 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: userId,
      email: 'user2@example.com',
      firstName: 'User 2',
      lastName: 'Last Name',
      profileUrl: 'profile-url-2',
      provider: Provider.FACEBOOK,
      createdAt: new Date(),
      updatedAt: new Date(),
      blogs: [],
    },
    userId: userId,
    image: 'image2.jpg',
  },
];

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  const mockReq = { user: { id: userId } };
  const mockFile: Express.Multer.File = {
    originalname: 'test-file.png',
    mimetype: 'image/png',
    buffer: Buffer.from('file-content'),
    size: 12345,
    fieldname: 'file',
    encoding: '7bit',
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };
  
  const mockResponse = {
    id: 1,
    title: 'Test Blog',
    content: 'This is a test blog.',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: userId, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
    userId: userId,
    image: 'image-url',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call blogsService.create with correct parameters', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog.',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockResponse as any);

      const result = await controller.create(createBlogDto, mockReq, mockFile);

      expect(service.create).toHaveBeenCalledWith(createBlogDto, userId, mockFile);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockData);

      expect(await controller.findAll()).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should return a single blog', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockData[0]);

      expect(await controller.findOne(1)).toEqual(mockData[0]);
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
  

      const file = {
        originalname: 'test-file.png',
        mimetype: 'image/png',
        buffer: Buffer.from('file-content'),
        size: 12345,
        fieldname: 'file',
        encoding: '7bit',
        stream: null,
        destination: '',
        filename: 'test-file.png',
        path: 'test-file-path',
      };
  
      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        profileUrl: 'profile-url',
        provider: Provider.GOOGLE, // or whatever provider you use
        createdAt: new Date(),
        updatedAt: new Date(),
        blogs: [],
      };
  
      const result = {
        id: 1,
        title: 'Updated Title',
        content: 'Updated Content',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        image: 'test-file-path',
        user: user, // Add the user field here
      };
  
      jest.spyOn(service, 'update').mockResolvedValue(result);

      const req = { user: { id: userId } };
  
      const updatedBlog = await controller.update(1, req, updateBlogDto, file);
  
      expect(service.update).toHaveBeenCalledWith(1, updateBlogDto, userId, file);
      expect(updatedBlog).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a blog', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove(1, mockReq)).toBeUndefined();
    });
  });

  describe('findAllByUser', () => {
    it('should return all blogs for the user', async () => {
      const userId: string = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';  
      const mockReq = { user: { id: userId } };  // Ensure mockReq uses the same userId as expected
  
      const result = mockData;
  
      jest.spyOn(service, 'findAll').mockResolvedValue(result);  
  
      const blogs = await controller.findAllByUser(mockReq);  // Pass mockReq with correct userId
  
      expect(service.findAll).toHaveBeenCalledWith(userId);  // Check against the userId passed in mockReq
      expect(blogs).toEqual(result);
    });
  });
  
});
