import { IsNumber } from 'class-validator';

export class ReserveTicketDto {
  @IsNumber()
  tripId: number;

  @IsNumber()
  seatNumber: number;

  @IsNumber()
  userId: number;
}
