import { FuelType, TransmissionType } from '../utils/carUtils';

export interface Car {
  id: string | number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  color: string;
  available: boolean;
  description?: string;
  publicationDate: string | Date;
  images?: string[];
}