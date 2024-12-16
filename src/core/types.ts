export interface Field {
    type: string;
    required: boolean;
    validation?: {
      type?: string;
      pattern?: string;
      minLength?: number;
      min?: number;
      max?: number;
    };
    external?: {
      type: string;
      mapping: Record<string, string>;
    };
    dependsOn?: string;
  }
  
  export interface Config {
    fields: Record<string, Field>;
    conversation: {
      prompts: Record<string, string>;
      defaultOrder: string[];
    };
    storage: {
      type: string;
      options: Record<string, any>;
    };
  }
  
  export interface ConversationState {
    currentField: string;
    completedFields: string[];
    data: Record<string, any>;
    externalData: Record<string, any>;
  }