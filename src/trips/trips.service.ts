import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { Route } from 'src/routes/route.entity';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
  ) {}

  findAll(): Promise<Trip[]> {
    return this.tripsRepository.find({
      relations: ['route'],
    });
  }

  async create(data: CreateTripDto): Promise<Trip> {
    const route = await this.routesRepository.findOne({
      where: { id: data.routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const trip = this.tripsRepository.create({
      date: data.date,
      time: data.time,
      capacity: data.capacity,
      route: route,
    });

    return this.tripsRepository.save(trip);
  }

  // Semillas de ejemplo
  async seedTrips(): Promise<void> {
    const tripsExist = await this.tripsRepository.count();
    if (tripsExist > 0) return;

    const routes = await this.routesRepository.find();

    const demoTrips = routes.map((route) => {
      return this.tripsRepository.create({
        date: '2025-12-01',
        time: '08:00',
        capacity: 40,
        route: route,
      });
    });

    await this.tripsRepository.save(demoTrips);
  }

  async findByRoute(routeId: number): Promise<Trip[]> {
  return this.tripsRepository.find({
    where: { route: { id: routeId } },
    relations: ['route'],
    order: { time: 'ASC' },
  });
}

}
