import { Injectable, BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Lista de usuarios sin contraseña
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'createdAt'],
    });
  }

  async create(data: CreateUserDto): Promise<User> {
    // 1. Hasheamos el password enviado en el DTO
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 2. Creamos la entidad usando passwordHash (no password)
    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash, //  aquí va el hash
    });

    // 3. Guardamos y devolvemos el usuario
    const saved = await this.usersRepository.save(user);

    return saved;
  }

    async login(data: LoginUserDto): Promise<{ id: number; name: string; email: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('Credenciales inválidas');
    }

    // Comparamos el password plano con el hash
    const isOk = await bcrypt.compare(data.password, user.passwordHash || '');

    if (!isOk) {
      throw new BadRequestException('Credenciales inválidas');
    }

    // Devolvemos solo lo necesario
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }


 async saveIdentityDocument(
    userId: number,
    filename: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.identityDocumentPath = `uploads/identities/${filename}`;
    user.isIdentityVerified = false;

    return this.usersRepository.save(user);
  }


}
