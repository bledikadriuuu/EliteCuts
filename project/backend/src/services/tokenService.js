import jwt from 'jsonwebtoken';

const accessTtl = process.env.JWT_ACCESS_TTL || '1d';

export const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: accessTtl,
  });
