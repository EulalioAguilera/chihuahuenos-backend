import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    // No devolvemos la contraseña
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'createdAt'],
    });
  }

  async create(data: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hash,
    });

    const saved = await this.usersRepository.save(user);

    // Quitamos el campo password en la respuesta
    const { password, ...rest } = saved;
    return rest as User;
  }
}
