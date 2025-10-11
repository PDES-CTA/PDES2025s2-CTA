package cta.service

import cta.enum.FuelType
import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.enum.TransmissionType
import cta.model.Car
import cta.model.Dealership
import cta.model.Purchase
import cta.repository.CarRepository
import cta.repository.DealershipRepository
import cta.repository.PurchaseRepository
import cta.web.dto.PurchaseCreateRequest
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
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("PurchaseService Tests")
class PurchaseServiceTest {

    @Mock
    private lateinit var purchaseRepository: PurchaseRepository

    @Mock
    private lateinit var carRepository: CarRepository

    @Mock
    private lateinit var dealershipRepository: DealershipRepository

    @InjectMocks
    private lateinit var purchaseService: PurchaseService

    private lateinit var validCar: Car
    private lateinit var validDealership: Dealership
    private lateinit var validPurchase: Purchase

    @BeforeEach
    fun setup() {
        validDealership = Dealership().apply {
            id = 1L
            businessName = "AutoMax S.A."
            cuit = "20123456789"
            email = "contact@automax.com"
            phone = "1234567890"
            address = "Av. Corrientes 1234"
            city = "Buenos Aires"
            province = "Buenos Aires"
            firstName = "Juan"
            lastName = "Pérez"
            active = true
            registrationDate = LocalDateTime.now()
        }

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

        validPurchase = Purchase().apply {
            id = 1L
            buyerId = 1L
            car = validCar
            dealership = validDealership
            finalPrice = BigDecimal("24500.00")
            purchaseDate = LocalDateTime.now().minusDays(1)
            purchaseStatus = PurchaseStatus.CONFIRMED
            paymentMethod = PaymentMethod.CASH
            observations = "Quick purchase"
        }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find purchase by id successfully")
    fun shouldFindPurchaseById() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))

        // When
        val result = purchaseService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(validCar, result.car)
        assertEquals(validDealership, result.dealership)
        verify(purchaseRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when purchase not found")
    fun shouldThrowExceptionWhenPurchaseNotFound() {
        // Given
        `when`(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            purchaseService.findById(999L)
        }
        assertEquals("Purchase with id 999 not found", exception.message)
        verify(purchaseRepository).findById(999L)
    }

    // ========== findAll Tests ==========

    @Test
    @DisplayName("Should find all purchases")
    fun shouldFindAllPurchases() {
        // Given
        val purchase2 = Purchase().apply {
            id = 2L
            buyerId = 2L
            car = validCar
            dealership = validDealership
            finalPrice = BigDecimal("25000.00")
            purchaseDate = LocalDateTime.now().minusDays(2)
            purchaseStatus = PurchaseStatus.PENDING
            paymentMethod = PaymentMethod.CASH
        }
        val purchases = listOf(validPurchase, purchase2)
        `when`(purchaseRepository.findAll()).thenReturn(purchases)

        // When
        val result = purchaseService.findAll()

        // Then
        assertEquals(2, result.size)
        verify(purchaseRepository).findAll()
    }

    @Test
    @DisplayName("Should return empty list when no purchases exist")
    fun shouldReturnEmptyListWhenNoPurchasesExist() {
        // Given
        `when`(purchaseRepository.findAll()).thenReturn(emptyList())

        // When
        val result = purchaseService.findAll()

        // Then
        assertTrue(result.isEmpty())
        verify(purchaseRepository).findAll()
    }

    // ========== findByBuyerId Tests ==========

    @Test
    @DisplayName("Should find purchases by buyer id")
    fun shouldFindPurchasesByBuyerId() {
        // Given
        val purchases = listOf(validPurchase)
        `when`(purchaseRepository.findByBuyerId(1L)).thenReturn(purchases)

        // When
        val result = purchaseService.findByBuyerId(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(1L, result[0].buyerId)
        verify(purchaseRepository).findByBuyerId(1L)
    }

    // ========== findByCarId Tests ==========

    @Test
    @DisplayName("Should find purchase by car id")
    fun shouldFindPurchaseByCarId() {
        // Given
        `when`(purchaseRepository.findByCarId(1L)).thenReturn(validPurchase)

        // When
        val result = purchaseService.findByCarId(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.car.id)
        verify(purchaseRepository).findByCarId(1L)
    }

    // ========== findByDealershipId Tests ==========

    @Test
    @DisplayName("Should find purchases by dealership id")
    fun shouldFindPurchasesByDealershipId() {
        // Given
        val purchases = listOf(validPurchase)
        `when`(purchaseRepository.findByDealershipId(1L)).thenReturn(purchases)

        // When
        val result = purchaseService.findByDealershipId(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(1L, result[0].dealership.id)
        verify(purchaseRepository).findByDealershipId(1L)
    }

    // ========== createPurchase Tests ==========

    @Test
    @DisplayName("Should create purchase successfully")
    fun shouldCreatePurchaseSuccessfully() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CREDIT_CARD,
            observations = "Quick purchase"
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        assertEquals(validCar, result.car)
        assertEquals(validDealership, result.dealership)
        assertEquals(BigDecimal("24500.00"), result.finalPrice)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating purchase with non-existent car")
    fun shouldThrowExceptionWhenCarNotFound() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 999L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Car with ID 999 not found", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating purchase with non-existent dealership")
    fun shouldThrowExceptionWhenDealershipNotFound() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 999L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Dealership with ID 999 not found", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when car is not available")
    fun shouldThrowExceptionWhenCarNotAvailable() {
        // Given
        validCar.available = false
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Car 1 is not available for purchase", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when car doesn't belong to dealership")
    fun shouldThrowExceptionWhenCarDoesntBelongToDealership() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 2L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        val differentDealership = Dealership().apply {
            id = 2L
            businessName = "OtherAuto S.A."
            cuit = "20999888777"
            email = "contact@otherauto.com"
            phone = "9998887777"
            firstName = "María"
            lastName = "González"
            active = true
            registrationDate = LocalDateTime.now()
        }

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(2L)).thenReturn(Optional.of(differentDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Car 1 doesn't belong to dealership 2", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when final price is zero")
    fun shouldThrowExceptionWhenFinalPriceIsZero() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal.ZERO,
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Final price must be greater than zero", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when final price is negative")
    fun shouldThrowExceptionWhenFinalPriceIsNegative() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("-1000.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Final price must be greater than zero", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when final price exceeds maximum")
    fun shouldThrowExceptionWhenFinalPriceExceedsMaximum() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("100000000000000.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Final price exceeds maximum allowed value", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when final price has more than 2 decimal places")
    fun shouldThrowExceptionWhenFinalPriceHasTooManyDecimals() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.123"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Final price cannot have more than 2 decimal places", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when purchase date is in the future")
    fun shouldThrowExceptionWhenPurchaseDateIsInFuture() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().plusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertTrue(exception.message?.contains("Purchase date") == true)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when purchase date is before year 2000")
    fun shouldThrowExceptionWhenPurchaseDateIsBeforeYear2000() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.of(1999, 12, 31, 23, 59),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Purchase date must be after January 1, 2000", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should accept purchase date on January 1, 2000 00:00:01")
    fun shouldAcceptPurchaseDateOnJanuary1_2000() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.of(2000, 1, 1, 0, 0, 1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        val purchaseWithMinDate = Purchase().apply {
            id = 2L
            buyerId = 1L
            car = validCar
            dealership = validDealership
            finalPrice = BigDecimal("24500.00")
            purchaseDate = LocalDateTime.of(2000, 1, 1, 0, 0, 1)
            purchaseStatus = PurchaseStatus.CONFIRMED
            paymentMethod = PaymentMethod.CASH
        }

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(purchaseWithMinDate)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when observations exceed 1000 characters")
    fun shouldThrowExceptionWhenObservationsExceed1000Characters() {
        // Given
        val longObservations = "a".repeat(1001)
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = longObservations
        )

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception = assertThrows(IllegalArgumentException::class.java) {
            purchaseService.createPurchase(request)
        }
        assertEquals("Observations cannot exceed 1000 characters", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should accept observations with exactly 1000 characters")
    fun shouldAcceptObservationsWith1000Characters() {
        // Given
        val maxObservations = "a".repeat(1000)
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = maxObservations
        )

        val purchaseWithMaxObservations = Purchase().apply {
            id = 3L
            buyerId = 1L
            car = validCar
            dealership = validDealership
            finalPrice = BigDecimal("24500.00")
            purchaseDate = LocalDateTime.now().minusDays(1)
            purchaseStatus = PurchaseStatus.CONFIRMED
            paymentMethod = PaymentMethod.CASH
            observations = maxObservations
        }

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(purchaseWithMaxObservations)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        assertEquals(1000, result.observations?.length)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should create purchase without observations")
    fun shouldCreatePurchaseWithBlankObservations() {
        // Given
        val request = PurchaseCreateRequest(
            buyerId = 1L,
            carId = 1L,
            dealershipId = 1L,
            finalPrice = BigDecimal("24500.00"),
            purchaseDate = LocalDateTime.now().minusDays(1),
            purchaseStatus = PurchaseStatus.CONFIRMED,
            paymentMethod = PaymentMethod.CASH,
            observations = ""
        )

        val purchaseWithoutObservations = Purchase().apply {
            id = 4L
            buyerId = 1L
            car = validCar
            dealership = validDealership
            finalPrice = BigDecimal("24500.00")
            purchaseDate = LocalDateTime.now().minusDays(1)
            purchaseStatus = PurchaseStatus.CONFIRMED
            paymentMethod = PaymentMethod.CASH
            observations = null
        }

        `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(purchaseWithoutObservations)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        assertNull(result.observations)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== updatePurchase Tests ==========

    @Test
    @DisplayName("Should update purchase successfully with all fields")
    fun shouldUpdatePurchaseWithAllFields() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        val updates = mapOf(
            "finalPrice" to "25000.00",
            "purchaseDate" to LocalDateTime.now().minusDays(2).toString(),
            "purchaseStatus" to "PENDING",
            "paymentMethod" to "CASH",
            "observations" to "Updated observations"
        )

        // When
        val result = purchaseService.updatePurchase(1L, updates)

        // Then
        assertEquals(BigDecimal("25000.00"), result.finalPrice)
        assertEquals(PurchaseStatus.PENDING, result.purchaseStatus)
        assertEquals(PaymentMethod.CASH, result.paymentMethod)
        assertEquals("Updated observations", result.observations)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should update only provided fields")
    fun shouldUpdateOnlyProvidedFields() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        val originalPrice = validPurchase.finalPrice
        val originalStatus = validPurchase.purchaseStatus

        val updates = mapOf("observations" to "Only observation updated")

        // When
        val result = purchaseService.updatePurchase(1L, updates)

        // Then
        assertEquals("Only observation updated", result.observations)
        assertEquals(originalPrice, result.finalPrice)
        assertEquals(originalStatus, result.purchaseStatus)
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent purchase")
    fun shouldThrowExceptionWhenUpdatingNonExistentPurchase() {
        // Given
        `when`(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        val updates = mapOf("observations" to "Test")

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            purchaseService.updatePurchase(999L, updates)
        }
        assertEquals("Purchase with id 999 not found", exception.message)
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating with invalid final price")
    fun shouldThrowExceptionWhenUpdatingWithInvalidFinalPrice() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))

        val updates = mapOf("finalPrice" to "0")

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            purchaseService.updatePurchase(1L, updates)
        }
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    // ========== deletePurchase Tests ==========

    @Test
    @DisplayName("Should delete purchase successfully")
    fun shouldDeletePurchaseSuccessfully() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        doNothing().`when`(purchaseRepository).delete(any(Purchase::class.java))

        // When
        purchaseService.deletePurchase(1L)

        // Then
        verify(purchaseRepository).findById(1L)
        verify(purchaseRepository).delete(validPurchase)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent purchase")
    fun shouldThrowExceptionWhenDeletingNonExistentPurchase() {
        // Given
        `when`(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception = assertThrows(NoSuchElementException::class.java) {
            purchaseService.deletePurchase(999L)
        }
        assertEquals("Purchase with id 999 not found", exception.message)
        verify(purchaseRepository, never()).delete(any(Purchase::class.java))
    }

    // ========== markAsConfirmed Tests ==========

    @Test
    @DisplayName("Should mark purchase as confirmed")
    fun shouldMarkPurchaseAsConfirmed() {
        // Given
        validPurchase.purchaseStatus = PurchaseStatus.PENDING
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsConfirmed(1L)

        // Then
        assertEquals(PurchaseStatus.CONFIRMED, result.purchaseStatus)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsPending Tests ==========

    @Test
    @DisplayName("Should mark purchase as pending")
    fun shouldMarkPurchaseAsPending() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsPending(1L)

        // Then
        assertEquals(PurchaseStatus.PENDING, result.purchaseStatus)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsCanceled Tests ==========

    @Test
    @DisplayName("Should mark purchase as canceled")
    fun shouldMarkPurchaseAsCanceled() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsCanceled(1L)

        // Then
        assertEquals(PurchaseStatus.CANCELLED, result.purchaseStatus)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsDelivered Tests ==========

    @Test
    @DisplayName("Should mark purchase as delivered")
    fun shouldMarkPurchaseAsDelivered() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsDelivered(1L)

        // Then
        assertEquals(PurchaseStatus.DELIVERED, result.purchaseStatus)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== Edge Cases ==========

    @Test
    @DisplayName("Should handle empty update map")
    fun shouldHandleEmptyUpdateMap() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        val originalPrice = validPurchase.finalPrice
        val originalStatus = validPurchase.purchaseStatus

        // When
        val result = purchaseService.updatePurchase(1L, emptyMap())

        // Then
        assertEquals(originalPrice, result.finalPrice)
        assertEquals(originalStatus, result.purchaseStatus)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should create purchase with all payment methods")
    fun shouldCreatePurchaseWithAllPaymentMethods() {
        // Test for each payment method
        val paymentMethods = listOf(
            PaymentMethod.CASH,
            PaymentMethod.CHECK,
            PaymentMethod.CREDIT_CARD,
        )

        paymentMethods.forEachIndexed { index, paymentMethod ->
            val request = PurchaseCreateRequest(
                buyerId = 1L,
                carId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("24500.00"),
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.CONFIRMED,
                paymentMethod = paymentMethod,
                observations = ""
            )

            val purchase = Purchase().apply {
                id = index.toLong() + 10
                buyerId = 1L
                car = validCar
                dealership = validDealership
                finalPrice = BigDecimal("24500.00")
                purchaseDate = LocalDateTime.now().minusDays(1)
                purchaseStatus = PurchaseStatus.CONFIRMED
                this.paymentMethod = paymentMethod
            }

            `when`(carRepository.findById(1L)).thenReturn(Optional.of(validCar))
            `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
            `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(purchase)

            // When
            val result = purchaseService.createPurchase(request)

            // Then
            assertEquals(paymentMethod, result.paymentMethod)
        }
    }
}