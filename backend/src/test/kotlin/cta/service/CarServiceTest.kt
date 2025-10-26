package cta.service

import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.model.Car
import cta.repository.CarRepository
import cta.web.dto.CarSearchFilters
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDate
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
                color = "White"
                description = "Excellent condition"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                images = mutableListOf("http://example.com/img.png")
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find car by id successfully")
    fun shouldFindCarById() {
        // Given
        whenever(carRepository.findById(1L)).thenReturn(Optional.of(validCar))

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
        whenever(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                carService.findById(999L)
            }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository).findById(999L)
    }

    // ========== findAll Tests ==========

    @Test
    @DisplayName("Should find all cars")
    fun shouldFindAllCars() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        // When
        val result = carService.findAll()

        // Then
        assertEquals(2, result.size)
        verify(carRepository).findAll()
    }

    @Test
    @DisplayName("Should return empty list when no cars exist")
    fun shouldReturnEmptyListWhenNoCarsExist() {
        // Given
        whenever(carRepository.findAll()).thenReturn(emptyList())

        // When
        val result = carService.findAll()

        // Then
        assertTrue(result.isEmpty())
        verify(carRepository).findAll()
    }

    // ========== createCar Tests ==========

    @Test
    @DisplayName("Should create car successfully")
    fun shouldCreateCar() {
        // Given
        whenever(carRepository.save(any<Car>())).thenReturn(validCar)

        // When
        val result = carService.createCar(validCar)

        // Then
        assertNotNull(result)
        assertEquals("Toyota", result.brand)
        verify(carRepository).save(validCar)
    }

    // ========== searchCars Tests ==========

    @Test
    @DisplayName("Should search cars by keyword in brand")
    fun shouldSearchCarsByKeywordInBrand() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Toyota")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by keyword in model")
    fun shouldSearchCarsByKeywordInModel() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Corolla")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Corolla", result[0].model)
    }

    @Test
    @DisplayName("Should search cars by keyword in description")
    fun shouldSearchCarsByKeywordInDescription() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                color = "Blue"
                description = "Good condition"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Excellent")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Excellent condition", result[0].description)
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
                color = "White"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2022
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val car3 =
            Car().apply {
                id = 3L
                brand = "Mazda"
                model = "6"
                year = 2024
                color = "Black"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

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
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

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
                color = "Gray"
                fuelType = FuelType.DIESEL
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

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
                color = "Red"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.MANUAL
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

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
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Corolla", minYear = 2020)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should return all cars when no filters applied")
    fun shouldReturnAllCarsWhenNoFiltersApplied() {
        // Given
        val car2 =
            Car().apply {
                id = 2L
                brand = "Honda"
                model = "Civic"
                year = 2023
                color = "Blue"
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(validCar, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters()

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
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
    @DisplayName("Should throw exception when year is too far in the future")
    fun shouldThrowExceptionWhenYearIsTooFarInFuture() {
        // Given
        val invalidCar =
            Car().apply {
                brand = "Toyota"
                model = "Future"
                year = LocalDate.now().year + 2
                color = "Silver"
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carService.createCar(invalidCar)
            }
        assertEquals("Year cannot be too far in the future", exception.message)
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
        whenever(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        whenever(carRepository.save(any<Car>())).thenReturn(validCar)

        val updates =
            mapOf(
                "brand" to "Honda",
                "model" to "Accord",
                "year" to 2023,
                "color" to "Black",
                "description" to "Updated description",
                "fuelType" to "DIESEL",
                "transmission" to "MANUAL",
                "images" to listOf("http://new.com/img.jpg"),
            )

        // When
        val result = carService.updateCar(1L, updates)

        // Then
        assertEquals("Honda", result.brand)
        assertEquals("Accord", result.model)
        assertEquals(2023, result.year)
        assertEquals("Black", result.color)
        assertEquals("Updated description", result.description)
        assertEquals(FuelType.DIESEL, result.fuelType)
        assertEquals(TransmissionType.MANUAL, result.transmission)
        assertEquals(1, result.images.size)
        assertEquals("http://new.com/img.jpg", result.images[0])
        verify(carRepository).save(any<Car>())
    }

    @Test
    @DisplayName("Should update only specified fields")
    fun shouldUpdateOnlySpecifiedFields() {
        // Given
        whenever(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        whenever(carRepository.save(any<Car>())).thenReturn(validCar)

        val updates = mapOf("brand" to "Honda")

        // When
        val result = carService.updateCar(1L, updates)

        // Then
        assertEquals("Honda", result.brand)
        assertEquals("Corolla", result.model) // Should remain unchanged
        verify(carRepository).save(any<Car>())
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent car")
    fun shouldThrowExceptionWhenUpdatingNonExistentCar() {
        // Given
        whenever(carRepository.findById(999L)).thenReturn(Optional.empty())
        val updates = mapOf("brand" to "Honda")

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                carService.updateCar(999L, updates)
            }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository, never()).save(any<Car>())
    }

    @Test
    @DisplayName("Should throw validation exception during update")
    fun shouldThrowValidationExceptionDuringUpdate() {
        // Given
        whenever(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        val updates = mapOf("year" to 1800) // Invalid year

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            carService.updateCar(1L, updates)
        }
        verify(carRepository, never()).save(any<Car>())
    }

    // ========== deleteCar Tests ==========

    @Test
    @DisplayName("Should delete car successfully")
    fun shouldDeleteCar() {
        // Given
        whenever(carRepository.findById(1L)).thenReturn(Optional.of(validCar))

        // When
        carService.deleteCar(1L)

        // Then
        verify(carRepository).delete(validCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent car")
    fun shouldThrowExceptionWhenDeletingNonExistentCar() {
        // Given
        whenever(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            carService.deleteCar(999L)
        }
        verify(carRepository, never()).delete(any<Car>())
    }

    // ========== searchCars with CarSearchFilters Tests ==========

    @Test
    @DisplayName("Should search cars with no filters")
    fun shouldSearchCarsWithNoFilters() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters()

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
    }

    @Test
    @DisplayName("Should search cars by keyword matching brand")
    fun shouldSearchCarsByKeywordMatchingBrand() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Toyota")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by keyword matching model")
    fun shouldSearchCarsByKeywordMatchingModel() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Civic")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Civic", result[0].model)
    }

    @Test
    @DisplayName("Should search cars by keyword matching description")
    fun shouldSearchCarsByKeywordMatchingDescription() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                description = "Excellent condition"
            }
        val car2 =
            createMockCar(2L, "Honda", "Civic", 2021).apply {
                description = "Good condition"
            }
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Excellent")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Excellent condition", result[0].description)
    }

    @Test
    @DisplayName("Should search cars by keyword case insensitive")
    fun shouldSearchCarsByKeywordCaseInsensitive() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "TOYOTA")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by minimum year")
    fun shouldSearchCarsByMinimumYear() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2018)
        val car2 = createMockCar(2L, "Honda", "Civic", 2020)
        val car3 = createMockCar(3L, "Mazda", "3", 2022)
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(minYear = 2020)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
        assertTrue(result.all { it.year >= 2020 })
    }

    @Test
    @DisplayName("Should search cars by maximum year")
    fun shouldSearchCarsByMaximumYear() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2018)
        val car2 = createMockCar(2L, "Honda", "Civic", 2020)
        val car3 = createMockCar(3L, "Mazda", "3", 2022)
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(maxYear = 2020)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
        assertTrue(result.all { it.year <= 2020 })
    }

    @Test
    @DisplayName("Should search cars by year range with both min and max")
    fun shouldSearchCarsByYearRangeWithBothMinAndMax() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2018)
        val car2 = createMockCar(2L, "Honda", "Civic", 2020)
        val car3 = createMockCar(3L, "Mazda", "3", 2022)
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(minYear = 2019, maxYear = 2021)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(2020, result[0].year)
    }

    @Test
    @DisplayName("Should search cars by exact brand match")
    fun shouldSearchCarsByExactBrandMatch() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val car3 = createMockCar(3L, "Toyota", "Camry", 2022)
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(brand = "Toyota")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
        assertTrue(result.all { it.brand.equals("Toyota", ignoreCase = true) })
    }

    @Test
    @DisplayName("Should search cars by brand case insensitive")
    fun shouldSearchCarsByBrandCaseInsensitive() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(brand = "TOYOTA")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by fuel type GASOLINE")
    fun shouldSearchCarsByFuelTypeGasoline() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                fuelType = FuelType.GASOLINE
            }
        val car2 =
            createMockCar(2L, "Honda", "Civic", 2021).apply {
                fuelType = FuelType.DIESEL
            }
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(fuelType = FuelType.GASOLINE)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(FuelType.GASOLINE, result[0].fuelType)
    }

    @Test
    @DisplayName("Should search cars by fuel type DIESEL")
    fun shouldSearchCarsByFuelTypeDiesel() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                fuelType = FuelType.GASOLINE
            }
        val car2 =
            createMockCar(2L, "Volkswagen", "Jetta", 2021).apply {
                fuelType = FuelType.DIESEL
            }
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(fuelType = FuelType.DIESEL)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(FuelType.DIESEL, result[0].fuelType)
    }

    @Test
    @DisplayName("Should search cars by transmission AUTOMATIC")
    fun shouldSearchCarsByTransmissionAutomatic() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                transmission = TransmissionType.AUTOMATIC
            }
        val car2 =
            createMockCar(2L, "Mazda", "MX-5", 2021).apply {
                transmission = TransmissionType.MANUAL
            }
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(transmission = TransmissionType.AUTOMATIC)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(TransmissionType.AUTOMATIC, result[0].transmission)
    }

    @Test
    @DisplayName("Should search cars by transmission MANUAL")
    fun shouldSearchCarsByTransmissionManual() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                transmission = TransmissionType.AUTOMATIC
            }
        val car2 =
            createMockCar(2L, "Mazda", "MX-5", 2021).apply {
                transmission = TransmissionType.MANUAL
            }
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(transmission = TransmissionType.MANUAL)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals(TransmissionType.MANUAL, result[0].transmission)
    }

    @Test
    @DisplayName("Should search cars with multiple filters - keyword and year")
    fun shouldSearchCarsWithKeywordAndYear() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2018)
        val car2 = createMockCar(2L, "Toyota", "Camry", 2020)
        val car3 = createMockCar(3L, "Honda", "Civic", 2020)
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Toyota", minYear = 2020)

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
        assertEquals("Camry", result[0].model)
        assertTrue(result[0].year >= 2020)
    }

    @Test
    @DisplayName("Should search cars with multiple filters - brand, fuel type, and transmission")
    fun shouldSearchCarsWithBrandFuelTypeAndTransmission() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val car2 =
            createMockCar(2L, "Toyota", "Prius", 2020).apply {
                fuelType = FuelType.HYBRID
                transmission = TransmissionType.AUTOMATIC
            }
        val car3 =
            createMockCar(3L, "Honda", "Civic", 2020).apply {
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters =
            CarSearchFilters(
                brand = "Toyota",
                fuelType = FuelType.GASOLINE,
                transmission = TransmissionType.AUTOMATIC,
            )

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
        assertEquals(FuelType.GASOLINE, result[0].fuelType)
        assertEquals(TransmissionType.AUTOMATIC, result[0].transmission)
    }

    @Test
    @DisplayName("Should search cars with all filters combined")
    fun shouldSearchCarsWithAllFiltersCombined() {
        // Given
        val car1 =
            createMockCar(1L, "Toyota", "Corolla", 2020).apply {
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
                description = "Great car"
            }
        val car2 =
            createMockCar(2L, "Toyota", "Camry", 2019).apply {
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val car3 =
            createMockCar(3L, "Honda", "Civic", 2020).apply {
                fuelType = FuelType.GASOLINE
                transmission = TransmissionType.AUTOMATIC
            }
        val cars = listOf(car1, car2, car3)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters =
            CarSearchFilters(
                keyword = "Corolla",
                minYear = 2020,
                maxYear = 2021,
                brand = "Toyota",
                fuelType = FuelType.GASOLINE,
                transmission = TransmissionType.AUTOMATIC,
            )

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Corolla", result[0].model)
        assertEquals(2020, result[0].year)
        assertEquals("Toyota", result[0].brand)
        assertEquals(FuelType.GASOLINE, result[0].fuelType)
        assertEquals(TransmissionType.AUTOMATIC, result[0].transmission)
    }

    @Test
    @DisplayName("Should return empty list when no cars match filters")
    fun shouldReturnEmptyListWhenNoCarsMatchFilters() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(brand = "Mazda")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertTrue(result.isEmpty())
    }

    @Test
    @DisplayName("Should search cars with keyword matching partial text")
    fun shouldSearchCarsWithKeywordMatchingPartialText() {
        // Given
        val car1 = createMockCar(1L, "Toyota", "Corolla", 2020)
        val car2 = createMockCar(2L, "Honda", "Civic", 2021)
        val cars = listOf(car1, car2)
        whenever(carRepository.findAll()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "Cor")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Corolla", result[0].model)
    }

    // Helper method to create mock cars (add to the test class if not already present)
    private fun createMockCar(
        id: Long,
        brand: String,
        model: String,
        year: Int,
    ): Car {
        return Car().apply {
            this.id = id
            this.brand = brand
            this.model = model
            this.year = year
            this.fuelType = FuelType.GASOLINE
            this.transmission = TransmissionType.AUTOMATIC
            this.color = "White"
        }
    }
}
