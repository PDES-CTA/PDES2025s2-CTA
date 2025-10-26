package cta.config.init

import cta.enum.FuelType
import cta.enum.TransmissionType
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
    private val passwordEncoder: PasswordEncoder
) {

    @PostConstruct
    fun initDatabase() {
        initUsers()
        initCars()
        initCarOffers()
    }

    private fun initUsers() {
        if (userRepository.count() > 0L) return

        val buyer1 = Buyer.create(
            email = "alan@gmail.com",
            password = passwordEncoder.encode("Alan1234"),
            firstName = "Alan",
            lastName = "Pacheco",
            phone = "1112345678",
            address = "User Street 123",
            dni = 12345678
        )

        val buyer2 = Buyer.create(
            email = "franco@gmail.com",
            password = passwordEncoder.encode("Franco1234"),
            firstName = "Franco",
            lastName = "Marengo",
            phone = "1112345678",
            address = "Other Street 123",
            dni = 87654321
        )

        val dealership1 = Dealership().apply {
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
            description = "Premium dealership with 20 years of experience selling cars"
            active = true
        }

        val dealership2 = Dealership().apply {
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

        userRepository.saveAll(listOf(buyer1, buyer2, dealership1, dealership2))
    }

    private fun initCars() {
        if (carRepository.count() > 0L) return

        val car1 = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2025
            color = "White"
            fuelType = FuelType.HYBRID
            transmission = TransmissionType.AUTOMATIC
            description = "New Corolla hybrid, designed to last longer"
            images = mutableListOf(
                "https://imgs.search.brave.com/h4Y7geBuDSmAKnjpJTjLwPPP_n2zup1wBBaLd_wkbYE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90b3lv/dGFjYW5hZGEuc2Nl/bmU3LmNvbS9pcy9p/bWFnZS90b3lvdGFj/YW5hZGEvdG95b3Rh/LTIwMjUtZmVhdHVy/ZXMtY29yb2xsYS1o/eWJyaWQtd2hpdGUt/cEAyeA",
                "https://imgs.search.brave.com/yyBtU3fCRd3GHM2XrvGl-Jm1xlP3v3JiX0MMDSCWBA4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2NrYS1kYXNoLzEx/MC0wNzI1LVRPTTIz/ODgzL21haW5pbWFn/ZS53ZWJw"
            )
        }

        val car2 = Car().apply {
            brand = "Volkswagen"
            model = "Golf GTI"
            year = 2024
            color = "Red"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.MANUAL
            description = "Golf FTI, sport version, excellent performance and power delivery"
            images = mutableListOf(
                "https://imgs.search.brave.com/A5HFwsB9LnuqjHE2RgqF_Z6K9BEfYZp4I4D9lr7IBFg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2NrYS1kYXNoLzA4/Ni0wNzI0LVZPUzI0/MDI5L3NsaWRlcjIu/d2VicA"
            )
        }

        val car3 = Car().apply {
            brand = "Ford"
            model = "Ranger"
            year = 2025
            color = "Black"
            fuelType = FuelType.DIESEL
            transmission = TransmissionType.AUTOMATIC
            description = "Our new 4WD off road for those drivers that love adventure"
            images = mutableListOf(
                "https://imgs.search.brave.com/u551AOvI4E0x1REDKLl4jfeUJj7TPf2kz3ohmCeUld4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90b3Jx/dWVjYWZlLmItY2Ru/Lm5ldC93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNS8wOC8yMDI2/LWZvcmQtcmFuZ2Vy/LWJsYWNrLWVkaXRp/b24tMy5qcGc",
                "https://imgs.search.brave.com/E2AD84FCjMUWIg8TkqunsDp4GNssHrlNr4xD9s47oEQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90b3Jx/dWVjYWZlLmItY2Ru/Lm5ldC93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNS8wOC8yMDI2/LWZvcmQtcmFuZ2Vy/LWJsYWNrLWVkaXRp/b24tOC5qcGc",
                "https://imgs.search.brave.com/KzbyXUo23wy6VJb-Bcid_OEQJx_AkMb4E5IN6wrGbVY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9mb3Jk/YXV0aG9yaXR5LmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/NC8xMi8yMDI1LUZv/cmQtUmFuZ2VyLWNv/bG9ycy1jb25maWd1/cmF0b3ItZXh0ZXJp/b3ItMDAyLWZyb250/LXRocmVlLXF1YXJ0/ZXJzLVNoYWRvdy1C/bGFjay03MjB4Mzk5/LmpwZw"
            )
        }

        val car4 = Car().apply {
            brand = "Chevrolet"
            model = "Cruze"
            year = 2025
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.SEMI_AUTOMATIC
            description = "Comfortable and economic formula with a sport option for speed lovers"
        }

        val car5 = Car().apply {
            brand = "Audi"
            model = "A3"
            year = 2024
            color = "Black"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            description = "Feel luxury and comfort with the last version of the classic Audi A3"
            images = mutableListOf(
                "https://imgs.search.brave.com/LQh36uMgigh-jvIopVDdzrLf9ZvGrlx_RE7uU4lpkCM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2NrYS1kYXNoLzA0/NC0wODI0LUNBMTQ4/L21haW5pbWFnZS53/ZWJw"
            )
        }

        carRepository.saveAll(listOf(car1, car2, car3, car4, car5))
    }

    private fun initCarOffers() {
        val premiumCar = userRepository.findAll()
            .filterIsInstance<Dealership>()
            .find { it.email == "premiumcar@gmail.com" } ?: return

        val baDeals = userRepository.findAll()
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
            offers.add(CarOffer().apply {
                dealership = premiumCar
                car = it
                price = BigDecimal("28000.00")
                dealershipNotes = "Brand new hybrid model, immediate delivery available. Financing options."
                available = true
            })
        }

        golfGTI?.let {
            offers.add(CarOffer().apply {
                dealership = premiumCar
                car = it
                price = BigDecimal("42000.00")
                dealershipNotes = "Sport version with all extras included. Perfect condition."
                available = true
            })
        }

        ranger?.let {
            offers.add(CarOffer().apply {
                dealership = premiumCar
                car = it
                price = BigDecimal("55000.00")
                dealershipNotes = "4WD Black Edition, ideal for adventure. Limited stock."
                available = true
            })
        }

        audiA3?.let {
            offers.add(CarOffer().apply {
                dealership = premiumCar
                car = it
                price = BigDecimal("48000.00")
                dealershipNotes = "Luxury and comfort in the classic Audi A3. Premium dealership service."
                available = true
            })
        }

        // Buenos Aires Deals offers
        corolla?.let {
            offers.add(CarOffer().apply {
                dealership = baDeals
                car = it
                price = BigDecimal("27800.00")
                dealershipNotes = "Best price in the market! We accept trade-ins."
                available = true
            })
        }

        ranger?.let {
            offers.add(CarOffer().apply {
                dealership = baDeals
                car = it
                price = BigDecimal("53500.00")
                dealershipNotes = "Special offer! Payment plans available. Contact us for details."
                available = true
            })
        }

        carOfferRepository.saveAll(offers)
    }
}