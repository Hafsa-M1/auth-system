import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

let cachedApp: any;

async function createNestApp() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    await app.init();
    cachedApp = server;
  }

  return cachedApp;
}

export default async function handler(req, res) {
  const app = await createNestApp();
  return app(req, res);
}