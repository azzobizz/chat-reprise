import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.API_TOKEN = 'test-token';
process.env.PORT = '3001';

