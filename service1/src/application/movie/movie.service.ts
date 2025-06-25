import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
// Redis Dep ****************************************************
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';
// DataAccess ****************************************************
import { MovieDataAcceess } from '../../dataAccess/movie.dataAccess';
// Dto ***********************************************************
import { MovieDto, movieObj, SearchMovieDto } from './../../DTO/movie.dto';
import { CreateRatingDto } from '../../DTO/rating.dto';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieDataAcceess: MovieDataAcceess,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // (برای استفاده از کش بدون دستورات ردیس)یک اینترفیس سطح بالا برای کار با حافظه کش
    @Inject('REDIS_CLIENT') private redisClient: RedisClientType,// یک کلاینت مستقیم ردیس که به سرور وصل میشه و کنترل کامل را در دسترس میزاره
  ) { }
  // Seeder **********************************************************
  // خوراک دیتابیس  *************************************************
  async seedData() {
    try {
      const count = await this.movieDataAcceess.countMovies();
      if (count === 0) {
        const movies = [
          { id: '1', title: 'جدایی نادر از سیمین', genre: 'درام' },
          { id: '2', title: 'بچه‌های آسمان', genre: 'خانوادگی' },
          { id: '3', title: 'طعم گیلاس', genre: 'شاعرانه' },
          { id: '4', title: 'مارمولک', genre: 'کمدی' },
          { id: '5', title: 'ابد و یک روز', genre: 'درام' },
          { id: '6', title: 'درباره الی', genre: 'معمایی' },
          { id: '7', title: 'قیصر', genre: 'جنایی' },
          { id: '8', title: 'مهمان مامان', genre: 'خانوادگی' },
          { id: '9', title: 'خانه دوست کجاست؟', genre: 'شاعرانه' },
          { id: '10', title: 'اخراجی‌ها', genre: 'کمدی' },
          { id: '11', title: 'شبی که ماه کامل شد', genre: 'عاشقانه' },
          { id: '12', title: 'وارونگی', genre: 'اجتماعی' },
          { id: '13', title: 'The Godfather', genre: 'جنایی' },
          { id: '14', title: 'Inception', genre: 'علمی‌تخیلی' },
          { id: '15', title: 'Forrest Gump', genre: 'درام' },
          { id: '16', title: 'Interstellar', genre: 'علمی‌تخیلی' },
          { id: '17', title: 'Titanic', genre: 'عاشقانه' },
          { id: '18', title: 'The Shawshank Redemption', genre: 'درام' },
          { id: '19', title: 'Joker', genre: 'روانشناختی' },
          { id: '20', title: 'Parasite', genre: 'هیجانی' },
          { id: '21', title: 'The Matrix', genre: 'اکشن' },
          { id: '22', title: 'The Silence of the Lambs', genre: 'ترسناک' },
          { id: '23', title: 'The Pursuit of Happyness', genre: 'الهام‌بخش' },
          { id: '24', title: 'Gladiator', genre: 'تاریخی' }
        ];
        // اضافه کردن اطلاعات فیلم ها به دیتابیس
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
  // seed Data **************************************************
  // اجرای اتوماتیک سیدر به محض اجرای پروژه ******************
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
  // List Genre *************************************************
  // لیست ژانرهای موجود در پلتفرم *****************************
  async getGenreStats() {
    const cacheKey = 'genre_stats';

    // چک کردن کش
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    // خواندن از دیتابیس
    const stats = await this.movieDataAcceess.countMoviesByGenre();
    // ذخیره در کش برای ۵ دقیقه
    await this.cacheManager.set(cacheKey, stats, 300);
    return stats;
  }
  // search movies **********************************************
  // پیدا کردن فیلم براساس ژانر ********************************
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

    const cacheKey = `movies:${genre}`; // ساخت کلیدواژه براساس ژانر وارد شده
    const cachedMovies = await this.cacheManager.get(cacheKey); // در حافشه کش دنبال دیتایی با کلیدواژه ساخته شده میگردد
    if (cachedMovies) { // اگر پیدا شد آن را از کش برمیگرداند و اتصالی به دیتابیس نمیزند
      return cachedMovies as MovieDto[];
    }
    
    try {
      // اگر دیتا در حافظه کش نباشد، لیست اطلاعات را براساس ژانر از دیتابیس میخواند و بعد از ذخیره در کش آن را برمیگرداند
      const movies = await this.movieDataAcceess.findAll(genre);
      // در صورتی که مجددا کلیدواژه تکرار شود، برنامه آن را از کش میخواند و واکشی از دیتابیس اتفاق نمی افتد
      await this.cacheManager.set(cacheKey, movies);
      // ✔ افزودن به محبوب‌ترین‌ها
      for (const movie of movies) {
        await this.redisClient.zIncrBy('trending_movies', 1, String(movie.id));
      }
      return movies;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'خطا در جستجوی فیلم‌ها ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Rate Movies ************************************************
  // امتیاز دادن به فیلم **************************************
  async rateMovie(createRatingDto: CreateRatingDto, userId: number) {
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

      await this.movieDataAcceess.createRate(userId, movieId, score); // ذخیره‌ی امتیاز کاربر برای یک فیلم خاص در دیتابیس
      await this.cacheManager.del(`movies:${movie.genre}`); // اگر فیلم‌هایی از این ژانر توی کش بودند، چون یک فیلمش تازه ریت گرفته، کش باید بی‌اعتبار بشه تا بعداً اطلاعات تازه‌سازی بشه.

      await this.redisClient.hSet(`user:${userId}:ratings`, movieId, score.toString()); //ذخیره‌ی امتیاز در Redis به صورت hash

      if (score > 4) {
        await this.redisClient.publish('popular_movies', JSON.stringify(movie)); // اگر کاربر امتیاز بالا (بیشتر از ۴) به فیلم داده، پیام مربوط به اون فیلم رو در کانال Redis با نام popular_movies منتشر می‌کنیم.
      }
      // ذخیره در لیست اخیرا دیده شده ها
      await this.redisClient.lPush(`user:${userId}:recently_watched`, movieId.toString());
      await this.redisClient.lTrim(`user:${userId}:recently_watched`, 0, 9); // فقط ۱۰ مورد آخر نگه می‌داره
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
  // توصیه شده ها ************************************************
  async getRecommendations(userId: number): Promise<MovieDto[]> {
    try {
      const userRatings = await this.redisClient.hGetAll(`user:${userId}:ratings`); //این خط از Redis مقدار همه امتیازهای کاربر رو به‌صورت hash می‌گیره.
      const ratedMovieIds = Object.keys(userRatings); // گرفتن ID فیلم‌هایی که کاربر بهشون امتیاز داده

      if (ratedMovieIds.length === 0) { // اگر هیچ فیلمی تا حالا امتیاز داده نشده باشه، چیزی برای پیشنهاد نداریم، پس یه آرایه‌ی خالی برمی‌گردونه.
        return [];
      }

      const ratedMovies = await this.movieDataAcceess.findAllRateMovies(ratedMovieIds); //این متد به دیتابیس می‌ره و اطلاعات کامل فیلم‌هایی که user امتیاز داده رو برمی‌گردونه (نه فقط id)
      const genres = [...new Set(ratedMovies.map((m) => m.genre))]; //ژانرهای تکراری حذف می‌شن و فقط ژانرهایی که user بهشون علاقه نشون داده باقی می‌مونه

      const recommendations = await this.movieDataAcceess.getRecommendations(genres, ratedMovieIds); //فیلم‌هایی با ژانر مشابه (درام، کمدی) پیدا می‌کنه
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
  // Trending *********************************************************
  // ترندترین فیلم ها ************************************************
  async getMoviesByIds(): Promise<MovieDto[]> {
    const topMovieIds = await this.redisClient.zRange('trending_movies', 0, 9, { REV: true }); //  خط از Sorted Set با نام trending_movies در Redis، ۱۰ آیتم اول را بر اساس بیشترین مقدار (امتیاز) برمی‌گرداند.
    return this.movieDataAcceess.findAllRateMovies(topMovieIds);
  }
  // Recently Watched *************************************************
  // اخیرا دیده شده ها ***********************************************
  async getRecentlyWatchedMovies(userId): Promise<MovieDto[]> {
    const movieIds = await this.redisClient.lRange(`user:${userId}:recently_watched`, 0, -1); //گرفتن لیست تعاملات اخیر یک کاربر
    return this.movieDataAcceess.findAllRateMovies(movieIds);
  }
}
