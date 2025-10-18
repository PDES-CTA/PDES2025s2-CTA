package cta.service

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.repository.CarRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("CarService Tests")
class CarServiceTest {
    @Mock
    private lateinit var carRepository: CarRepository

    @InjectMocks
    private lateinit var carService: CarService

    private lateinit var validCar: Car

    @BeforeEach
    fun setup() {
        validCar =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2022
                plate = "ABC123"
                mileage = 15000
                color = "White"
                description = "Excellent condition"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
                images = mutableListOf("http://example.com/img.png")
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find car by id successfully")
    fun shouldFindCarById() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))

        // When
        val result = carService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals("Toyota", result.brand)
        verify(carRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when car not found by id")
    fun shouldThrowExceptionWhenCarNotFound() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                carService.findById(999L)
            }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository).findById(999L)
    }

    // ========== createCar Tests ==========
    @Test
    @DisplayName("Should create car successfully")
    fun shouldCreateCar() {
        // Given
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        // When
        val result = carService.createCar(validCar)

        // Then
        assertNotNull(result)
        assertEquals("Toyota", result.brand)
        verify(carRepository).save(validCar)
    }

    // ========== findAllAvailable Tests ==========

    @Test
    @DisplayName("Should find all available cars")
    fun shouldFindAllAvailableCars() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                plate = "DEF456"
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        // When
        val result = carService.findAllAvailable()

        // Then
        assertEquals(2, result.size)
        verify(carRepository).findByAvailableTrue()
    }

    @Test
    @DisplayName("Should return empty list when no available cars")
    fun shouldReturnEmptyListWhenNoAvailableCars() {
        // Given
        `when`(carRepository.findByAvailableTrue()).thenReturn(emptyList())

        // When
        val result = carService.findAllAvailable()

        // Then
        assertTrue(result.isEmpty())
        verify(carRepository).findByAvailableTrue()
    }

    // ========== searchCars Tests ==========

    @Test
    @DisplayName("Should search cars by keyword")
    fun shouldSearchCarsByKeyword() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                plate = "DEF456"
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Toyota")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by year range")
    fun shouldSearchCarsByYearRange() {
        // Given
        val car1 =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2020
                plate = "ABC123"
                mileage = 40000
                color = "White"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2022
                plate = "DEF456"
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val car3 =
            Car().apply {
                id = 3L
                brand = "Mazda"
                model = "6"
                year = 2024
                plate = "GHI789"
                mileage = 1000
                color = "Black"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(car1, car2, car3)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(minYear = 2021, maxYear = 2023)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(2022, result[0].year)
    }

    @Test
    @DisplayName("Should search cars by brand")
    fun shouldSearchCarsByBrand() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                plate = "DEF456"
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(brand = "Honda")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Honda", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by fuel type")
    fun shouldSearchCarsByFuelType() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Volkswagen"
                model = "Jetta"
                year = 2023
                plate = "DEF456"
                mileage = 8000
                color = "Gray"
                fuelType = FuelType.DIESEL
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(fuelType = FuelType.DIESEL)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(FuelType.DIESEL, result[0].fuelType)
    }

    @Test
    @DisplayName("Should search cars by transmission")
    fun shouldSearchCarsByTransmission() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Mazda"
                model = "MX-5"
                year = 2023
                plate = "DEF456"
                mileage = 5000
                color = "Red"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.MANUAL
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(transmission = TransmissionType.MANUAL)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(TransmissionType.MANUAL, result[0].transmission)
    }

    @Test
    @DisplayName("Should search cars with multiple filters")
    fun shouldSearchCarsWithMultipleFilters() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                plate = "DEF456"
                mileage = 10000
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                available = true
                publicationDate = LocalDateTime.now()
            }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Corolla", minYear = 2020)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    // ========== createCar Validation Tests ==========

    @Test
    @DisplayName("Should throw exception when brand is empty")
    fun shouldThrowExceptionWhenBrandIsEmpty() {
        // Given
        val invalidCar =
            Car().apply {
                brand = ""
                model = "Model"
                year = 2022
                plate = "ABC123"
                mileage = 0
                color = "Blue"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Brand cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when model is empty")
    fun shouldThrowExceptionWhenModelIsEmpty() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = ""
                year = 2022
                plate = "ABC123"
                mileage = 0
                color = "Blue"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Model cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when year is too old")
    fun shouldThrowExceptionWhenYearIsTooOld() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = "Model T"
                year = 1900
                plate = "ABC123"
                mileage = 0
                color = "Black"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Year must be greater than 1900", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when year is in the future")
    fun shouldThrowExceptionWhenYearIsInFuture() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = "Future"
                year = LocalDate.now().year + 2
                plate = "ABC123"
                mileage = 0
                color = "Silver"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Year cannot be in the future", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when mileage is negative")
    fun shouldThrowExceptionWhenMileageIsNegative() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2022
                plate = "ABC123"
                mileage = -1000
                color = "White"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Mileage cannot be negative", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when color is empty")
    fun shouldThrowExceptionWhenColorIsEmpty() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = "Corolla"
                year = 2022
                plate = "ABC123"
                mileage = 0
                color = ""
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Color cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when description is too long")
    fun shouldThrowExceptionWhenDescriptionIsTooLong() {
        // Given
        val invalidCar = validCar.apply { description = "a".repeat(1001) }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Description cannot exceed 1000 characters", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when image URL is invalid")
    fun shouldThrowExceptionWhenImageUrlIsInvalid() {
        // Given
        val invalidCar = validCar.apply { images = mutableListOf("ftp://invalid.com/img.png") }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Image URL must start with http:// or https://", exception.message)
    }

    // ========== updateCar Tests ==========

    @Test
    @DisplayName("Should update car successfully")
    fun shouldUpdateCar() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        val updates =
            mapOf(
                "brand" to "Honda",
                "model" to "Accord",
                "year" to 2023,
                "mileage" to 20000,
                "color" to "Black",
                "description" to "Updated description",
                "fuelType" to "DIESEL",
                "transmission" to "MANUAL",
                "available" to false,
                "images" to listOf("http://new.com/img.jpg")
            )

        // When
        val result = carService.updateCar(1L, updates)

        // Then
        assertEquals("Honda", result.brand)
        assertEquals("Accord", result.model)
        assertEquals(2023, result.year)
        assertEquals(20000, result.mileage)
        assertEquals("Black", result.color)
        assertEquals("Updated description", result.description)
        assertEquals(FuelType.DIESEL, result.fuelType)
        assertEquals(TransmissionType.MANUAL, result.transmission)
        assertEquals(1, result.images.size)
        assertEquals("http://new.com/img.jpg", result.images[0])
        assertFalse(result.available)
        verify(carRepository).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent car")
    fun shouldThrowExceptionWhenUpdatingNonExistentCar() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())
        val updates = mapOf("brand" to "Honda")

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                carService.updateCar(999L, updates)
            }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository, never()).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should throw validation exception during update")
    fun shouldThrowValidationExceptionDuringUpdate() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        val updates = mapOf("year" to "1800") // Invalid year

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            carService.updateCar(1L, updates)
        }
        verify(carRepository, never()).save(any(Car::class.java))
    }

    // ========== markAsSold Tests ==========

    @Test
    @DisplayName("Should mark car as sold successfully")
    fun shouldMarkCarAsSold() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        // When
        val result = carService.markAsSold(1L)

        // Then
        assertFalse(result.available)
        verify(carRepository).save(any(Car::class.java))
    }

    // ========== markAsAvailable Tests ==========

    @Test
    @DisplayName("Should mark car as available successfully")
    fun shouldMarkCarAsAvailable() {
        // Given
        validCar.available = false // Start as sold
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        // When
        val result = carService.markAsAvailable(1L)

        // Then
        assertTrue(result.available)
        verify(carRepository).save(any(Car::class.java))
    }

    // ========== deleteCar Tests ==========

    @Test
    @DisplayName("Should delete car successfully")
    fun shouldDeleteCar() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))

        // When
        carService.deleteCar(1L)

        // Then
        verify(carRepository).delete(validCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent car")
    fun shouldThrowExceptionWhenDeletingNonExistentCar() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            carService.deleteCar(999L)
        }
        verify(carRepository, never()).delete(any(Car::class.java))
    }
}
