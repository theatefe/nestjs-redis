import { Module } from '@nestjs/common';
// Modules **************************************************
import { MovieModule } from './application/movie/movie.module';
// Sequelize **************************************************
import sequilzeObj from './database/sequilze.obj';

@Module({
  imports: [sequilzeObj, MovieModule],
  controllers: [],
  providers: [],
})
export class AppModule { }