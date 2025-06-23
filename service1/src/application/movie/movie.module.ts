import { Module } from '@nestjs/common';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieDataAcceess } from '../../dataAccess/movie.dataAccess';

@Module({
  imports: [CacheModule.register({ isGlobal: false })],
  controllers: [MovieController],
  providers: [
    MovieService,
    MovieDataAcceess,
    { provide: CACHE_MANAGER, useFactory: () => CacheModule },
  ],
  exports: [MovieService, MovieDataAcceess],
})
export class MovieModule { }
