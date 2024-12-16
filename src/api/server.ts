// src/api/server.ts
import express from 'express';
import { json } from 'body-parser';
import { ConversationService } from '../core/services/ConversationService.js';
import { InMemoryRepository } from '../core/repositories/InMemoryRepository.js';
import { config } from '../config/index.js';

export const createServer = () => {
  const app = express();
  app.use(json());

  // Initialisation des services
  const repository = new InMemoryRepository();
  const conversationService = new ConversationService(config, repository);

  // Middleware pour gérer les erreurs
  const errorHandler = (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Une erreur est survenue' });
  };

  // Middleware pour vérifier le token d'authentification
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['x-api-token'];
    
    if (!token || token !== process.env.API_TOKEN) {
      res.status(401).json({ error: 'Non autorisé' });
      return;
    }
    
    next();
  };

  // Routes
  app.post('/api/config', authMiddleware, async (_req, res) => {
    try {
      res.json({ message: 'Configuration mise à jour' });
    } catch (error) {
      res.status(400).json({ error: 'Configuration invalide' });
    }
  });

  app.get('/api/conversation/state', async (_req, res) => {
    try {
      const state = await conversationService.getState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'état' });
    }
  });

  app.post('/api/conversation/submit', async (req, res) => {
    try {
      const { field, value } = req.body;

      if (!field) {
        res.status(400).json({ error: 'Le champ "field" est requis' });
        return;
      }

      const result = await conversationService.processField(field, value);

      if (!result.isValid) {
        res.status(400).json({
          error: result.message,
          progress: result.progress
        });
        return;
      }

      res.json({
        message: result.message,
        progress: result.progress,
        externalData: result.externalData
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du traitement des données' });
    }
  });

  app.post('/api/conversation/reset', async (_req, res) => {
    try {
      await conversationService.reset();
      res.json({ message: 'Conversation réinitialisée' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
    }
  });

  app.get('/api/conversation/data', async (_req, res) => {
    try {
      const data = await repository.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  });

  app.use(errorHandler);

  return app;
};