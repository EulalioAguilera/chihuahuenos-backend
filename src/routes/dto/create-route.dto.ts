import { IsBoolean, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateRouteDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @MaxLength(50)
  origin: string;

  @IsNotEmpty()
  @MaxLength(50)
  destination: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
