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


function generateBoardingCode() {
  return "CHIH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
   * Respuesta ya “limpia” para el frontend.
   */
  async findByTrip(tripId: number): Promise<any[]> {
    const tickets = await this.ticketsRepository.find({
      where: { trip: { id: tripId } },
      relations: ['trip', 'user'],
      order: { seatNumber: 'ASC' },
    });

    return tickets.map((t) => ({
      id: t.id,
      seatNumber: t.seatNumber,
      // estos dos los usa tu front
      isReserved: t.status === TicketStatus.RESERVED || t.status === TicketStatus.SOLD,
      isConfirmed: t.status === TicketStatus.SOLD,
      // extras por si quieres debug
      status: t.status,
      tripId: t.trip.id,
      userId: t.user ? t.user.id : null,
    }));
  }

  /**
   * Crear los boletos de un viaje según su capacidad.
   * Solo se ejecuta una vez por viaje.
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
   * Body: { ticketId, userName, userEmail }
   */
  async reserveSeat(data: ReserveTicketDto): Promise<any> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id: data.ticketId },
      relations: ['trip', 'user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.AVAILABLE) {
      throw new BadRequestException('Seat is not available');
    }

    // Buscar o crear usuario por email
    let user = await this.usersRepository.findOne({
      where: { email: data.userEmail },
    });

    if (!user) {
      user = this.usersRepository.create({
        name: data.userName,
        email: data.userEmail,
        // passwordHash probablemente es nullable en tu entidad
        passwordHash: null ,
      });
      user = await this.usersRepository.save(user);
    }

    // Marcar boleto como reservado
    ticket.status = TicketStatus.RESERVED;
    ticket.user = user;
    ticket.boardingCode = generateBoardingCode();

    ticket.reservedAt = new Date();

    const saved = await this.ticketsRepository.save(ticket);

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

  /**
   * Devolver info “bonita” de varios boletos (para tu preview / PDF).
   * Recibe: lista de IDs de tickets ya reservados.
   */
  async previewTickets(ticketIds: number[]): Promise<any[]> {
    if (!ticketIds || ticketIds.length === 0) {
      throw new BadRequestException('No ticket IDs provided');
    }

    const tickets = await this.ticketsRepository.find({
      where: ticketIds.map((id) => ({ id })),
      relations: ['trip', 'trip.route', 'user'],
    });

    if (tickets.length === 0) {
      throw new NotFoundException('Tickets not found');
    }

    return tickets.map((t) => ({
      id: t.id,
      seatNumber: t.seatNumber,
      status: t.status,
      trip: {
        id: t.trip.id,
        date: t.trip.date,
        time: t.trip.time,
      },
      route: {
        id: t.trip.route.id,
        name: t.trip.route.name,
        origin: t.trip.route.origin,
        destination: t.trip.route.destination,
      },
      user: t.user
        ? {
            id: t.user.id,
            name: t.user.name,
            email: t.user.email,
          }
        : null,
    }));
  }
}
