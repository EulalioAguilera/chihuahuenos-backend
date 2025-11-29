import { Body, Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { TripsService } from './trips.service';
import { Trip } from './trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(): Promise<Trip[]> {
    return this.tripsService.findAll();
  }

  @Post()
  create(@Body() data: CreateTripDto): Promise<Trip> {
    return this.tripsService.create(data);
  }

  @Post('seed')
  async seed(): Promise<{ message: string }> {
    await this.tripsService.seedTrips();
    return { message: 'Trips created based on routes.' };
  }

    @Get('by-route/:routeId')
  findByRoute(@Param('routeId', ParseIntPipe) routeId: number) {
    return this.tripsService.findByRoute(routeId);
  }

}
