import {
  Controller,
  Post,
  Query,
  Req,
  HttpStatus,
  HttpException,
  Res,
  Get,
  Body,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';
// Service ************************************************
import { MovieService } from './movie.service';
// DTO ****************************************************
import { MovieDto, SearchMovieDto } from '../../DTO/movie.dto';
import { CreateRatingDto } from '../../DTO/rating.dto'

@ApiTags('Redis Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }
  // Genres List ***********************************************************************************
  @Get('genres')
  @ApiOperation({ summary: '📊 نمایش ژانرهای موجود و تعداد فیلم‌ها در هر ژانر' })
  @ApiOkResponse({
    description: 'آرایه‌ای از ژانرها و تعداد فیلم‌ها در هرکدام',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          genre: { type: 'string' },
          count: { type: 'number' }
        }
      }
    }
  })
  async getGenres(@Res() res: Response) {
    try {
      const result = await this.movieService.getGenreStats();
      res.status(200).json(result);
    } catch (error) {
      throw new HttpException(
        `خطا در دریافت ژانرها: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // search movies *********************************************************************************
  @ApiOperation({
    summary: '🔍 جستجوی فیلم براساس ژانر',
  })
  @ApiOkResponse({
    description: 'لیست فیلم ها',
    type: [MovieDto],
  })
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchMovies(
    @Query() searchDto: SearchMovieDto,
    @Res() res: Response,
  ): Promise<MovieDto[]> {
    try {
      const movies = await this.movieService.searchMovies(searchDto);
      res.status(200).json(movies);
      return;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error || 'خطا در جستجوی فیلم ها',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Rate Movies ************************************************************************************
  @ApiOperation({
    summary: '⭐ امتیازدهی به فیلم',
  })
  @ApiOkResponse({
    description: 'ثبت امتیاز',
    type: Boolean,
  })
  @ApiBody({
    description: 'داده‌های امتیازدهی',
    type: CreateRatingDto,
  })
  @Post('rate')
  @HttpCode(HttpStatus.OK)
  async rateMovie(
    @Body() createRatingDto: CreateRatingDto,
    @Req() req,
    @Res() res: Response,
  ): Promise<boolean> {
    try {
      const userId = req.ip;
      const result = await this.movieService.rateMovie(createRatingDto, userId);
      res.json(result);
      return;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: err || 'خطا در ثبت امتیاز',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Recommendations  ***********************************************************************************
  @ApiOperation({
    summary: '✨ فیلم‌های پیشنهادی مخصوص شما',
  })
  @ApiOkResponse({
    description: 'لیست فیلم‌ها',
    type: [MovieDto],
  })
  @Get('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Req() req, @Res() res: Response,): Promise<MovieDto[]> {
    try {
      const recommendations = await this.movieService.getRecommendations(req.ip);
      res.status(200).json(recommendations);
      return;
    } catch (error) {
      throw new HttpException(
        `خطا در دریافت توصیه‌ فیلم ها: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Trendding ***********************************************************************************************
  @Get('trending')
  @ApiOperation({ summary: '🔥 لیست فیلم‌های پربازدید و محبوب' })
  @ApiOkResponse({ description: 'لیست فیلم‌ها', type: [MovieDto] })
  async getTrendingMovies(@Res() res: Response): Promise<MovieDto[]> {
    try {
      const movies = await this.movieService.getMoviesByIds();
      res.status(200).json(movies);
      return movies;
    } catch (error) {
      throw new HttpException(
        `خطا در دریافت فیلم‌های پربازدید: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Recently Watched ******************************************************************************************
  @Get('recently-watched')
  @ApiOperation({ summary: '🎬 فیلم‌های اخیراً دیده‌شده توسط کاربر' })
  @ApiOkResponse({ description: 'لیست فیلم‌ها', type: [MovieDto], })
  async getRecentlyWatched(@Req() req, @Res() res: Response): Promise<MovieDto[]> {
    try {
      const userId = req.ip;
      const movies = await this.movieService.getRecentlyWatchedMovies(userId);
      res.status(200).json(movies);
      return movies;
    } catch (error) {
      throw new HttpException(
        `خطا در دریافت فیلم‌های اخیر: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}
