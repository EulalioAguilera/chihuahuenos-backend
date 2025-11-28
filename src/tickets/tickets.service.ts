import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { Trip } from 'src/trips/trip.entity';
import { User } from 'src/users/user.entity';
import { ReserveTicketDto } from './dto/reserve-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Obtener todos los asientos de un viaje
   */
  async findByTrip(tripId: number): Promise<any[]> {
    const tickets = await this.ticketsRepository.find({
      where: { trip: { id: tripId } },
      relations: ['trip', 'user'],
      order: { seatNumber: 'ASC' },
    });

    // Respuesta limpia para el frontend
    return tickets.map((t) => ({
      id: t.id,
      seatNumber: t.seatNumber,
      status: t.status,
      tripId: t.trip.id,
      userId: t.user ? t.user.id : null,
    }));
  }

  /**
   * Crear los asientos de un viaje según su capacidad
   */
  async seedTicketsForTrip(tripId: number): Promise<void> {
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const existing = await this.ticketsRepository.count({
      where: { trip: { id: tripId } },
    });

    if (existing > 0) {
      // Ya tiene asientos, no duplicar
      return;
    }

    const tickets: Ticket[] = [];

    for (let seat = 1; seat <= trip.capacity; seat++) {
      const ticket = this.ticketsRepository.create({
        seatNumber: seat,
        status: TicketStatus.AVAILABLE,
        trip,
      });
      tickets.push(ticket);
    }

    await this.ticketsRepository.save(tickets);
  }

  /**
   * Reservar un asiento para un usuario.
   * Usa un UPDATE atómico para evitar que dos usuarios reserven el mismo asiento.
   */
  async reserveSeat(data: ReserveTicketDto): Promise<any> {
    const trip = await this.tripsRepository.findOne({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const user = await this.usersRepository.findOne({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Paso 1: marcar el asiento como RESERVED solo si está AVAILABLE (operación atómica)
    const updateResult = await this.ticketsRepository
      .createQueryBuilder()
      .update()
      .set({
        status: TicketStatus.RESERVED,
        reservedAt: new Date(),
      })
      .where('tripId = :tripId', { tripId: data.tripId })
      .andWhere('seatNumber = :seatNumber', { seatNumber: data.seatNumber })
      .andWhere('status = :status', { status: TicketStatus.AVAILABLE })
      .returning('*')
      .execute();

    if (updateResult.affected === 0) {
      // Nadie pudo cambiar el asiento: ya estaba reservado o vendido
      throw new BadRequestException('Seat is not available');
    }

    const updatedRow = updateResult.raw[0];

    // Paso 2: asociar el usuario al ticket ya reservado
    const ticket = await this.ticketsRepository.findOne({
      where: { id: updatedRow.id },
      relations: ['trip', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found after update');
    }

    ticket.user = user;
    const saved = await this.ticketsRepository.save(ticket);

    // Respuesta limpia
    return {
      id: saved.id,
      seatNumber: saved.seatNumber,
      status: saved.status,
      tripId: saved.trip.id,
      userId: saved.user ? saved.user.id : null,
    };
  }

  /**
   * Confirmar la compra de un ticket reservado (pasar de RESERVED a SOLD)
   */
  async confirmTicket(ticketId: number): Promise<any> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
      relations: ['trip', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.RESERVED) {
      throw new BadRequestException('Ticket is not reserved');
    }

    ticket.status = TicketStatus.SOLD;
    const saved = await this.ticketsRepository.save(ticket);

    return {
      id: saved.id,
      seatNumber: saved.seatNumber,
      status: saved.status,
      tripId: saved.trip.id,
      userId: saved.user ? saved.user.id : null,
    };
  }
}
