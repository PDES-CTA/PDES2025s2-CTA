import { Car } from './car';
import { Dealership } from './dealership';

export interface CarOffer {
  id: number;
  dealershipId: number;
  carId: number;
  dealership?: Dealership;
  car: Car;
  price: number;
  offerDate: string;
  dealershipNotes?: string;
  available: boolean;
}