import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

// K6 options - FULL STRESS TEST
export const options: Options = {
  stages: [
    { duration: '1m', target: 30 },   // Warm up - creating base data
    { duration: '3m', target: 80 },   // Ramp up
    { duration: '5m', target: 150 },  // Peak load
    { duration: '2m', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // Relaxed for write operations
    http_req_failed: ['rate<0.15'],     // Allow 15% errors under stress
  },
};

const BASE_URL = 'http://localhost:8080/api';

// Interfaces
interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dni: number;
  role: string;
}

interface Dealership {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessName: string;
  cuit: string;
  address?: string;
  city?: string;
  province?: string;
  description?: string;
}

interface Car {
  id?: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  description?: string;
  images?: string[];
}

interface CarOffer {
  id?: number;
  carId: number;
  dealershipId: number;
  price: number;
  dealershipNotes?: string;
}

interface Favorite {
  id?: number;
  buyerId: number;
  carId: number;
  dateAdded: string;
  rating: number;
  comment: string;
  priceNotifications: boolean;
}

interface Purchase {
  buyerId: number;
  carOfferId: number;
  finalPrice: number;
  purchaseDate: string;
  purchaseStatus: string;
  paymentMethod: string;
  observations?: string;
}

// Helper functions
function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUser(): User {
  const randomId = randomString(8);
  return {
    email: `buyer_${randomId}@loadtest.com`,
    password: 'Test1234',
    firstName: `Buyer${randomId.substring(0, 4)}`,
    lastName: `Test${randomId.substring(4)}`,
    phone: `11${randomIntBetween(10000000, 99999999)}`,
    address: `Test Street ${randomIntBetween(1, 9999)}`,
    dni: randomIntBetween(10000000, 99999999),
    role: 'BUYER',
  };
}

function generateDealership(): Dealership {
  const randomId = randomString(8);
  return {
    email: `dealership_${randomId}@loadtest.com`,
    password: 'Dealer1234',
    firstName: `Dealer${randomId.substring(0, 4)}`,
    lastName: `Owner${randomId.substring(4)}`,
    phone: `11${randomIntBetween(10000000, 99999999)}`,
    businessName: `Dealership ${randomId.substring(0, 4).toUpperCase()}`,
    cuit: `20${randomIntBetween(10000000, 99999999)}9`,
    address: `Dealership St ${randomIntBetween(1, 999)}`,
    city: randomIntBetween(0, 1) === 0 ? 'Buenos Aires' : 'Rosario',
    province: 'Buenos Aires',
    description: `Load test dealership ${randomId}`,
  };
}

function generateCar(): Car {
  const brands = ['Toyota', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Renault', 'Peugeot', 'Honda', 'Nissan'];
  const models = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe'];
  const colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray'];
  const fuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  const transmissions = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC'];
  
  const brand = brands[randomIntBetween(0, brands.length - 1)];
  const model = models[randomIntBetween(0, models.length - 1)];
  
  return {
    brand,
    model,
    year: randomIntBetween(2020, 2025),
    color: colors[randomIntBetween(0, colors.length - 1)],
    fuelType: fuelTypes[randomIntBetween(0, fuelTypes.length - 1)],
    transmission: transmissions[randomIntBetween(0, transmissions.length - 1)],
    description: `Load test car: ${brand} ${model}`,
    images: [`https://example.com/car_${randomString(6)}.jpg`],
  };
}

// Admin login helper
function loginAsAdmin() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'admin@gmail.com',
      password: 'admin',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (res.status !== 200) {
    return null;
  }

  const loginData = res.json() as any;
  let token = loginData.token || res.headers['Authorization'];
  
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  return token;
}

// Main test function
export default function (): void {
  // Randomly decide what type of user to simulate
  const scenario = randomIntBetween(1, 100);

  if (scenario <= 10) {
    // 10% - Admin creates cars and offers
    runAdminScenario();
  } else if (scenario <= 20) {
    // 10% - Create and use new dealership
    runDealershipScenario();
  } else {
    // 80% - Regular buyer flow
    runBuyerScenario();
  }
}

