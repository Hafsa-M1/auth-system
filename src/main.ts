import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

export async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // IMPORTANT for Postman + frontend requests
  app.enableCors();

  await app.init();
  return expressApp;
}

// THIS IS CRITICAL FOR VERCEL - Serverless handler
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  cachedServer(req, res);
}

// Only run locally, not on Vercel
if (!process.env.VERCEL) {
  bootstrap().then((app) => {
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      console.log(`Application is running on port ${port}`);
    });
  });
}
