package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime

@DisplayName("Car Entity Tests")
class CarTest {

    private lateinit var car: Car

    @BeforeEach
    fun setup() {
        car = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2023
            price = BigDecimal("20000.00")
            mileage = 15000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            description = "Well maintained car"
            dealershipId = 1L
            available = true
        }
    }

    @Test
    @DisplayName("Should create car with default values")
    fun shouldCreateCarWithDefaults() {
        val newCar = Car()

        Assertions.assertEquals("", newCar.brand)
        Assertions.assertEquals("", newCar.model)
        Assertions.assertEquals(0, newCar.year)
        Assertions.assertEquals(BigDecimal.ZERO, newCar.price)
        Assertions.assertEquals(0, newCar.mileage)
        Assertions.assertEquals("", newCar.color)
        Assertions.assertEquals(FuelType.GASOLINE, newCar.fuelType)
        Assertions.assertEquals(TransmissionType.MANUAL, newCar.transmission)
        Assertions.assertNull(newCar.description)
        Assertions.assertTrue(newCar.available)
        Assertions.assertEquals(0L, newCar.dealershipId)
        Assertions.assertTrue(newCar.images.isEmpty())
    }

    @Test
    @DisplayName("Should update price correctly")
    fun shouldUpdatePrice() {
        val newPrice = BigDecimal("30000.00")

        car.updatePrice(newPrice)

        Assertions.assertEquals(newPrice, car.price)
    }

    @Test
    @DisplayName("Should mark car as sold")
    fun shouldMarkCarAsSold() {
        Assertions.assertTrue(car.available)

        car.markAsSold()

        Assertions.assertFalse(car.available)
        Assertions.assertFalse(car.isAvailable())
    }

    @Test
    @DisplayName("Should check if car is available")
    fun shouldCheckAvailability() {
        Assertions.assertTrue(car.isAvailable())

        car.available = false

        Assertions.assertFalse(car.isAvailable())
    }

    @Test
    @DisplayName("Should calculate discounted price correctly")
    fun shouldCalculateDiscountedPrice() {
        // 10% discount on 20000.00 = 18000.00
        val discountedPrice = car.calculateDiscountedPrice(10.0)

        Assertions.assertEquals(BigDecimal("18000.00"), discountedPrice)
    }

    @Test
    @DisplayName("Should calculate 20% discount correctly")
    fun shouldCalculate20PercentDiscount() {
        // 20% discount on 20000.00 = 16000.00
        val discountedPrice = car.calculateDiscountedPrice(20.0)

        Assertions.assertEquals(BigDecimal("16000.00"), discountedPrice)
    }

    @Test
    @DisplayName("Should calculate 0% discount correctly")
    fun shouldCalculateZeroDiscount() {
        val discountedPrice = car.calculateDiscountedPrice(0.0)

        Assertions.assertEquals(car.price, discountedPrice)
    }

    @Test
    @DisplayName("Should calculate 100% discount correctly")
    fun shouldCalculate100PercentDiscount() {
        val discountedPrice = car.calculateDiscountedPrice(100.0)

        Assertions.assertEquals(BigDecimal("0.00"), discountedPrice)
    }

    @Test
    @DisplayName("Should return correct full name")
    fun shouldReturnFullName() {
        val fullName = car.getFullName()

        Assertions.assertEquals("Toyota Corolla 2023", fullName)
    }

    @Test
    @DisplayName("Should handle images list correctly")
    fun shouldHandleImagesList() {
        Assertions.assertTrue(car.images.isEmpty())

        car.images.add("https://example.com/image1.jpg")
        car.images.add("https://example.com/image2.jpg")

        Assertions.assertEquals(2, car.images.size)
        Assertions.assertTrue(car.images.contains("https://example.com/image1.jpg"))
    }

    @Test
    @DisplayName("Should set publication date")
    fun shouldSetPublicationDate() {
        val now = LocalDateTime.now()
        car.publicationDate = now

        Assertions.assertEquals(now, car.publicationDate)
    }

    @Test
    @DisplayName("Should handle different fuel types")
    fun shouldHandleDifferentFuelTypes() {
        car.fuelType = FuelType.DIESEL
        Assertions.assertEquals(FuelType.DIESEL, car.fuelType)

        car.fuelType = FuelType.ELECTRIC
        Assertions.assertEquals(FuelType.ELECTRIC, car.fuelType)
    }

    @Test
    @DisplayName("Should handle different transmission types")
    fun shouldHandleDifferentTransmissionTypes() {
        car.transmission = TransmissionType.MANUAL
        Assertions.assertEquals(TransmissionType.MANUAL, car.transmission)

        car.transmission = TransmissionType.AUTOMATIC
        Assertions.assertEquals(TransmissionType.AUTOMATIC, car.transmission)
    }

    @Test
    @DisplayName("Should not modify original price when calculating discount")
    fun shouldNotModifyOriginalPriceOnDiscount() {
        val originalPrice = car.price

        car.calculateDiscountedPrice(20.0)

        Assertions.assertEquals(originalPrice, car.price)
    }
}