import express from 'express';
import multer from 'multer';
import { celebrate } from 'celebrate';

import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import { createSchema } from './validators/pointsValidator';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

// Items
routes.get('/items', itemsController.index);

// Points
routes.post(
  '/points',
  upload.single('image'),
  celebrate(
    {
      body: createSchema.body,
    },
    {
      abortEarly: false,
    }
  ),
  pointsController.create
);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;
