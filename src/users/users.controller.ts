// api/src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.usersService.create(body);
    const { passwordHash, ...rest } = user;
    return rest;
  }

  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.usersService.login(body);
  }

  // 👇 BONUS: subir archivo de identificación
  @Post(':id/upload-id')
  @UseInterceptors(FileInterceptor('file')) // "file" = nombre del campo en form-data
  async uploadId(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { message: 'No se recibió ningún archivo' };
    }

    const user = await this.usersService.saveIdentityDocument(id, file.filename);
    const { passwordHash, ...rest } = user;

    return {
      message: 'Documento de identidad subido correctamente',
      user: rest,
    };
  }
}
