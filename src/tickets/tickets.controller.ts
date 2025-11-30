import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ReserveTicketDto } from './dto/reserve-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Obtener todos los boletos de un viaje
   */
  @Get('trip/:tripId')
  findByTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<any[]> {
    return this.ticketsService.findByTrip(tripId);
  }

  /**
   * Sembrar boletos para un viaje (según su capacidad)
   */
  @Post('seed/:tripId')
  async seed(
    @Param('tripId', ParseIntPipe) tripId: number,
  ): Promise<{ message: string }> {
    await this.ticketsService.seedTicketsForTrip(tripId);
    return { message: `Tickets created for trip ${tripId}` };
  }

  /**
   * Reservar un asiento (usa ticketId, userName, userEmail)
   */
  @Post('reserve')
  reserve(@Body() data: ReserveTicketDto): Promise<any> {
    return this.ticketsService.reserveSeat(data);
  }

  /**
   * Confirmar la compra de un boleto (de RESERVED a SOLD)
   */
  @Post('confirm/:ticketId')
  confirm(
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ): Promise<any> {
    return this.ticketsService.confirmTicket(ticketId);
  }

  /**
   * Obtener detalle bonito de varios boletos (para el “preview”)
   * Body: { ticketIds: number[] }
   */
  @Post('preview')
  preview(@Body() body: { ticketIds: number[] }): Promise<any[]> {
    return this.ticketsService.previewTickets(body.ticketIds);
  }
}
