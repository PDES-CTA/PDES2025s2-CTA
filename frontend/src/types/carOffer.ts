import { Car } from './car';
import { Dealership } from './dealership';

export interface CarOffer {
  id: number;
  car: Car;
  dealership: Dealership;
  price: number;
  offerDate: string;
  dealershipNotes?: string;
  available: boolean;
}