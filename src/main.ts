import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Habilitar CORS para que el front (3000) pueda llamar al backend (4000)
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false, // si luego usas cookies, aquí iría true
  });

  await app.listen(process.env.PORT || 4000);
  console.log(`API escuchando en http://localhost:${process.env.PORT || 4000}`);
}
bootstrap();
