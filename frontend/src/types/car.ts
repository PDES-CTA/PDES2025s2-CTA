import { FuelType, TransmissionType } from '../utils/carUtils';

export interface Car {
  id: number | string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  color: string;
  description?: string;
  publicationDate: string | Date;
  images?: string[];
}