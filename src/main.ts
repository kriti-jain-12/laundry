import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ApiKeyGuard } from './utils/api.key.guard';
import * as path from 'path';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (!path.extname(req.path)) {
      const potentialHtmlFile = path.join(__dirname, '..', 'views', req.path + '.html');
      if (fs.existsSync(potentialHtmlFile)) {
        req.url += '.html';
      }
    }
    next();
  });
  expressApp.use(express.static(path.join(__dirname, '..', 'views')));

  app.use(helmet());
  app.useGlobalGuards(new ApiKeyGuard());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
