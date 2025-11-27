package cta.config.init

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import cta.model.Admin
import cta.model.Buyer
import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.model.FavoriteCar
import cta.model.Purchase
import cta.repository.CarOfferRepository
import cta.repository.CarRepository
import cta.repository.FavoriteCarRepository
import cta.repository.PurchaseRepository
import cta.repository.UserRepository
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDateTime

@Component
@Profile("!test")
class DataInitializer(
    private val userRepository: UserRepository,
    private val carRepository: CarRepository,
    private val carOfferRepository: CarOfferRepository,
    private val passwordEncoder: PasswordEncoder,
    private val favoriteCarRepository: FavoriteCarRepository,
    private val purchaseRepository: PurchaseRepository,
) {
    @PostConstruct
    fun initDatabase() {
        initUsers()
        initCars()
        initCarOffers()
        initFavorites()
        initPurchases()
    }

    private fun initUsers() {
        if (userRepository.count() > 0L) return

        val admin =
            Admin.create(
                email = "admin@gmail.com",
                password = passwordEncoder.encode("admin"),
                firstName = "Admin",
                lastName = "User",
                phone = "1100000000",
            )

        val buyer1 =
            Buyer.create(
                email = "alan@gmail.com",
                password = passwordEncoder.encode("Alan1234"),
                firstName = "Alan",
                lastName = "Pacheco",
                phone = "1112345678",
                address = "User Street 123",
                dni = 12345678,
            )

        val buyer2 =
            Buyer.create(
                email = "franco@gmail.com",
                password = passwordEncoder.encode("Franco1234"),
                firstName = "Franco",
                lastName = "Marengo",
                phone = "1112345678",
                address = "Other Street 123",
                dni = 87654321,
            )

        val dealership1 =
            Dealership().apply {
                email = "premiumcar@gmail.com"
                password = passwordEncoder.encode("Premiumcar1234")
                firstName = "Carlos"
                lastName = "Rodríguez"
                phone = "1144445555"
                businessName = "Premium Car Buenos Aires"
                cuit = "20-12345678-9"
                address = "Av. Libertador 1234"
                city = "CABA"
                province = "Buenos Aires"
                description =
                    "Premium dealership with 20 years of experience selling cars"
                active = true
            }

        val dealership2 =
            Dealership().apply {
                email = "badeals@gmail.com"
                password = passwordEncoder.encode("Badeals1234")
                firstName = "María"
                lastName = "González"
                phone = "1155556666"
                businessName = "Buenos Aires deals"
                cuit = "30-98765432-1"
                address = "Av. Corrientes 123"
                city = "Rosario"
                province = "Santa Fe"
                description = "Find your dream car in BA deals"
                active = true
            }

        userRepository.saveAll(listOf(admin, buyer1, buyer2, dealership1, dealership2))
    }

    private fun initCars() {
        if (carRepository.count() > 0L) return

        val car1 =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2025
                color = "White"
                fuelType = FuelType.HYBRID
                transmission = TransmissionType.AUTOMATIC
                description = "New Corolla hybrid, designed to last longer"
                images =
                    mutableListOf(
                        "https://as1.ftcdn.net/v2/jpg/04/26/87/98/1000" +
                            "_F_426879820_KNVE8ww5STlp4mQ6FpPbvQB1463mtFm4.jpg",
                    )
            }

        val car2 =
            Car().apply {
                brand = "Volkswagen"
                model = "Golf GTI"
                year = 2024
                color = "Red"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.MANUAL
                description =
                    "Golf FTI, sport version, excellent performance and power delivery"
                images =
                    mutableListOf(
                        "https://as1.ftcdn.net/v2/jpg/05/24/89/70/1000" +
                            "_F_524897085_NtLPXHm2JJ7DzeY9Hivr0BIDvWgbyK3D.jpg",
                    )
            }

        val car3 =
            Car().apply {
                brand = "Ford"
                model = "Ranger"
                year = 2025
                color = "Black"
                fuelType = FuelType.DIESEL
                transmission = TransmissionType.AUTOMATIC
                description =
                    "Our new 4WD off road for those drivers that love adventure"
                images =
                    mutableListOf(
                        "https://as1.ftcdn.net/v2/jpg/17/68/20/00/1000" +
                            "_F_1768200084_OOMVcyW0ei2LiC85Jfh746e7nvLQ6TGV.jpg",
                    )
            }

        val car4 =
            Car().apply {
                brand = "Chevrolet"
                model = "Cruze"
                year = 2025
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.SEMI_AUTOMATIC
                description =
                    "Comfortable and economic formula with a sport option for speed lovers"
            }

        val car5 =
            Car().apply {
                brand = "Audi"
                model = "A3"
                year = 2024
                color = "Black"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                description =
                    "Feel luxury and comfort with the last version of the classic Audi A3"
                images =
                    mutableListOf(
                        "https://as2.ftcdn.net/v2/jpg/03/66/35/39/1000" +
                            "_F_366353937_jqUL1pi5OyOkQbXR6z49V8zRQMMU213c.jpg",
                    )
            }

        val car6 =
            Car().apply {
                brand = "Nissan"
                model = "Sentra"
                year = 2025
                color = "Grey"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                description =
                    "Designed for adventure, choose your path"
                images =
                    mutableListOf(
                        "https://as1.ftcdn.net/v2/jpg/05/25/72/40/1000" +
                            "_F_525724063_Aa0er7MnuOryVn2BH1UAHyoLSK0Kfozq.jpg",
                        "https://as1.ftcdn.net/v2/jpg/04/36/23/48/1000" +
                            "_F_436234860_K9cTT8M9svBJsp8RWRAwQ0hBQCPNXiEh.jpg",
                    )
            }

        carRepository.saveAll(listOf(car1, car2, car3, car4, car5, car6))
    }

    private fun initCarOffers() {
        if (carOfferRepository.count() > 0L) return

        val premiumCar =
            userRepository.findAll()
                .filterIsInstance<Dealership>()
                .find { it.email == "premiumcar@gmail.com" } ?: return

        val baDeals =
            userRepository.findAll()
                .filterIsInstance<Dealership>()
                .find { it.email == "badeals@gmail.com" } ?: return

        val cars = carRepository.findAll()
        val corolla = cars.find { it.brand == "Toyota" && it.model == "Corolla" }
        val golfGTI = cars.find { it.brand == "Volkswagen" && it.model == "Golf GTI" }
        val ranger = cars.find { it.brand == "Ford" && it.model == "Ranger" }
        val audiA3 = cars.find { it.brand == "Audi" && it.model == "A3" }

        val offers = mutableListOf<CarOffer>()

        corolla?.let {
            offers.add(
                CarOffer().apply {
                    dealership = premiumCar
                    car = it
                    price = BigDecimal("28000.00")
                    dealershipNotes =
                        "Brand new hybrid model, immediate delivery available. " +
                        "Financing options."
                    available = true
                },
            )
        }

        golfGTI?.let {
            offers.add(
                CarOffer().apply {
                    dealership = premiumCar
                    car = it
                    price = BigDecimal("42000.00")
                    dealershipNotes =
                        "Sport version with all extras included. Perfect condition."
                    available = true
                },
            )
        }

        ranger?.let {
            offers.add(
                CarOffer().apply {
                    dealership = premiumCar
                    car = it
                    price = BigDecimal("55000.00")
                    dealershipNotes =
                        "4WD Black Edition, ideal for adventure. Limited stock."
                    available = true
                },
            )
        }

        audiA3?.let {
            offers.add(
                CarOffer().apply {
                    dealership = premiumCar
                    car = it
                    price = BigDecimal("48000.00")
                    dealershipNotes =
                        "Luxury and comfort in the classic Audi A3. " +
                        "Premium dealership service."
                    available = true
                },
            )
        }

        // Buenos Aires Deals offers
        corolla?.let {
            offers.add(
                CarOffer().apply {
                    dealership = baDeals
                    car = it
                    price = BigDecimal("27800.00")
                    dealershipNotes =
                        "Best price in the market! We accept trade-ins."
                    available = true
                },
            )
        }

        ranger?.let {
            offers.add(
                CarOffer().apply {
                    dealership = baDeals
                    car = it
                    price = BigDecimal("53500.00")
                    dealershipNotes =
                        "Special offer! Payment plans available. Contact us for details."
                    available = true
                },
            )
        }

        carOfferRepository.saveAll(offers)
    }

    private fun initFavorites() {
        if (favoriteCarRepository.count() > 0L) return

        val alan =
            userRepository.findAll()
                .filterIsInstance<Buyer>()
                .find { it.email == "alan@gmail.com" } ?: return

        val franco =
            userRepository.findAll()
                .filterIsInstance<Buyer>()
                .find { it.email == "franco@gmail.com" } ?: return

        val cars = carRepository.findAll()
        val corolla = cars.find { it.brand == "Toyota" && it.model == "Corolla" }
        val golfGTI = cars.find { it.brand == "Volkswagen" && it.model == "Golf GTI" }
        val ranger = cars.find { it.brand == "Ford" && it.model == "Ranger" }
        val audiA3 = cars.find { it.brand == "Audi" && it.model == "A3" }
        val sentra = cars.find { it.brand == "Nissan" && it.model == "Sentra" }

        val favorites = mutableListOf<FavoriteCar>()

        // Alan's favorites with reviews
        corolla?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = alan
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(10)
                    rating = 9
                    comment = "Excellent hybrid car! Very fuel efficient and comfortable for daily commute."
                    priceNotifications = true
                },
            )
        }

        golfGTI?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = alan
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(5)
                    rating = 10
                    comment = "Amazing performance! This is the perfect sports car. Highly recommended!"
                    priceNotifications = false
                },
            )
        }

        ranger?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = alan
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(2)
                    rating = 8
                    comment = "Great for off-road adventures. A bit pricey but worth it."
                    priceNotifications = true
                },
            )
        }

        // Franco's favorites with reviews
        audiA3?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = franco
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(15)
                    rating = 9
                    comment = "Luxury at its best! The interior is stunning and drives like a dream."
                    priceNotifications = true
                },
            )
        }

        corolla?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = franco
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(7)
                    rating = 8
                    comment = "Reliable and economical. Perfect family car."
                    priceNotifications = false
                },
            )
        }

        sentra?.let {
            favorites.add(
                FavoriteCar().apply {
                    buyer = franco
                    car = it
                    dateAdded = LocalDateTime.now().minusDays(1)
                    rating = 7
                    comment = "Good value for money. Comfortable ride but lacks some modern features."
                    priceNotifications = true
                },
            )
        }

        favoriteCarRepository.saveAll(favorites)
    }

    private fun initPurchases() {
        if (purchaseRepository.count() > 0L) return

        val alan =
            userRepository.findAll()
                .filterIsInstance<Buyer>()
                .find { it.email == "alan@gmail.com" } ?: return

        val franco =
            userRepository.findAll()
                .filterIsInstance<Buyer>()
                .find { it.email == "franco@gmail.com" } ?: return

        val offers = carOfferRepository.findAll()
        val corollaOffer = offers.find { it.car.brand == "Toyota" && it.dealership.businessName == "Premium Car Buenos Aires" }
        val rangerOffer = offers.find { it.car.brand == "Ford" }
        val audiOffer = offers.find { it.car.brand == "Audi" }

        val purchases = mutableListOf<Purchase>()

        // Alan's purchases
        corollaOffer?.let {
            purchases.add(
                Purchase().apply {
                    buyer = alan
                    carOffer = it
                    finalPrice = it.price
                    purchaseDate = LocalDateTime.now().minusDays(30)
                    purchaseStatus = PurchaseStatus.DELIVERED
                    paymentMethod = PaymentMethod.CREDIT_CARD
                    observations = "Delivered on time. Customer very satisfied with the purchase."
                },
            )
        }

        rangerOffer?.let {
            purchases.add(
                Purchase().apply {
                    buyer = alan
                    carOffer = it
                    finalPrice = it.price.multiply(BigDecimal("0.95")) // 5% discount
                    purchaseDate = LocalDateTime.now().minusDays(5)
                    purchaseStatus = PurchaseStatus.CONFIRMED
                    paymentMethod = PaymentMethod.CHECK
                    observations = "Applied 5% discount for cash payment. Awaiting delivery."
                },
            )
        }

        // Franco's purchases
        audiOffer?.let {
            purchases.add(
                Purchase().apply {
                    buyer = franco
                    carOffer = it
                    finalPrice = it.price
                    purchaseDate = LocalDateTime.now().minusDays(2)
                    purchaseStatus = PurchaseStatus.PENDING
                    paymentMethod = PaymentMethod.CASH
                    observations = "Waiting for financing approval from the bank."
                },
            )
        }

        purchaseRepository.saveAll(purchases)
    }
}
