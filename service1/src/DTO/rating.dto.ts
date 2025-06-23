import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// OBJ *******************
export function ratingObj(file) {
  return {
    id: file.id,
    movieId: file.movieId,
    userId: file.userId,
    score: file.score,
  };
}

// CLASS *******************
export class RatingDto {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  movieId: number;

  @ApiProperty({ type: Number })
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  score: number;
}

export class CreateRatingDto {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  movieId: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  score: number;
}
