import { Buyer } from "./buyer";
import { Car } from "./car";

export interface FavoriteCarCreateRequest {
  buyerId: string | number;
  carId: string | number;
  dateAdded: string; // ISO format: "yyyy-MM-dd'T'HH:mm:ss"
  rating: number; // 0-10
  comment: string;
  priceNotifications?: boolean;
}

export interface FavoriteCarUpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface Favorite {
  id: number | string;
  car: Car;
  buyer: Buyer;
  dateAdded: string;
  rating: number;
  comment: string | null;
  priceNotifications: boolean;
}