// SCENARIO 1: Admin creates cars
function runAdminScenario(): void {
  const adminToken = loginAsAdmin();
  if (!adminToken) {
    console.log('Admin login failed');
    return;
  }

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  };

  // Create 2-4 new cars
  const numCars = randomIntBetween(2, 4);
  const createdCarIds: number[] = [];

  for (let i = 0; i < numCars; i++) {
    const newCar = generateCar();
    const res = http.post(
      `${BASE_URL}/cars`,
      JSON.stringify(newCar),
      authHeaders
    );

    if (check(res, { 'car created': (r) => r.status === 200 || r.status === 201 })) {
      const carData = res.json() as any;
      if (carData.id) {
        createdCarIds.push(carData.id);
      }
    }

    sleep(0.5);
  }

  console.log(`Admin created ${createdCarIds.length} cars`);
  sleep(2);
}

// SCENARIO 2: Dealership creates offers
function runDealershipScenario(): void {
  const newDealership = generateDealership();

  // Register dealership
  let res = http.post(
    `${BASE_URL}/dealerships`,
    JSON.stringify(newDealership),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (!check(res, { 'dealership registered': (r) => r.status === 200 || r.status === 201 })) {
    return;
  }

  const dealershipData = res.json() as any;
  const dealershipId = Array.isArray(dealershipData) ? dealershipData[0]?.id : dealershipData?.id;

  sleep(1);

  // Login as dealership
  res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: newDealership.email,
      password: newDealership.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (!check(res, { 'dealership logged in': (r) => r.status === 200 })) {
    return;
  }

  const loginData = res.json() as any;
  let token = loginData.token || res.headers['Authorization'];
  
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  sleep(1);

  // Get available cars
  res = http.get(`${BASE_URL}/cars`, authHeaders);
  const cars = (res.json() as unknown as Car[]) || [];

  if (cars.length === 0) {
    return;
  }

  // Create 1-3 offers
  const numOffers = randomIntBetween(1, 3);
  for (let i = 0; i < numOffers && i < cars.length; i++) {
    const randomCar = cars[randomIntBetween(0, cars.length - 1)];
    
    const offer: CarOffer = {
      carId: randomCar.id!,
      dealershipId: dealershipId,
      price: randomIntBetween(15000, 50000),
      dealershipNotes: `Load test offer from ${newDealership.businessName}`,
    };

    res = http.post(
      `${BASE_URL}/offer`,
      JSON.stringify(offer),
      authHeaders
    );

    check(res, { 'offer created': (r) => r.status === 200 || r.status === 201 });
    sleep(0.5);
  }

  console.log(`Dealership ${newDealership.businessName} created offers`);
  sleep(2);
}

// SCENARIO 3: Buyer full journey
function runBuyerScenario(): void {
  const newUser = generateUser();

  // 1. Register buyer
  let res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify(newUser),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (!check(res, { 'buyer registered': (r) => r.status === 200 || r.status === 201 })) {
    return;
  }

  sleep(1);

  // 2. Login
  res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: newUser.email,
      password: newUser.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (!check(res, { 'buyer logged in': (r) => r.status === 200 })) {
    return;
  }

  const loginData = res.json() as any;
  let token = loginData.token || res.headers['Authorization'];
  const buyerId = loginData.userId || loginData.id;
  
  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  sleep(1);

  // 3. Browse cars
  res = http.get(`${BASE_URL}/cars`, authHeaders);
  check(res, { 'cars loaded': (r) => r.status === 200 });
  const cars = (res.json() as unknown as Car[]) || [];

  if (cars.length === 0) {
    return;
  }

  sleep(1);

  // 4. Create favorites directly (not just add)
  const numFavorites = randomIntBetween(2, 4);
  const createdFavoriteIds: number[] = [];

  for (let i = 0; i < numFavorites && i < cars.length; i++) {
    const randomCar = cars[randomIntBetween(0, cars.length - 1)];
    
    const favorite: Favorite = {
      buyerId: buyerId,
      carId: randomCar.id!,
      dateAdded: new Date().toISOString().slice(0, 19),
      rating: randomIntBetween(0, 10),
      comment: `Load test review: ${randomString(30)}`,
      priceNotifications: false,
    };

    res = http.post(
      `${BASE_URL}/favorite`,
      JSON.stringify(favorite),
      authHeaders
    );

    if (check(res, { 'favorite created': (r) => r.status === 200 || r.status === 201 })) {
      console.log(`Buyer ${favorite.buyerId} created favorite for car ${favorite.carId}`);
      const favData = res.json() as any;
      if (favData.id) {
        createdFavoriteIds.push(favData.id);
      }
    }

    sleep(0.5);
  }

  sleep(1);

  // 5. Update some favorites with new reviews
  for (let i = 0; i < Math.min(2, createdFavoriteIds.length); i++) {
    const favId = createdFavoriteIds[i];
    
    res = http.put(
      `${BASE_URL}/favorite/${favId}`,
      JSON.stringify({
        rating: randomIntBetween(0, 10),
        comment: `Updated review: ${randomString(40)}`,
      }),
      authHeaders
    );

    if (check(res, { 'review updated': (r) => r.status === 200 })) {
      console.log(`Buyer ${buyerId} updated review for favorite ${favId}`);
    }
    sleep(0.5);
  }

  sleep(1);

  // 6. Search cars
  const brands = ['Toyota', 'Ford', 'Chevrolet', 'Volkswagen'];
  const randomBrand = brands[randomIntBetween(0, brands.length - 1)];
  
  res = http.get(`${BASE_URL}/cars/search?brand=${randomBrand}`, authHeaders);
  check(res, { 'search successful': (r) => r.status === 200 });

  sleep(1);

  // 7. Get available offers
  res = http.get(`${BASE_URL}/offer/available`, authHeaders);
  check(res, { 'offers loaded': (r) => r.status === 200 });
  const offers = (res.json() as unknown as any[]) || [];

  if (offers.length === 0) {
    return;
  }

  sleep(1);

  // 8. Create purchase
  const randomOffer = offers[randomIntBetween(0, offers.length - 1)];
  const paymentMethods = ['CREDIT_CARD', 'CASH', 'CHECK'];
  
  const purchase: Purchase = {
    buyerId: buyerId,
    carOfferId: randomOffer.id,
    finalPrice: randomOffer.price,
    purchaseDate: new Date().toISOString().slice(0, 19),
    purchaseStatus: 'PENDING',
    paymentMethod: paymentMethods[randomIntBetween(0, paymentMethods.length - 1)],
    observations: `Load test purchase by ${newUser.email}`,
  };

  res = http.post(
    `${BASE_URL}/purchases`,
    JSON.stringify(purchase),
    authHeaders
  );

  if (!check(res, { 'purchase created': (r) => r.status === 200 || r.status === 201 })) {
    return;
  }
  console.log(`Buyer ${buyerId} created purchase for offer ${randomOffer.id}`);

  const purchaseData = res.json() as any;
  const purchaseId = purchaseData.id;

  sleep(1);

  // 9. Randomly confirm, deliver, or cancel purchase
  const action = randomIntBetween(1, 3);
  
  if (action === 1) {
    // Confirm purchase
    res = http.patch(`${BASE_URL}/purchases/${purchaseId}/confirmed`, null, authHeaders);
    check(res, { 'purchase confirmed': (r) => r.status === 200 });
    console.log(`Purchase ${purchaseId} confirmed`);
  } else if (action === 2) {
    // Mark as delivered
    res = http.patch(`${BASE_URL}/purchases/${purchaseId}/delivered`, null, authHeaders);
    check(res, { 'purchase delivered': (r) => r.status === 200 });
    console.log(`Purchase ${purchaseId} delivered`);
  } else {
    // Cancel purchase
    res = http.patch(`${BASE_URL}/purchases/${purchaseId}/canceled`, null, authHeaders);
    check(res, { 'purchase cancelled': (r) => r.status === 200 });
    console.log(`Purchase ${purchaseId} cancelled`);
  }

  sleep(1);

  // 10. Get purchase history
  res = http.get(`${BASE_URL}/purchases/buyer/${buyerId}`, authHeaders);
  check(res, { 'purchases loaded': (r) => r.status === 200 });

  sleep(2);
}

export function teardown(data: unknown): void {
  console.log('🔥 COMPREHENSIVE STRESS TEST COMPLETED!');
  console.log('📊 Check your database for all created resources:');
  console.log('   - New buyers');
  console.log('   - New dealerships');
  console.log('   - New cars (created by admin)');
  console.log('   - New car offers');
  console.log('   - New favorites with reviews');
  console.log('   - New purchases (with various statuses)');
}