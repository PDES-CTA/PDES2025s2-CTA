import { Buyer } from "./buyer";
import { CarOffer } from "./carOffer";

export interface Purchase {
  id: number;
  buyer: Buyer;
  carOffer: CarOffer;
  paymentMethod: string;
  observations?: string;
  purchaseStatus: string;
  purchaseDate: string;
  finalPrice: number;
}