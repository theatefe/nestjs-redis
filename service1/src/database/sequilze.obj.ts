import { SequelizeModule } from '@nestjs/sequelize';
import * as Models from '../models';
import { Op } from 'sequelize';

const allModels = [];
Object.keys(Models).forEach((model) => {
  allModels.push(Models[model]);
});
export default SequelizeModule.forRoot({
  storage: './my_db.sqlite',
  dialect: 'sqlite',
  autoLoadModels: true,
  synchronize: true,
  models: allModels,
  logging: true,
  define: {
    timestamps: false,
  },
});
