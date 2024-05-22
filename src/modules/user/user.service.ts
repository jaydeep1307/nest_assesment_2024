import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt'; // Importing bcrypt for password hashing
import { Model } from 'mongoose';
import { TypeExceptions } from 'src/common/exceptions'; // Custom exceptions
import { JwtTokenInterface } from 'src/common/interfaces/jwt.interface'; // Interface for JWT payload
import { CreateUserDto } from './dto/create-user.dto'; // DTO for creating a new user
import { SigninUserDto } from './dto/signin-user.dto'; // DTO for user signin
import { User, UserDocument } from './schemas/user.schema'; // User schema definition

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>, // Injecting the User model
    private jwtService: JwtService, // Injecting JwtService for JWT token generation
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, username, email, password } = createUserDto;

    // Hashing the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Creating a new user instance in the database
    const user = await this.userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Generating token payload
    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
    };

    // Generating JWT token for user authentication
    const access_token = await this.generateToken(tokenPayload);

    // Generating user payload including JWT token
    const userPayload = this.generateUserPayload(user, access_token);

    return userPayload; // Returning user payload
  }

  async loginUser(signinUserDto: SigninUserDto) {
    const { email, password } = signinUserDto;

    // Finding user by email in the database
    const user = await this.findUser(email);

    // If user doesn't exist or password doesn't match, throw an exception
    if (!user || !bcrypt.compareSync(password, user.password))
      throw TypeExceptions.InvalidLogin('Invalid email or password');

    // Generating token payload
    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
    };

    // Generating JWT token for user authentication
    const access_token = await this.generateToken(tokenPayload);

    // Generating user payload including JWT token
    const userPayload = this.generateUserPayload(user, access_token);

    return userPayload; // Returning user payload
  }

  // Helper function to generate JWT token
  private generateToken(payload: JwtTokenInterface) {
    return this.jwtService.signAsync(payload);
  }

  // Helper function to find user by email in the database
  private async findUser(email: string) {
    return await this.userModel.findOne({ email });
  }

  // Helper function to generate user payload including JWT token
  private generateUserPayload(user: UserDocument, token: string) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      access_token: token,
    };
  }
}
