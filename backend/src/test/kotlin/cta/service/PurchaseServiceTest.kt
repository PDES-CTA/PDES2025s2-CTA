package cta.service

import cta.enum.PaymentMethod
import cta.enum.PurchaseStatus
import cta.model.Buyer
import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.model.Purchase
import cta.repository.PurchaseRepository
import cta.web.dto.PurchaseCreateRequest
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
import org.mockito.Mockito.any
import org.mockito.Mockito.doNothing
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
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
    private lateinit var carOfferService: CarOfferService

    @Mock
    private lateinit var carService: CarService

    @Mock
    private lateinit var buyerService: BuyerService

    @Mock
    private lateinit var dealershipService: DealershipService

    @InjectMocks
    private lateinit var purchaseService: PurchaseService

    private lateinit var validPurchase: Purchase
    private lateinit var validCar: Car
    private lateinit var validBuyer: Buyer
    private lateinit var validDealership: Dealership
    private lateinit var validCarOffer: CarOffer

    @BeforeEach
    fun setup() {
        validCar =
            Car().apply {
                id = 1L
                brand = "Toyota"
                available = true
            }

        validBuyer =
            Buyer().apply {
                id = 1L
                active = true
            }

        validDealership =
            Dealership().apply {
                id = 1L
                active = true
            }

        validCarOffer =
            CarOffer().apply {
                id = 1L
                car = validCar
                dealership = validDealership
            }

        validPurchase =
            Purchase().apply {
                id = 1L
                buyerId = 1L
                car = validCar
                dealership = validDealership
                finalPrice = BigDecimal("25000.00")
                paymentMethod = PaymentMethod.CASH
                purchaseDate = LocalDateTime.now().minusDays(1)
                purchaseStatus = PurchaseStatus.PENDING
                observations = "Test purchase"
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
        assertEquals(BigDecimal("25000.00"), result.finalPrice)
        verify(purchaseRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when purchase not found")
    fun shouldThrowExceptionWhenPurchaseNotFound() {
        // Given
        `when`(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                purchaseService.findById(999L)
            }
        assertTrue(exception.message!!.contains("Purchase with id 999 not found"))
        verify(purchaseRepository).findById(999L)
    }

    // ========== findAll Tests ==========

    @Test
    @DisplayName("Should find all purchases")
    fun shouldFindAllPurchases() {
        // Given
        val purchases = listOf(validPurchase, validPurchase)
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
        verify(purchaseRepository).findByDealershipId(1L)
    }

    // ========== createPurchase Tests ==========

    @Test
    @DisplayName("Should create purchase successfully")
    fun shouldCreatePurchase() {
        // Given
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(carService).findById(1L)
        verify(buyerService).findById(1L)
        verify(dealershipService).findById(1L)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when car is not available")
    fun shouldThrowExceptionWhenCarNotAvailable() {
        // Given
        val unavailableCar = validCar.apply { available = false }
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(unavailableCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("is not available for purchase"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when buyer is not active")
    fun shouldThrowExceptionWhenBuyerNotActive() {
        // Given
        val inactiveBuyer = validBuyer.apply { active = false }
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(inactiveBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("is not active"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when car not offered by dealership")
    fun shouldThrowExceptionWhenCarNotOffered() {
        // Given
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(null)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("was not offered by dealership"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when final price is zero")
    fun shouldThrowExceptionWhenPriceIsZero() {
        // Given
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal.ZERO,
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("Final price must be greater than zero"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when purchase date is in future")
    fun shouldThrowExceptionWhenDateInFuture() {
        // Given
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().plusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("Purchase date has to be in the past"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when observations exceed 1000 characters")
    fun shouldThrowExceptionWhenObservationsTooLong() {
        // Given
        val request =
            PurchaseCreateRequest(
                carId = 1L,
                buyerId = 1L,
                dealershipId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "a".repeat(1001),
            )

        `when`(carService.findById(1L)).thenReturn(validCar)
        `when`(carOfferService.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)
        `when`(buyerService.findById(1L)).thenReturn(validBuyer)
        `when`(dealershipService.findById(1L)).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("cannot exceed 1000 characters"))
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    // ========== updatePurchase Tests ==========

    @Test
    @DisplayName("Should update purchase successfully")
    fun shouldUpdatePurchase() {
        // Given
        val updateData = mapOf("finalPrice" to "30000.00")
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.updatePurchase(1L, updateData)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent purchase")
    fun shouldThrowExceptionWhenUpdatingNonExistentPurchase() {
        // Given
        val updateData = mapOf("finalPrice" to "30000.00")
        `when`(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            purchaseService.updatePurchase(999L, updateData)
        }
        verify(purchaseRepository, never()).save(any(Purchase::class.java))
    }

    // ========== deletePurchase Tests ==========

    @Test
    @DisplayName("Should delete purchase successfully")
    fun shouldDeletePurchase() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        doNothing().`when`(purchaseRepository).delete(validPurchase)

        // When
        purchaseService.deletePurchase(1L)

        // Then
        verify(purchaseRepository).delete(validPurchase)
    }

    // ========== markAsConfirmed Tests ==========

    @Test
    @DisplayName("Should mark purchase as confirmed")
    fun shouldMarkAsConfirmed() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsConfirmed(1L)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsPending Tests ==========

    @Test
    @DisplayName("Should mark purchase as pending")
    fun shouldMarkAsPending() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsPending(1L)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsCanceled Tests ==========

    @Test
    @DisplayName("Should mark purchase as canceled")
    fun shouldMarkAsCanceled() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsCanceled(1L)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }

    // ========== markAsDelivered Tests ==========

    @Test
    @DisplayName("Should mark purchase as delivered")
    fun shouldMarkAsDelivered() {
        // Given
        `when`(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        `when`(purchaseRepository.save(any(Purchase::class.java))).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsDelivered(1L)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any(Purchase::class.java))
    }
}
