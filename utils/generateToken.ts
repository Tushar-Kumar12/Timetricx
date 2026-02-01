import jwt from 'jsonwebtoken';

export const generateToken = (payload: object, expiresIn: string = '7d'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  return jwt.verify(token, secret);
};
