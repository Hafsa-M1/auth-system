import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    
    // Copy ALL your global configurations from main.ts here
    app.enableCors();
    // app.useGlobalPipes(...);
    // app.useGlobalInterceptors(...);
    // app.useGlobalFilters(...);
    
    await app.init();
    cachedServer = expressApp;
  }
  cachedServer(req, res);
}