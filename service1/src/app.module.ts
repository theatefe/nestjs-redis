import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import Keyv from 'keyv';
import KeyvRedis from 'keyv-redis';
// Modules **************************************************
import { MovieModule } from './application/movie/movie.module';
// Sequlize **************************************************
import sequilzeObj from './database/sequilze.obj';


@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      store: () => new Keyv({ store: new KeyvRedis(`${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`) }),
      isGlobal: true,
      ttl: 0,
    }),
    sequilzeObj,
    MovieModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ],
})
export class AppModule { }
