import { Column, Table, Model, BelongsTo} from 'sequelize-typescript';
import Sequelize from 'sequelize';
// model ****************************
import {Movie} from './movie.model';

@Table({
  tableName: 'ratings',
  paranoid: true,
  comment: 'مدل امتیاز ها',
  deletedAt: 'deletedAt',
})
export class Rating extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  })
  id: number;

  @Column({
    type: Sequelize.INTEGER,
    allowNull: false,
  })
  movieId: number;

  @Column({
    type: Sequelize.INTEGER,
    allowNull: true,
  })
  userId: number;

  @Column({
    type: Sequelize.INTEGER,
    allowNull: false,
  })
  score: number;

  @Column({
    defaultValue: new Date(),
    allowNull: false,
    type: Sequelize.DATE,
  })
  createdAt: Date;

  @Column({
    defaultValue: new Date(),
    allowNull: false,
    type: Sequelize.DATE,
  })
  updatedAt: Date;

  @Column({
    allowNull: true,
    type: Sequelize.DATE,
  })
  deletedAt: Date;

  @BelongsTo(() => Movie, { foreignKey: 'movieId' })
  Movie: Movie;
}
