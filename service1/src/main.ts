import { NestFactory } from '@nestjs/core';
//import 'dotenv/config';

import * as session from 'express-session';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerConfig from './config/swagger.json';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestExpressApplication } from '@nestjs/platform-express';
import pathes from './config/pathes';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      name: 'minio.ts',
      secret: '68yzNk6SQuPFY#WREFDF^&%TERGH765rtgfHJ%$ERFDF@#$!dg^5r%aALM1',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.useStaticAssets(pathes.staticFiles);
  app.setBaseViewsDir(pathes.viewFiles);
  app.setViewEngine('ejs');

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Powered-By', 'NestJs');
    res.setHeader('X-Developd-By', 'atefe hashemi');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });
  //const env = process.env.NODE_ENV.toLowerCase();
  const env = 'test'.toLowerCase();
  if (env === 'test') {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addTag(swaggerConfig.tag)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(3000);
}
bootstrap();
