// src/config/index.ts
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Config } from '../types/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadConfig = (): Config => {
  const configPath = join(__dirname, 'conversation.json');
  const configFile = readFileSync(configPath, 'utf-8');
  return JSON.parse(configFile) as Config;
};

export const config = loadConfig();