import { FuelType, TransmissionType } from '../utils/carUtils';

export interface Car {
  id: number | string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  color: string;
  available: boolean;
  description?: string;
  publicationDate: string | Date;
  images?: string[];
}