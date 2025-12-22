import Service from '../models/Service.js';

export const listServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ price: 1 }).lean();
    const data = services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration_minutes,
      price: service.price,
    }));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
