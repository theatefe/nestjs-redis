import { HttpException, HttpStatus, Injectable, Inject, OnModuleInit } from '@nestjs/common';
// Redis Dep ****************************************************
import { createClient } from 'redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
// DataAccess ****************************************************
import { MovieDataAcceess } from '../../dataAccess/movie.dataAccess';
// Dto ***********************************************************
import { MovieDto, movieObj, SearchMovieDto } from './../../DTO/movie.dto';
import { CreateRatingDto } from '../../DTO/rating.dto';

@Injectable()
export class MovieService implements OnModuleInit {
  private redisClient = createClient({
    socket: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT) },
  });

  constructor(
    private readonly movieDataAcceess: MovieDataAcceess,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeRedis();
  }
  // connect  to Redis ******************************************
  private async initializeRedis() {
    try {
      await this.redisClient.connect();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در اتصال به Redis',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // seed Data **************************************************
  async onModuleInit() {
    try {
      await this.seedData();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در بارگذاری داده‌های اولیه',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // search movies **********************************************
  async searchMovies(searchMovieDto: SearchMovieDto): Promise<MovieDto[]> {
    const { genre } = searchMovieDto;
    if (!genre) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'ژانر الزامی است',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const cacheKey = `movies:${genre}`;
    const cachedMovies = await this.cacheManager.get<MovieDto[]>(cacheKey);
    if (cachedMovies) {
      return cachedMovies;
    }
    try {
      const movies = await this.movieDataAcceess.findAll(genre);
      await this.cacheManager.set(cacheKey, movies, 600);
      return movies;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در جستجوی فیلم‌ها ' ,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Rate Movies ************************************************
  async rateMovie(createRatingDto: CreateRatingDto, userId: number): Promise<boolean> {
    const { movieId, score } = createRatingDto;
    if (score < 1 || score > 5) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'امتیاز باید بین 1 تا 5 باشد',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const movie = await this.movieDataAcceess.findById(movieId);
      if (!movie) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'فیلم موردنظر وجود ندارد',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.movieDataAcceess.createRate(userId, movieId, score);
      await this.cacheManager.del(`movies:${movie.genre}`);

      await this.redisClient.hSet(`user:${userId}:ratings`, movieId, score.toString());

      if (score > 4) {
        await this.redisClient.publish('popular_movies', JSON.stringify(movie));
      }

      return true;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در امتیازدهی',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Recommendations  *********************************************
  async getRecommendations(userId: number): Promise<MovieDto[]> {
    try {
      const userRatings = await this.redisClient.hGetAll(`user:${userId}:ratings`);
      const ratedMovieIds = Object.keys(userRatings);

      if (ratedMovieIds.length === 0) {
        return [];
      }

      const ratedMovies = await this.movieDataAcceess.findAllRateMovies(ratedMovieIds);
      const genres = [...new Set(ratedMovies.map((m) => m.genre))];

      const recommendations = await this.movieDataAcceess.getRecommendations(genres, ratedMovieIds);
      return recommendations.map((movie) => movieObj(movie));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در دریافت پیشنهاد فیلم ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Seeder **********************************************************
  async seedData() {
    try {
      const count = await this.movieDataAcceess.countMovies();
      if (count === 0) {
        const movies = [
          { id: '1', title: 'جدایی نادر از سیمین', genre: 'درام' },
          { id: '2', title: 'بچه‌های آسمان', genre: 'خانوادگی' },
          { id: '3', title: 'طعم گیلاس', genre: 'شاعرانه' },
          { id: '4', title: 'مارمولک', genre: 'کمدی' },
        ];
        await this.movieDataAcceess.seedMovies(movies);
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در بارگذاری داده‌های اولیه',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
