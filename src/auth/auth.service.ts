import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from 'src/types/auth-jwtPayload';
import { CurrentUser } from 'src/types/current-user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from '../user/user.service'; 
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly usersService: UserService, // Inject the UserService
    private readonly jwtService: JwtService, // Inject the JwtService
  ) {}

  // Validate Google user, either find the user by email or create a new user
  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findOneByEmail(googleUser.email);
    if (user) {
      return user; // If user exists, return the user
    }

    // If user does not exist, create and return a new user
    try {
      return await this.usersService.create(googleUser);
    } catch (error) {
      console.error('Error creating user:', error); // Log error if creation fails
      throw new UnauthorizedException('User could not be created.');
    }
  }

  // Login a user and generate JWT token
  async login(userId: string) {
    try {
      const { accessToken } = await this.generateTokens(userId); // Generate the token
      return { userId, accessToken };
    } catch (error) {
      console.error('Error generating tokens:', error); // Log error during token generation
      throw new UnauthorizedException('Token generation failed.');
    }
  }

  // Generate JWT access token
  async generateTokens(userId: string) {
    try {
      const payload: AuthJwtPayload = { sub: userId };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.signOptions.expiresIn,
      });

      return { accessToken };
    } catch (error) {
      console.error('Error signing token:', error); // Log error if JWT signing fails
      throw new UnauthorizedException('Token signing failed.');
    }
  }

  // Validate JWT user based on userId
  async validateJwtUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      console.error(`User with ID ${userId} not found.`); // Log user not found error
      throw new UnauthorizedException('User not found!');
    }

    const currentUser: CurrentUser = { id: user.id, email: user.email };
    return currentUser; // Return current user
  }
}
