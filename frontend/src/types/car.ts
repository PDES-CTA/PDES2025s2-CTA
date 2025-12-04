export interface Car {
  id?: number | string;
  brand: string;
  model: string;
  year: number;
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'GNC';
  transmission: 'MANUAL' | 'AUTOMATIC' | 'SEMI_AUTOMATIC';
  color: string;
  description?: string;
  publicationDate?: string | Date;
  images?: string[];
}