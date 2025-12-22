import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signupSchema, loginSchema, createBarberSchema } from '../utils/validation.js';
import { signAccessToken } from '../services/tokenService.js';

const buildUserResponse = (user) => ({
  id: user.id,
  role: user.role,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt?.toISOString(),
});

export const signup = async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      role: 'user',
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
    });

    const accessToken = signAccessToken(user);

    res.status(201).json({
      user: buildUserResponse(user),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ email: parsed.data.email });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!matches) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const accessToken = signAccessToken(user);

    res.json({
      user: buildUserResponse(user),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const createBarber = async (req, res, next) => {
  try {
    const setupSecret = req.header('x-setup-secret') || req.body?.setupSecret;
    if (!process.env.SETUP_SECRET) {
      const error = new Error('Setup secret not configured');
      error.status = 500;
      throw error;
    }

    if (setupSecret !== process.env.SETUP_SECRET) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const parsed = createBarberSchema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error('Invalid request');
      error.status = 400;
      throw error;
    }

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      role: 'barber',
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
    });

    res.status(201).json({
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    res.json(buildUserResponse(user));
  } catch (error) {
    next(error);
  }
};
