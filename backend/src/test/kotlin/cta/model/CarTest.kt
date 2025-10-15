package cta.model

import cta.enum.FuelType
import cta.enum.TransmissionType
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

@DisplayName("Car Entity Tests")
class CarTest {
    private lateinit var car: Car

    @BeforeEach
    fun setup() {
        car =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                mileage = 15000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
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
        Assertions.assertEquals(0, newCar.mileage)
        Assertions.assertEquals("", newCar.color)
        Assertions.assertEquals(FuelType.GASOLINE, newCar.fuelType)
        Assertions.assertEquals(TransmissionType.MANUAL, newCar.transmission)
        Assertions.assertTrue(newCar.available)
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
    @DisplayName("Should return correct full name")
    fun shouldReturnFullName() {
        val fullName = car.getFullName()

        Assertions.assertEquals("Toyota Corolla 2023", fullName)
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
}
