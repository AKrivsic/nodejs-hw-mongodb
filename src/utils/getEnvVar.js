import dotenv from 'dotenv';
dotenv.config();

export function getEnvVar(name, defaultValue) {
  const v = process.env[name];
  if (v !== undefined && v !== '') return v;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing: process.env['${name}']`);
}
