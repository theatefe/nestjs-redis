import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// OBJ *******************
export function movieObj(file) {
  return {
    id: file.id,
    title: file.title,
    genre: file.genre,
  };
}

// CLASS *******************
export class MovieDto {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  genre: string;
}

export class SearchMovieDto{
  @ApiProperty({ type: String })
  genre: string;
}
