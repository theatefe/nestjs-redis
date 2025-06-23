import * as Models from '../models/index';
import { Sequelize, Op } from 'sequelize';

export class MovieDataAcceess {
  // یافتن تمام فیلم ها با ژانر ********************
  async findAll(genre) {
    const movies = await Models.Movie.findAll({
      where: {
        genre,
      },
      attributes: ['id', 'title', 'genre'],
    });
    return movies;
  }
  // یافتن فیلم با آیدی  *************************
  async findById(id: number) {
    return await Models.Movie.findByPk(id);
  }
  // ثبت امتیاز ***********************************
  async createRate(userId: number, movieId: number, score: number) {
    const rate = await Models.Rating.upsert({
      userId,
      movieId,
      score
    });
    return rate;
  }
  // اضافه کردن دیتای فیلم ها به مدل ***************
  async seedMovies(movies) {
    await Models.Movie.bulkBuild(movies);
  }
  // یافتن تعداد فیلم های موجود در دیتابیس **********
  async countMovies() {
    return await Models.Movie.count();
  }
  // یافتن تمام فیلم ها با آیدی   ********************
  async findAllRateMovies(ratedMovieIds) {
    return await Models.Movie.findAll({
      where: { id: ratedMovieIds },
      attributes: ['genre'],
    })
  }
  // یافتن تمام فیلم های پیشنهادی ***********************
  async getRecommendations(genres, ratedMovieIds) {
    return await Models.Movie.findAll({
      where: {
        genre: genres,
        id: { [Op.notIn]: ratedMovieIds },
      },
      attributes: ['id', 'title', 'genre'],
    })
  }
}
