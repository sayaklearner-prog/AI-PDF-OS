import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Secure cross-origin requests from frontend Next.js app
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const port = process.env.PORT ?? 3001; // Avoid colliding with Next.js default port
  await app.listen(port);
  console.log(`PDF OS NestJS backend running on: http://localhost:${port}`);
}
bootstrap();
