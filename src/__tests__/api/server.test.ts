import request from 'supertest';
import { createServer } from '../../api/server';

describe('API Server', () => {
  const app = createServer();

  describe('POST /api/conversation/submit', () => {
    it('should accept valid field submission', async () => {
      const response = await request(app)
        .post('/api/conversation/submit')
        .send({
          field: 'firstname',
          value: 'John'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('progress');
      expect(response.body.message).toBe('OK');
    });

    it('should reject invalid field submission', async () => {
      const response = await request(app)
        .post('/api/conversation/submit')
        .send({
          field: 'firstname',
          value: 'J'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing field parameter', async () => {
      const response = await request(app)
        .post('/api/conversation/submit')
        .send({
          value: 'test'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Le champ "field" est requis');
    });
  });

  describe('GET /api/conversation/state', () => {
    it('should return current conversation state', async () => {
      const response = await request(app)
        .get('/api/conversation/state');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentField');
      expect(response.body).toHaveProperty('completedFields');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/conversation/reset', () => {
    it('should reset the conversation', async () => {
      // First submit some data
      await request(app)
        .post('/api/conversation/submit')
        .send({
          field: 'firstname',
          value: 'John'
        });

      // Then reset
      const response = await request(app)
        .post('/api/conversation/reset');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conversation réinitialisée');

      // Verify state is reset
      const stateResponse = await request(app)
        .get('/api/conversation/state');

      expect(stateResponse.body.data).toEqual({});
      expect(stateResponse.body.completedFields).toEqual([]);
    });
  });

  describe('GET /api/conversation/data', () => {
    it('should return all collected data', async () => {
      // Submit some data first
      await request(app)
        .post('/api/conversation/submit')
        .send({
          field: 'firstname',
          value: 'John'
        });

      const response = await request(app)
        .get('/api/conversation/data');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstname', 'John');
    });
  });
});