export abstract class BaseRepository {
    abstract save(field: string, value: any): Promise<boolean>;
    abstract get(field: string): Promise<any>;
    abstract getAll(): Promise<Record<string, any>>;
  }