import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './route.entity';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
  ) {}

  findAll(): Promise<Route[]> {
    return this.routesRepository.find({
      where: { isActive: true },
    });
  }

  async create(data: CreateRouteDto): Promise<Route> {
    const route = this.routesRepository.create(data);
    return this.routesRepository.save(route);
  }

  // Pequeño seed para las rutas iniciales
  async seedDefaultRoutes(): Promise<void> {
    const count = await this.routesRepository.count();
    if (count > 0) {
      return; // Ya hay rutas, no duplicar
    }

    const defaults: CreateRouteDto[] = [
      {
        name: 'Oaxaca - Puebla',
        origin: 'Oaxaca',
        destination: 'Puebla',
        isActive: true,
      },
      {
        name: 'Chihuahua - Nuevo León',
        origin: 'Chihuahua',
        destination: 'Nuevo León',
        isActive: true,
      },
      {
        name: 'Baja California Norte - Baja California Sur',
        origin: 'Baja California Norte',
        destination: 'Baja California Sur',
        isActive: true,
      },
      {
        name: 'Chihuahua - CDMX',
        origin: 'Chihuahua',
        destination: 'CDMX',
        isActive: true,
      },
    ];

    const routes = this.routesRepository.create(defaults);
    await this.routesRepository.save(routes);
  }
}
