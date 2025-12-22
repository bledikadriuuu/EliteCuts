import Appointment from '../models/Appointment.js';

const buildSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 20 && minute > 0) {
        continue;
      }
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
};

export const getAvailability = async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!date) {
      const error = new Error('Date is required');
      error.status = 400;
      throw error;
    }

    const [year, month, day] = date.split('-').map(Number);
    const today = new Date();
    const selectedDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const isToday =
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      day === today.getDate();

    const query = {
      date,
      status: { $ne: 'CANCELED' },
    };

    if (req.query.excludeId) {
      query._id = { $ne: req.query.excludeId };
    }

    const booked = await Appointment.find(query)
      .select('time -_id')
      .lean();

    const bookedSet = new Set(booked.map((item) => item.time));
    const now = new Date();
    const availableTimes = buildSlots().filter((time) => {
      if (selectedDay < todayStart) {
        return false;
      }
      if (bookedSet.has(time)) {
        return false;
      }
      if (!isToday) {
        return true;
      }
      const [hour, minute] = time.split(':').map(Number);
      const slot = new Date(year, month - 1, day, hour, minute, 0, 0);
      return slot > now;
    });

    res.json({ date, availableTimes });
  } catch (error) {
    next(error);
  }
};
