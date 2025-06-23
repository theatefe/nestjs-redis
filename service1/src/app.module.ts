import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import { MovieModule } from './application/movie/movie.module';
import sequilzeObj from './database/sequilze.obj';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST || 'redis',
    //   port: parseInt(process.env.REDIS_PORT) || 6379,
    // }),
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 20,
    // }),
    sequilzeObj, MovieModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
