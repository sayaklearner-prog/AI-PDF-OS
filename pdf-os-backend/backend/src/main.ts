import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Secure cross-origin requests from frontend Next.js app
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const port = process.env.PORT ?? 3001; // Avoid colliding with Next.js default port
  await app.listen(port);
  console.log(`PDF OS NestJS backend running on: http://localhost:${port}`);
}
bootstrap();
