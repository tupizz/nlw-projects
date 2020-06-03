import { Request, Response } from 'express';

import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      response.status(400).json({ message: 'Point not found' });
    }

    const items = await knex('items')
      .select('title')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id);

    return response.json({ ...point, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const newPoint = {
      image: 'imagezoca',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    try {
      const insertedIds = await trx('points').insert(newPoint);

      const pointId = insertedIds[0];

      const pointItems = items.map((item_id: number) => ({
        item_id,
        point_id: pointId,
      }));

      await trx('point_items').insert(pointItems);

      await trx.commit();

      return response.json({ id: pointId, ...newPoint });
    } catch (error) {
      trx.rollback();

      return response.status(500).json({ message: error });
    }
  }
}

export default PointsController;
