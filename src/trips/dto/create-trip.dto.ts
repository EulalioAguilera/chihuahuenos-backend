import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTripDto {
  @IsNotEmpty()
  @IsString()
  date: string; // YYYY-MM-DD

  @IsNotEmpty()
  @IsString()
  time: string; // HH:mm

  @IsNumber()
  capacity: number;

  @IsNumber()
  routeId: number; // ID de la ruta a la que pertenece
}
