// src/frontends/inquirer/index.ts
import inquirer from 'inquirer';
import axios from 'axios';
import { config as appConfig } from '../../config/index.js';
import type { FieldName } from '../../types/config.js';

interface ConversationState {
  currentField: string;
  completedFields: string[];
  data: Record<string, any>;
  externalData: Record<string, any>;
}

export class InquirerFrontend {
  private apiUrl: string;

  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
  }

  private async getConversationState(): Promise<ConversationState> {
    const response = await axios.get(`${this.apiUrl}/api/conversation/state`);
    return response.data;
  }

  private async submitAnswer(field: string, value: any): Promise<any> {
    const response = await axios.post(`${this.apiUrl}/api/conversation/submit`, {
      field,
      value
    });
    return response.data;
  }

  private getQuestionType(field: FieldName): string {
    const fieldConfig = appConfig.fields[field];

    switch (fieldConfig.type) {
      case 'boolean':
        return 'confirm';
      case 'number':
        return 'number';
      default:
        return 'input';
    }
  }

  private getQuestionMessage(field: string, externalData?: any): string {
    const messages: Record<string, string> = {
      firstname: "Quel est votre prénom ?",
      lastname: "Quel est votre nom ?",
      zipcode: "Quel est votre code postal ?",
      dealerId: this.formatDealerQuestion(externalData),
      registration: "Quelle est votre plaque d'immatriculation ?",
      versionId: this.formatVersionQuestion(externalData),
      mileage: "Quel est le kilométrage actuel du véhicule ?",
      email: "Quelle est votre adresse email ?",
      phoneNumber: "Quel est votre numéro de téléphone ?",
      consent: "Acceptez-vous les conditions d'utilisation ?",
      satisfaction: "Sur une échelle de 0 à 10, quelle est votre satisfaction ?",
      recommendation: "Recommanderiez-vous notre service ?",
      feedback: "Avez-vous des commentaires à nous faire ?",
      suggestions: "Avez-vous des suggestions d'amélioration ?"
    };

    return messages[field] || `Veuillez renseigner ${field}`;
  }

  private formatDealerQuestion(externalData: any): string {
    if (!externalData?.dealers?.length) {
      return "Choisissez un concessionnaire :";
    }

    return "Voici les concessionnaires disponibles. Lequel choisissez-vous ?\n" +
      externalData.dealers.map((dealer: any) => 
        `${dealer.id}. ${dealer.name} - ${dealer.address}, ${dealer.city}`
      ).join('\n');
  }

  private formatVersionQuestion(externalData: any): string {
    if (!externalData?.versions?.length) {
      return "Choisissez une version :";
    }

    const vehicle = externalData;
    return `Nous avons identifié votre ${vehicle.make} ${vehicle.model}. Quelle version avez-vous ?\n` +
      vehicle.versions.map((version: any) => 
        `${version.id}. ${version.name}`
      ).join('\n');
  }

  private getChoices(field: string, externalData?: any): any[] {
    if (field === 'dealerId' && externalData?.dealers) {
      return externalData.dealers.map((dealer: any) => ({
        name: `${dealer.name} - ${dealer.address}, ${dealer.city}`,
        value: dealer.id
      }));
    }

    if (field === 'versionId' && externalData?.versions) {
      return externalData.versions.map((version: any) => ({
        name: version.name,
        value: version.id
      }));
    }

    if (appConfig.fields[field].type === 'boolean') {
      return [
        { name: 'Oui', value: true },
        { name: 'Non', value: false }
      ];
    }

    return [];
  }

  private async askQuestion(field: string, externalData?: any): Promise<any> {
    const questionType = this.getQuestionType(field as FieldName);
    const choices = this.getChoices(field, externalData);
    
    const question: any = {
      type: choices.length > 0 ? 'list' : questionType,
      name: field,
      message: this.getQuestionMessage(field, externalData),
    };

    if (choices.length > 0) {
      question.choices = choices;
    }

    if (field === 'satisfaction') {
      question.validate = (value: number) => {
        if (value >= 0 && value <= 10) return true;
        return 'Veuillez entrer un nombre entre 0 et 10';
      };
    }

    if (field === 'zipcode') {
      question.validate = (value: string) => {
        if (/^\d{5}$/.test(value)) return true;
        return 'Veuillez entrer un code postal valide (5 chiffres)';
      };
    }

    const answer = await inquirer.prompt([question]);
    return answer[field];
  }

  public async start(): Promise<void> {
    try {
      console.log('Bienvenue dans notre service de reprise de véhicule!\n');

      let isCompleted = false;
      while (!isCompleted) {
        const state = await this.getConversationState();
        
        if (!state.currentField) {
          console.log('\nMerci d\'avoir complété le formulaire!');
          isCompleted = true;
          break;
        }

        const value = await this.askQuestion(state.currentField, state.externalData[state.currentField]);
        
        try {
          const result = await this.submitAnswer(state.currentField, value);
          console.log(`\nProgression : ${result.progress}%\n`);

          if (result.externalData) {
            console.log('Données récupérées avec succès!\n');
          }
        } catch (error: any) {
          console.error('Erreur:', error.response?.data?.error || 'Une erreur est survenue');
        }
      }
    } catch (error) {
      console.error('Une erreur est survenue:', error);
    }
  }
}