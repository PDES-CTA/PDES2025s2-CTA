package cta.service

import cta.model.Car
import cta.enum.FuelType
import cta.enum.TransmissionType
import cta.repository.CarRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.Mockito.never
import org.mockito.Mockito.doNothing
import org.mockito.Mockito.any
import org.mockito.junit.jupiter.MockitoExtension
import java.math.BigDecimal
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
        validCar = Car().apply {
            id = 1L
            brand = "Toyota"
            model = "Corolla"
            year = 2022
            price = BigDecimal("25000.00")
            mileage = 15000
            color = "White"
            description = "Excellent condition"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
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
        assertEquals(1L, result.id)
        assertEquals("Toyota", result.brand)
        assertEquals("Corolla", result.model)
        verify(carRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when car not found")
    fun shouldThrowExceptionWhenCarNotFound() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
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
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2023
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findAll()).thenReturn(cars)

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
        `when`(carRepository.findAll()).thenReturn(emptyList())

        // When
        val result = carService.findAll()

        // Then
        assertTrue(result.isEmpty())
        verify(carRepository).findAll()
    }

    // ========== findAvailableCars Tests ==========

    @Test
    @DisplayName("Should find only available cars")
    fun shouldFindOnlyAvailableCars() {
        // Given
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2023
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val availableCars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(availableCars)

        // When
        val result = carService.findAvailableCars()

        // Then
        assertEquals(2, result.size)
        assertTrue(result.all { it.available })
        verify(carRepository).findByAvailableTrue()
    }

    // ========== findByDealership Tests ==========

    @Test
    @DisplayName("Should find cars by dealership")
    fun shouldFindCarsByDealership() {
        // Given
        val dealershipCars = listOf(validCar)
        `when`(carRepository.findByDealershipIdAndAvailableTrue(1L)).thenReturn(dealershipCars)

        // When
        val result = carService.findByDealership(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(1L, result[0].dealershipId)
        verify(carRepository).findByDealershipIdAndAvailableTrue(1L)
    }

    // ========== searchCars Tests ==========

    @Test
    @DisplayName("Should search cars by keyword")
    fun shouldSearchCarsByKeyword() {
        // Given
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2023
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(keyword = "toyota")

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Toyota", result[0].brand)
    }

    @Test
    @DisplayName("Should search cars by price range")
    fun shouldSearchCarsByPriceRange() {
        // Given
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Accord"
            year = 2023
            price = BigDecimal("30000.00")
            mileage = 5000
            color = "Silver"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val car3 = Car().apply {
            id = 3L
            brand = "Mazda"
            model = "3"
            year = 2021
            price = BigDecimal("15000.00")
            mileage = 30000
            color = "Red"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.MANUAL
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val cars = listOf(validCar, car2, car3)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters(
            minPrice = BigDecimal("20000.00"),
            maxPrice = BigDecimal("28000.00")
        )

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(1, result.size)
        assertTrue(result[0].price >= BigDecimal("20000.00"))
        assertTrue(result[0].price <= BigDecimal("28000.00"))
    }

    @Test
    @DisplayName("Should search cars by year range")
    fun shouldSearchCarsByYearRange() {
        // Given
        val car1 = Car().apply {
            id = 1L
            brand = "Toyota"
            model = "Corolla"
            year = 2020
            price = BigDecimal("20000.00")
            mileage = 40000
            color = "White"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2022
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val car3 = Car().apply {
            id = 3L
            brand = "Mazda"
            model = "6"
            year = 2024
            price = BigDecimal("35000.00")
            mileage = 1000
            color = "Black"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
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
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2023
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
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
        val car2 = Car().apply {
            id = 2L
            brand = "Volkswagen"
            model = "Jetta"
            year = 2023
            price = BigDecimal("27000.00")
            mileage = 8000
            color = "Gray"
            fuelType = FuelType.DIESEL
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
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
        val car2 = Car().apply {
            id = 2L
            brand = "Mazda"
            model = "MX-5"
            year = 2023
            price = BigDecimal("32000.00")
            mileage = 5000
            color = "Red"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.MANUAL
            available = true
            dealershipId = 1L
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
    @DisplayName("Should return all available cars when no filters applied")
    fun shouldReturnAllCarsWhenNoFilters() {
        // Given
        val car2 = Car().apply {
            id = 2L
            brand = "Honda"
            model = "Civic"
            year = 2023
            price = BigDecimal("28000.00")
            mileage = 10000
            color = "Blue"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val cars = listOf(validCar, car2)
        `when`(carRepository.findByAvailableTrue()).thenReturn(cars)

        val filters = CarSearchFilters()

        // When
        val result = carService.searchCars(filters)

        // Then
        assertEquals(2, result.size)
    }

    // ========== createCar Tests ==========

    @Test
    @DisplayName("Should create car successfully")
    fun shouldCreateCar() {
        // Given
        val newCar = Car().apply {
            brand = "Ford"
            model = "Mustang"
            year = 2023
            price = BigDecimal("45000.00")
            mileage = 0
            color = "Red"
            description = "Brand new"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }
        val savedCar = Car().apply {
            id = 3L
            brand = "Ford"
            model = "Mustang"
            year = 2023
            price = BigDecimal("45000.00")
            mileage = 0
            color = "Red"
            description = "Brand new"
            fuelType = FuelType.GASOLINE
            transmission = TransmissionType.AUTOMATIC
            available = true
            dealershipId = 1L
            publicationDate = LocalDateTime.now()
        }

        `when`(carRepository.save(any(Car::class.java))).thenReturn(savedCar)

        // When
        val result = carService.createCar(newCar)

        // Then
        assertNotNull(result)
        assertEquals(3L, result.id)
        assertEquals("Ford", result.brand)
        verify(carRepository).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating car with blank brand")
    fun shouldThrowExceptionWhenBrandIsBlank() {
        // Given
        val invalidCar = Car().apply {
            brand = ""
            model = "Model"
            year = 2022
            price = BigDecimal("25000.00")
            mileage = 0
            color = "Blue"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Brand cannot be empty", exception.message)
        verify(carRepository, never()).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating car with blank model")
    fun shouldThrowExceptionWhenModelIsBlank() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = ""
            year = 2022
            price = BigDecimal("25000.00")
            mileage = 0
            color = "Blue"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Model cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when year is too old")
    fun shouldThrowExceptionWhenYearIsTooOld() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Model T"
            year = 1900
            price = BigDecimal("25000.00")
            mileage = 0
            color = "Black"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Year must be greater than 1900", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when year is in the future")
    fun shouldThrowExceptionWhenYearIsInFuture() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Future"
            year = LocalDate.now().year + 2
            price = BigDecimal("25000.00")
            mileage = 0
            color = "Silver"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Year cannot be in the future", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when price is zero or negative")
    fun shouldThrowExceptionWhenPriceIsInvalid() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2022
            price = BigDecimal.ZERO
            mileage = 0
            color = "White"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Price must be greater than zero", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when mileage is negative")
    fun shouldThrowExceptionWhenMileageIsNegative() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2022
            price = BigDecimal("25000.00")
            mileage = -1000
            color = "White"
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Mileage cannot be negative", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when color is blank")
    fun shouldThrowExceptionWhenColorIsBlank() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2022
            price = BigDecimal("25000.00")
            mileage = 0
            color = ""
            dealershipId = 1L
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Color cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when dealership ID is invalid")
    fun shouldThrowExceptionWhenDealershipIdIsInvalid() {
        // Given
        val invalidCar = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2022
            price = BigDecimal("25000.00")
            mileage = 0
            color = "White"
            dealershipId = 0
        }

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            carService.createCar(invalidCar)
        }
        assertEquals("Valid dealership ID is required", exception.message)
    }

    // ========== updateCar Tests ==========

    @Test
    @DisplayName("Should update car successfully with all fields")
    fun shouldUpdateCarWithAllFields() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        val updates = mapOf(
            "brand" to "Honda",
            "model" to "Accord",
            "year" to 2023,
            "price" to "30000.00",
            "mileage" to 20000,
            "color" to "Black",
            "description" to "Updated description",
            "fuelType" to "DIESEL",
            "transmission" to "MANUAL",
            "available" to false
        )

        // When
        val result = carService.updateCar(1L, updates)

        // Then
        assertEquals("Honda", result.brand)
        assertEquals("Accord", result.model)
        assertEquals(2023, result.year)
        assertEquals(BigDecimal("30000.00"), result.price)
        assertEquals(20000, result.mileage)
        assertEquals("Black", result.color)
        assertEquals("Updated description", result.description)
        assertEquals(FuelType.DIESEL, result.fuelType)
        assertEquals(TransmissionType.MANUAL, result.transmission)
        assertFalse(result.available)
        verify(carRepository).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should update only provided fields")
    fun shouldUpdateOnlyProvidedFields() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        val originalBrand = validCar.brand
        val originalModel = validCar.model

        val updates = mapOf("color" to "Blue")

        // When
        val result = carService.updateCar(1L, updates)

        // Then
        assertEquals("Blue", result.color)
        assertEquals(originalBrand, result.brand)
        assertEquals(originalModel, result.model)
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent car")
    fun shouldThrowExceptionWhenUpdatingNonExistentCar() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        val updates = mapOf("color" to "Red")

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            carService.updateCar(999L, updates)
        }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository, never()).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should validate car when updating with invalid data")
    fun shouldValidateWhenUpdatingWithInvalidData() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))

        val updates = mapOf("price" to "0")

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            carService.updateCar(1L, updates)
        }
        verify(carRepository, never()).save(any(Car::class.java))
    }

    // ========== updatePrice Tests ==========

    @Test
    @DisplayName("Should update car price successfully")
    fun shouldUpdateCarPrice() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        val newPrice = BigDecimal("28000.00")

        // When
        val result = carService.updatePrice(1L, newPrice)

        // Then
        assertEquals(newPrice, result.price)
        verify(carRepository).save(any(Car::class.java))
    }

    // ========== markAsSold Tests ==========

    @Test
    @DisplayName("Should mark car as sold")
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
    @DisplayName("Should mark car as available")
    fun shouldMarkCarAsAvailable() {
        // Given
        validCar.available = false
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
        doNothing().`when`(carRepository).delete(any(Car::class.java))

        // When
        carService.deleteCar(1L)

        // Then
        verify(carRepository).findById(1L)
        verify(carRepository).delete(validCar)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent car")
    fun shouldThrowExceptionWhenDeletingNonExistentCar() {
        // Given
        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            carService.deleteCar(999L)
        }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(carRepository, never()).delete(any(Car::class.java))
    }

    // ========== Edge Cases ==========

    @Test
    @DisplayName("Should handle empty update map")
    fun shouldHandleEmptyUpdateMap() {
        // Given
        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(carRepository.save(any(Car::class.java))).thenReturn(validCar)

        val originalBrand = validCar.brand
        val originalModel = validCar.model

        // When
        val result = carService.updateCar(1L, emptyMap())

        // Then
        assertEquals(originalBrand, result.brand)
        assertEquals(originalModel, result.model)
        verify(carRepository).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should accept current year plus one as valid year")
    fun shouldAcceptNextYearAsValid() {
        // Given
        val car = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = LocalDate.now().year + 1
            price = BigDecimal("25000.00")
            mileage = 0
            color = "White"
            dealershipId = 1L
        }
        `when`(carRepository.save(any(Car::class.java))).thenReturn(car)

        // When
        val result = carService.createCar(car)

        // Then
        assertNotNull(result)
        verify(carRepository).save(any(Car::class.java))
    }

    @Test
    @DisplayName("Should handle zero mileage for new cars")
    fun shouldHandleZeroMileage() {
        // Given
        val newCar = Car().apply {
            brand = "Toyota"
            model = "Corolla"
            year = 2024
            price = BigDecimal("25000.00")
            mileage = 0
            color = "White"
            dealershipId = 1L
        }
        `when`(carRepository.save(any(Car::class.java))).thenReturn(newCar)

        // When
        val result = carService.createCar(newCar)

        // Then
        assertEquals(0, result.mileage)
        verify(carRepository).save(any(Car::class.java))
    }
}