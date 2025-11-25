package cta.config.init

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.enum.UserRole
import cta.model.Admin
import cta.model.Buyer
import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.repository.CarOfferRepository
import cta.repository.CarRepository
import cta.repository.UserRepository
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.math.BigDecimal

@Component
@Profile("!test")
class DataInitializer(
    private val userRepository: UserRepository,
    private val carRepository: CarRepository,
    private val carOfferRepository: CarOfferRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @PostConstruct
    fun initDatabase() {
        initUsers()
        initCars()
        initCarOffers()
    }

    private fun initUsers() {
        if (userRepository.count() > 0L) return

        val admin = Admin.create(
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
        val cruze = cars.find { it.brand == "Chevrolet" && it.model == "Cruze" }
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
}