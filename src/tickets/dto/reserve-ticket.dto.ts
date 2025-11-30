import { IsEmail, IsNumber, IsString } from 'class-validator';

export class ReserveTicketDto {
  @IsNumber()
  ticketId: number;

  @IsString()
  userName: string;

  @IsEmail()
  userEmail: string;
}
