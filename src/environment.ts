import * as dotenv from 'dotenv';

dotenv.config();

export const environment = {
  http_port: parseInt(process.env.HTTP_PORT || '3000', 10),
  http_body_limit: process.env.HTTP_BODY_LIMIT,
  exchanges: (process.env.EXCHANGES || '').split(','),
  sandbox_mode: (process.env.SANDBOX_MODE || '').toLowerCase() === 'true'
};
