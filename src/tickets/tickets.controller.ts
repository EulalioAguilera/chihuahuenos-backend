import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { ReserveTicketDto } from './dto/reserve-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('trip/:tripId')
  findByTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<Ticket[]> {
    return this.ticketsService.findByTrip(tripId);
  }

  @Post('seed/:tripId')
  async seed(
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<{ message: string }> {
    await this.ticketsService.seedTicketsForTrip(tripId);
    return { message: `Tickets created for trip ${tripId}` };
  }

  @Post('reserve')
  reserve(@Body() data: ReserveTicketDto): Promise<Ticket> {
    return this.ticketsService.reserveSeat(data);
  }

  @Post('confirm/:ticketId')
  confirm(
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ): Promise<Ticket> {
    return this.ticketsService.confirmTicket(ticketId);
  }
}
