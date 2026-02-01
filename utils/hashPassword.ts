import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const generateSalt = async (): Promise<string> => {
  return await bcrypt.genSalt(12);
};
