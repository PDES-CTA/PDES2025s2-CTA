export interface Dealership {
  id: number;
  businessName: string;
  cuit: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  registrationDate: string;
  active: boolean;
  description?: string;
}