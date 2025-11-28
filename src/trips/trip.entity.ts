import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Route } from 'src/routes/route.entity';

@Entity()
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // "2025-12-25"

  @Column()
  time: string; // "14:30"

  @Column({ default: 40 })
  capacity: number; // número de asientos

  @ManyToOne(() => Route)
  route: Route;
}
