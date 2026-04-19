import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

let app;

export default async function handler(req, res) {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule);
    await nestApp.init();
    app = nestApp.getHttpAdapter().getInstance();
  }

  return app(req, res);
}