import dotenv from 'dotenv';
import { cleanEnv, str, url } from 'envalid';

dotenv.config();

export const dbEnv = cleanEnv(process.env, {
  MONGODB_URI: url(),
  MONGODB_DB: str({ default: 'scorrer' }),
});


