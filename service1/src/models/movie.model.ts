import { Column, Table, Model,HasMany  } from 'sequelize-typescript';
import Sequelize from 'sequelize';
// model ***************************
import {Rating} from './rating.model';

@Table({
  tableName: 'movies',
  paranoid: true,
  comment: 'مدل فیلم ها',
  deletedAt: 'deletedAt',
})
export class Movie extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  })
  id: number;

  @Column({
    type: Sequelize.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: Sequelize.STRING,
    allowNull: false,
  })
  genre: string;

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

  @HasMany(() => Rating, { foreignKey: 'movieId' })
  Ratings: Rating[];
}
