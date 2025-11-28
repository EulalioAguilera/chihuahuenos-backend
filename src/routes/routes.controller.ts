import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from './route.entity';
import { CreateRouteDto } from './dto/create-route.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(): Promise<Route[]> {
    return this.routesService.findAll();
  }

  @Post()
  create(@Body() data: CreateRouteDto): Promise<Route> {
    return this.routesService.create(data);
  }

  // Endpoint temporal para llenar las rutas iniciales
  @Post('seed')
  async seed(): Promise<{ message: string }> {
    await this.routesService.seedDefaultRoutes();
    return { message: 'Default routes created (if they did not exist).' };
  }
}
