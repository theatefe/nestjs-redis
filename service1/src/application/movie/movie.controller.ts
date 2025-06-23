import {
  Controller,
  Post,
  Query,
  Req,
  HttpStatus,
  UseInterceptors,
  HttpException,
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
import { FileInterceptor } from '@nestjs/platform-express';
// Service ************************************************
import { MovieService } from './movie.service';
// DTO ****************************************************
import { MovieDto, SearchMovieDto } from '../../DTO/movie.dto';
import { CreateRatingDto } from '../../DTO/rating.dto'

@ApiTags('Redis Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }
  // search movies *********************************************************************************
  @ApiOperation({
    summary: 'جستجوی فیلم براساس ژانر',
  })
  @ApiOkResponse({
    description: 'لیست فیلم ها',
    type: [MovieDto],
  })
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async searchMovies(
    @Query() searchDto: SearchMovieDto
  ): Promise<MovieDto[]> {
    try {
      const movies = await this.movieService.searchMovies(searchDto);
      return movies;
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
    summary: 'امتیازدهی به فیلم',
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
    @Req() req
  ): Promise<boolean> {
    try {
      const userId = req.ip;
      await this.movieService.rateMovie(createRatingDto, userId);
      return true;
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
    summary: 'لیست فیلم‌های توصیه‌شده',
  })
  @ApiOkResponse({
    description: 'لیست فیلم‌ها',
    type: [MovieDto],
  })
  @Get('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Req() req): Promise<MovieDto[]> {
    try {
      const recommendations = await this.movieService.getRecommendations(req.ip);
      return recommendations;
    } catch (error) {
      throw new HttpException(
        `خطا در دریافت توصیه‌ فیلم ها: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
