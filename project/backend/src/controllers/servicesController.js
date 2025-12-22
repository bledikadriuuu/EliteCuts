import Service from '../models/Service.js';
import { parseOrder, toServiceResponse } from '../utils/postgrest.js';

export const listServices = async (req, res, next) => {
  try {
    const sort = parseOrder(req.query.order);
    const services = await Service.find().sort(sort || undefined).lean();
    const data = services.map(toServiceResponse);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
