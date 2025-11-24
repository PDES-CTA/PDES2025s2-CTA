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
    fun setUp() {
        car =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                description = "Well maintained car"
                images = mutableListOf("http://example.com/img.png")
            }
    }

    @Test
    @DisplayName("Should create new car with default values")
    fun shouldCreateNewCar() {
        val newCar = Car()

        Assertions.assertEquals("", newCar.brand)
        Assertions.assertEquals("", newCar.model)
        Assertions.assertEquals(0, newCar.year)
        Assertions.assertEquals("", newCar.color)
        Assertions.assertEquals(FuelType.GASOLINE, newCar.fuelType)
        Assertions.assertEquals(TransmissionType.MANUAL, newCar.transmission)
        Assertions.assertNull(newCar.description)
        Assertions.assertTrue(newCar.images.isEmpty())
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
        Assertions.assertEquals(1, car.images.size)

        car.images.add("https://example.com/image1.jpg")
        car.images.add("https://example.com/image2.jpg")

        Assertions.assertEquals(3, car.images.size)
        Assertions.assertTrue(car.images.contains("https://example.com/image1.jpg"))
    }

    @Test
    @DisplayName("Should set publication date")
    fun shouldSetPublicationDate() {
        val carWithDate = Car()
        Assertions.assertNotNull(carWithDate.publicationDate)
        Assertions.assertTrue(carWithDate.publicationDate.isBefore(LocalDateTime.now().plusSeconds(1)))
    }

    @Test
    @DisplayName("Should allow updating description")
    fun shouldUpdateDescription() {
        car.description = "New description"
        Assertions.assertEquals("New description", car.description)
    }

    @Test
    @DisplayName("Should allow updating transmission")
    fun shouldUpdateTransmission() {
        car.transmission = TransmissionType.MANUAL
        Assertions.assertEquals(TransmissionType.MANUAL, car.transmission)
    }
}
