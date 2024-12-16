export interface DealerInfo {
  id: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  versions: Array<{
    id: number;
    name: string;
  }>;
}

const mockDealers: Record<string, DealerInfo[]> = {
  '75001': [
    {
      id: 1,
      name: 'Peugeot Paris Centre',
      address: '123 rue de Rivoli',
      city: 'Paris',
      zipCode: '75001'
    },
    {
      id: 2,
      name: 'Citroën Châtelet',
      address: '45 rue de la Verrerie',
      city: 'Paris',
      zipCode: '75001'
    }
  ]
};

const mockVehicles: Record<string, VehicleInfo> = {
  'AB123CD': {
    make: 'Peugeot',
    model: '2008',
    versions: [
      { id: 1, name: 'Turbo GTI 1.9' },
      { id: 2, name: 'GTI 2.1' }
    ]
  }
};

export class ExternalService {
  async getDealers(zipCode: string): Promise<DealerInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDealers[zipCode] || [];
  }

  async getVehicleInfo(registration: string): Promise<VehicleInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockVehicles[registration] || null;
  }
}