import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Post()
  create(@Body() data: CreateRouteDto) {
    return this.routesService.create(data);
  }

  @Post('seed')
  seed() {
    return this.routesService.seedDefaultRoutes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routesService.findOne(id);
  }
}
