import dotenv from 'dotenv';

dotenv.config();

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
};

export const validateSecurityConfig = () => {
  getJwtSecret();
};
