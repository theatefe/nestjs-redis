import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieDataAcceess } from '../../dataAccess/movie.dataAccess';


@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST || '172.18.0.3',
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
        });
        await client.connect();
        console.log('✅ Redis client connected (provider)');
        return client;
      },
    },
    MovieService,
    MovieDataAcceess
  ],
  controllers: [MovieController],
  exports: [MovieService],
})
export class MovieModule { }
