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
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
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
    private lateinit var buyerService: BuyerService

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
                model = "Corolla"
            }

        validBuyer =
            Buyer().apply {
                id = 1L
                firstName = "John"
                lastName = "Doe"
                email = "john@example.com"
                phone = "123456789"
                active = true
            }

        validDealership =
            Dealership().apply {
                id = 1L
                businessName = "Test Dealership"
                active = true
            }

        validCarOffer =
            CarOffer().apply {
                id = 1L
                car = validCar
                dealership = validDealership
                price = BigDecimal("25000.00")
                available = true
            }

        validPurchase =
            Purchase().apply {
                id = 1L
                buyer = validBuyer
                carOffer = validCarOffer
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
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))

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
        whenever(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

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
        whenever(purchaseRepository.findAll()).thenReturn(purchases)

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
        whenever(purchaseRepository.findAll()).thenReturn(emptyList())

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
        whenever(purchaseRepository.findByBuyerId(1L)).thenReturn(purchases)

        // When
        val result = purchaseService.findByBuyerId(1L)

        // Then
        assertEquals(1, result.size)
        verify(purchaseRepository).findByBuyerId(1L)
    }

    // ========== findByCarId Tests ==========

    @Test
    @DisplayName("Should find purchases by car id")
    fun shouldFindPurchasesByCarId() {
        // Given
        val purchases = listOf(validPurchase)
        whenever(purchaseRepository.findByCarOfferCarId(1L)).thenReturn(purchases)

        // When
        val result = purchaseService.findByCarId(1L)

        // Then
        assertEquals(1, result.size)
        assertEquals(1L, result[0].carOffer.car.id)
        verify(purchaseRepository).findByCarOfferCarId(1L)
    }

    // ========== findByDealershipId Tests ==========

    @Test
    @DisplayName("Should find purchases by dealership id")
    fun shouldFindPurchasesByDealershipId() {
        // Given
        val purchases = listOf(validPurchase)
        whenever(purchaseRepository.findByCarOfferDealershipId(1L)).thenReturn(purchases)

        // When
        val result = purchaseService.findByDealershipId(1L)

        // Then
        assertEquals(1, result.size)
        verify(purchaseRepository).findByCarOfferDealershipId(1L)
    }

    // ========== createPurchase Tests ==========

    @Test
    @DisplayName("Should create purchase successfully")
    fun shouldCreatePurchase() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.createPurchase(request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(carOfferService).findById(1L)
        verify(buyerService).findById(1L)
        verify(purchaseRepository).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when buyer is not active")
    fun shouldThrowExceptionWhenBuyerNotActive() {
        // Given
        val inactiveBuyer = validBuyer.apply { active = false }
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(inactiveBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("is not active"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when dealership is not active")
    fun shouldThrowExceptionWhenDealershipNotActive() {
        // Given
        val inactiveDealership = validDealership.apply { active = false }
        val carOfferWithInactiveDealership = validCarOffer.apply { dealership = inactiveDealership }
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(carOfferWithInactiveDealership)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("is not active"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when final price is zero")
    fun shouldThrowExceptionWhenPriceIsZero() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal.ZERO,
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("Final price must be greater than zero"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when final price is negative")
    fun shouldThrowExceptionWhenPriceIsNegative() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("-100.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("Final price must be greater than zero"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when final price exceeds maximum")
    fun shouldThrowExceptionWhenPriceExceedsMaximum() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("100000000000000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("exceeds maximum allowed value"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when final price has more than 2 decimal places")
    fun shouldThrowExceptionWhenPriceHasTooManyDecimals() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.123"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("cannot have more than 2 decimal places"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when purchase date is in future")
    fun shouldThrowExceptionWhenDateInFuture() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().plusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("Purchase date has to be in the past"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when purchase date is before year 2000")
    fun shouldThrowExceptionWhenDateBeforeYear2000() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.of(1999, 12, 31, 23, 59),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "Test",
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("must be after January 1, 2000"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when observations exceed 1000 characters")
    fun shouldThrowExceptionWhenObservationsTooLong() {
        // Given
        val request =
            PurchaseCreateRequest(
                carOfferId = 1L,
                buyerId = 1L,
                finalPrice = BigDecimal("25000.00"),
                paymentMethod = PaymentMethod.CASH,
                purchaseDate = LocalDateTime.now().minusDays(1),
                purchaseStatus = PurchaseStatus.PENDING,
                observations = "a".repeat(1001),
            )

        whenever(carOfferService.findById(1L)).thenReturn(validCarOffer)
        whenever(buyerService.findById(1L)).thenReturn(validBuyer)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                purchaseService.createPurchase(request)
            }
        assertTrue(exception.message!!.contains("cannot exceed 1000 characters"))
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    // ========== updatePurchase Tests ==========

    @Test
    @DisplayName("Should update purchase successfully")
    fun shouldUpdatePurchase() {
        // Given
        val updateData = mapOf("finalPrice" to "30000.00")
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.updatePurchase(1L, updateData)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should update multiple fields successfully")
    fun shouldUpdateMultipleFields() {
        // Given
        val updateData =
            mapOf(
                "finalPrice" to "30000.00",
                "paymentMethod" to "CREDIT_CARD",
                "observations" to "Updated observations",
            )
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.updatePurchase(1L, updateData)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent purchase")
    fun shouldThrowExceptionWhenUpdatingNonExistentPurchase() {
        // Given
        val updateData = mapOf("finalPrice" to "30000.00")
        whenever(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            purchaseService.updatePurchase(999L, updateData)
        }
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    @Test
    @DisplayName("Should throw validation exception during update")
    fun shouldThrowValidationExceptionDuringUpdate() {
        // Given
        val updateData = mapOf("finalPrice" to "0")
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            purchaseService.updatePurchase(1L, updateData)
        }
        verify(purchaseRepository, never()).save(any<Purchase>())
    }

    // ========== deletePurchase Tests ==========

    @Test
    @DisplayName("Should delete purchase successfully")
    fun shouldDeletePurchase() {
        // Given
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))

        // When
        purchaseService.deletePurchase(1L)

        // Then
        verify(carOfferService).save(validCarOffer)
        verify(purchaseRepository).delete(validPurchase)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent purchase")
    fun shouldThrowExceptionWhenDeletingNonExistentPurchase() {
        // Given
        whenever(purchaseRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            purchaseService.deletePurchase(999L)
        }
        verify(purchaseRepository, never()).delete(any<Purchase>())
    }

    // ========== markAsConfirmed Tests ==========

    @Test
    @DisplayName("Should mark purchase as confirmed")
    fun shouldMarkAsConfirmed() {
        // Given
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsConfirmed(1L)

        // Then
        assertNotNull(result)
        verify(carOfferService).save(validCarOffer)
        verify(purchaseRepository).save(any<Purchase>())
    }

    // ========== markAsPending Tests ==========

    @Test
    @DisplayName("Should mark purchase as pending")
    fun shouldMarkAsPending() {
        // Given
        validCarOffer.available = false
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsPending(1L)

        // Then
        assertNotNull(result)
        verify(carOfferService).save(validCarOffer)
        verify(purchaseRepository).save(any<Purchase>())
    }

    // ========== markAsCanceled Tests ==========

    @Test
    @DisplayName("Should mark purchase as canceled")
    fun shouldMarkAsCanceled() {
        // Given
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsCanceled(1L)

        // Then
        assertNotNull(result)
        verify(carOfferService).save(validCarOffer)
        verify(purchaseRepository).save(any<Purchase>())
    }

    // ========== markAsDelivered Tests ==========

    @Test
    @DisplayName("Should mark purchase as delivered")
    fun shouldMarkAsDelivered() {
        // Given
        whenever(purchaseRepository.findById(1L)).thenReturn(Optional.of(validPurchase))
        whenever(purchaseRepository.save(any<Purchase>())).thenReturn(validPurchase)

        // When
        val result = purchaseService.markAsDelivered(1L)

        // Then
        assertNotNull(result)
        verify(purchaseRepository).save(any<Purchase>())
    }
}
