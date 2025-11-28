import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Ej: "Oaxaca - Puebla"

  @Column({ length: 50 })
  origin: string; // Ej: "Oaxaca"

  @Column({ length: 50 })
  destination: string; // Ej: "Puebla"

  @Column({ default: true })
  isActive: boolean;
}
