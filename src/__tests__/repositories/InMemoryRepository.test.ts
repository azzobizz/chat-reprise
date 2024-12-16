import { InMemoryRepository } from '../../core/repositories/InMemoryRepository';

describe('InMemoryRepository', () => {
  let repository: InMemoryRepository;

  beforeEach(() => {
    repository = new InMemoryRepository();
  });

  it('should save and retrieve data', async () => {
    await repository.save('test', 'value');
    const result = await repository.get('test');
    expect(result).toBe('value');
  });

  it('should retrieve all data', async () => {
    await repository.save('field1', 'value1');
    await repository.save('field2', 'value2');
    
    const result = await repository.getAll();
    
    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2'
    });
  });

  it('should return undefined for non-existent field', async () => {
    const result = await repository.get('nonexistent');
    expect(result).toBeUndefined();
  });
});