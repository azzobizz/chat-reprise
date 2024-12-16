import { ConversationService } from '../../core/services/ConversationService';
import { InMemoryRepository } from '../../core/repositories/InMemoryRepository';
import { Config } from '../../core/types';

describe('ConversationService', () => {
  let service: ConversationService;
  let repository: InMemoryRepository;
  let config: Config;

  beforeEach(() => {
    config = {
      fields: {
        firstname: {
          type: 'string',
          required: true,
          validation: {
            minLength: 2
          }
        },
        age: {
          type: 'number',
          required: true,
          validation: {
            min: 18,
            max: 120
          }
        },
        zipcode: {
          type: 'string',
          required: true,
          validation: {
            pattern: '^[0-9]{5}$'
          },
          external: {
            type: 'dealerApi',
            mapping: {
              dealers: 'dealers'
            }
          }
        }
      },
      conversation: {
        prompts: {
          default: 'Test prompt'
        },
        defaultOrder: ['firstname', 'age', 'zipcode']
      },
      storage: {
        type: 'inMemory',
        options: {}
      }
    };

    repository = new InMemoryRepository();
    service = new ConversationService(config, repository);
  });

  describe('processField', () => {
    it('should validate and save valid string input', async () => {
      const result = await service.processField('firstname', 'John');
      
      expect(result.isValid).toBe(true);
      expect(result.progress).toBe(33); // 1/3 fields completed
      
      const state = await service.getState();
      expect(state.data.firstname).toBe('John');
      expect(state.currentField).toBe('age');
    });

    it('should reject invalid string input', async () => {
      const result = await service.processField('firstname', 'J');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Valeur invalide');
      
      const state = await service.getState();
      expect(state.data.firstname).toBeUndefined();
    });

    it('should validate and save valid number input', async () => {
      await service.processField('firstname', 'John');
      const result = await service.processField('age', 25);
      
      expect(result.isValid).toBe(true);
      expect(result.progress).toBe(67); // 2/3 fields completed
      
      const state = await service.getState();
      expect(state.data.age).toBe(25);
      expect(state.currentField).toBe('zipcode');
    });

    it('should reject number out of range', async () => {
      const result = await service.processField('age', 15);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Valeur invalide');
    });

    it('should validate zipcode and fetch dealer data', async () => {
      await service.processField('firstname', 'John');
      await service.processField('age', 25);
      const result = await service.processField('zipcode', '75001');
      
      expect(result.isValid).toBe(true);
      expect(result.progress).toBe(100);
      expect(result.externalData).toBeDefined();
      
      const state = await service.getState();
      expect(state.data.zipcode).toBe('75001');
      expect(state.currentField).toBe('');
    });

    it('should reject invalid zipcode format', async () => {
      const result = await service.processField('zipcode', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Valeur invalide');
    });
  });

  describe('reset', () => {
    it('should reset the conversation state', async () => {
      await service.processField('firstname', 'John');
      await service.processField('age', 25);
      
      await service.reset();
      
      const state = await service.getState();
      expect(state.data).toEqual({});
      expect(state.completedFields).toEqual([]);
      expect(state.currentField).toBe('firstname');
    });
  });
});