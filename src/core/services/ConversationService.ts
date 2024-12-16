import { Config, ConversationState } from '../types.js';
import { BaseRepository } from '../repositories/BaseRepository.js';
import { ExternalService } from './ExternalService.js';

export class ConversationService {
  private config: Config;
  private repository: BaseRepository;
  private externalService: ExternalService;
  private state: ConversationState;

  constructor(config: Config, repository: BaseRepository) {
    this.config = config;
    this.repository = repository;
    this.externalService = new ExternalService();
    this.state = this.getInitialState();
  }

  private getInitialState(): ConversationState {
    return {
      currentField: this.config.conversation.defaultOrder[0],
      completedFields: [],
      data: {},
      externalData: {}
    };
  }

  async getState(): Promise<ConversationState> {
    return { ...this.state };
  }

  async reset(): Promise<void> {
    this.state = this.getInitialState();
  }

  async processField(field: string, value: any): Promise<{
    isValid: boolean;
    progress: number;
    message?: string;
    externalData?: any;
  }> {
    const fieldConfig = this.config.fields[field];
    
    if (!fieldConfig) {
      return {
        isValid: false,
        progress: this.calculateProgress(),
        message: "Champ inconnu"
      };
    }

    // Validation
    const isValid = await this.validateField(field, value);
    if (!isValid) {
      return {
        isValid: false,
        progress: this.calculateProgress(),
        message: "Valeur invalide"
      };
    }

    // Sauvegarde
    await this.repository.save(field, value);
    this.state.data[field] = value;

    // Gestion des appels externes
    let externalData = null;
    if (fieldConfig.external) {
      switch (fieldConfig.external.type) {
        case 'dealerApi':
          if (field === 'zipcode') {
            externalData = await this.externalService.getDealers(value);
          }
          break;
        case 'vehicleApi':
          if (field === 'registration') {
            externalData = await this.externalService.getVehicleInfo(value);
          }
          break;
      }
      if (externalData) {
        this.state.externalData[field] = externalData;
      }
    }
    
    if (!this.state.completedFields.includes(field)) {
      this.state.completedFields.push(field);
    }

    // Calcul du prochain champ
    this.state.currentField = this.getNextField();

    return {
      isValid: true,
      progress: this.calculateProgress(),
      message: "OK",
      externalData
    };
  }

  private async validateField(field: string, value: any): Promise<boolean> {
    const fieldConfig = this.config.fields[field];
    
    if (!fieldConfig) {
      return false;
    }

    // Validation du type
    if (typeof value !== fieldConfig.type) {
      return false;
    }

    // Validation spécifique
    if (fieldConfig.validation) {
      if (fieldConfig.validation.pattern) {
        const regex = new RegExp(fieldConfig.validation.pattern);
        if (!regex.test(String(value))) {
          return false;
        }
      }

      if (fieldConfig.validation.minLength && String(value).length < fieldConfig.validation.minLength) {
        return false;
      }

      if (fieldConfig.validation.min !== undefined && value < fieldConfig.validation.min) {
        return false;
      }

      if (fieldConfig.validation.max !== undefined && value > fieldConfig.validation.max) {
        return false;
      }
    }

    return true;
  }

  private calculateProgress(): number {
    const totalFields = Object.keys(this.config.fields).length;
    return Math.round((this.state.completedFields.length / totalFields) * 100);
  }

  private getNextField(): string {
    const order = this.config.conversation.defaultOrder;
    const currentIndex = order.indexOf(this.state.currentField);
    
    if (currentIndex === -1 || currentIndex === order.length - 1) {
      return '';
    }

    return order[currentIndex + 1];
  }
}
