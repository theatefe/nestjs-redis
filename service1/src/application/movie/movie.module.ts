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
  controllers: [MovieController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        });
        await client.connect();
        console.log('✅ Redis client connected (movie module)');
        return client;
      },
    },
    MovieService,
    MovieDataAcceess
  ],
  exports: [MovieService],
})
export class MovieModule { }
