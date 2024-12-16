export interface FieldValidation {
    type?: string;
    pattern?: string;
    minLength?: number;
    min?: number;
    max?: number;
  }
  
  export interface ExternalConfig {
    type: string;
    mapping: Record<string, string>;
  }
  
  export interface FieldConfig {
    type: string;
    required: boolean;
    validation?: FieldValidation;
    external?: ExternalConfig;
    dependsOn?: string;
  }
  
  export interface ConversationConfig {
    prompts: {
      default: string;
      formal: string;
    };
    defaultOrder: string[];
  }
  
  export interface StorageConfig {
    type: string;
    options: Record<string, any>;
  }
  
  export interface Config {
    fields: Record<string, FieldConfig>;
    conversation: ConversationConfig;
    storage: StorageConfig;
  }
  
  export type FieldName = keyof Config['fields'];