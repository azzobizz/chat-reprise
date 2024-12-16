import { BaseRepository } from './BaseRepository';

export class InMemoryRepository extends BaseRepository {
  private data: Record<string, any> = {};

  async save(field: string, value: any): Promise<boolean> {
    this.data[field] = value;
    return true;
  }

  async get(field: string): Promise<any> {
    return this.data[field];
  }

  async getAll(): Promise<Record<string, any>> {
    return { ...this.data };
  }
}