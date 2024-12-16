import * as dotenv from 'dotenv';
import { createServer } from './api/server.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createServer();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});