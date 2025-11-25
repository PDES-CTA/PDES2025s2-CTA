package cta.service

import cta.model.Car
import cta.model.CarOffer
import cta.model.Dealership
import cta.repository.CarOfferRepository
import cta.web.dto.CarOfferCreateRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
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
import org.springframework.data.repository.findByIdOrNull
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("CarOfferService Tests")
class CarOfferServiceTest {
    @Mock
    private lateinit var carOfferRepository: CarOfferRepository

    @Mock
    private lateinit var carService: CarService

    @Mock
    private lateinit var dealershipService: DealershipService

    @InjectMocks
    private lateinit var carOfferService: CarOfferService

    private lateinit var validCar: Car
    private lateinit var validDealership: Dealership
    private lateinit var validCarOffer: CarOffer

    @BeforeEach
    fun setup() {
        validCar =
            Car().apply {
                id = 1L
                brand = "Toyota"
                model = "Corolla"
                year = 2020
            }

        validDealership =
            Dealership().apply {
                id = 1L
                businessName = "Test Dealership"
                cuit = "30-12345678-9"
                email = "contact@dealership.com"
                active = true
            }

        validCarOffer =
            CarOffer().apply {
                id = 1L
                car = validCar
                dealership = validDealership
                price = BigDecimal("25000.00")
                dealershipNotes = "Excellent condition"
                available = true
                offerDate = LocalDateTime.now()
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find car offer by id successfully")
    fun shouldFindCarOfferById() {
        // Given
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(validCarOffer))

        // When
        val result = carOfferService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(BigDecimal("25000.00"), result.price)
        verify(carOfferRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when car offer not found by id")
    fun shouldThrowExceptionWhenCarOfferNotFound() {
        // Given
        whenever(carOfferRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                carOfferService.findById(999L)
            }
        assertTrue(exception.message!!.contains("Car offer with ID 999 does not exist"))
        verify(carOfferRepository).findById(999L)
    }

    // ========== findAvailableCarOffers Tests ==========

    @Test
    @DisplayName("Should find all available car offers")
    fun shouldFindAllAvailableCarOffers() {
        // Given
        val carOffers = listOf(validCarOffer, validCarOffer)
        whenever(carOfferRepository.findByAvailableTrue()).thenReturn(carOffers)

        // When
        val result = carOfferService.findAvailableCarOffers()

        // Then
        assertEquals(2, result.size)
        verify(carOfferRepository).findByAvailableTrue()
    }

    @Test
    @DisplayName("Should return empty list when no available car offers exist")
    fun shouldReturnEmptyListWhenNoAvailableCarOffers() {
        // Given
        whenever(carOfferRepository.findByAvailableTrue()).thenReturn(emptyList())

        // When
        val result = carOfferService.findAvailableCarOffers()

        // Then
        assertTrue(result.isEmpty())
        verify(carOfferRepository).findByAvailableTrue()
    }

    // ========== findByDealershipId Tests ==========

    @Test
    @DisplayName("Should find car offers by dealership id")
    fun shouldFindCarOffersByDealershipId() {
        // Given
        val carOffers = listOf(validCarOffer)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(carOffers)

        // When
        val result = carOfferService.findByDealershipId(1L)

        // Then
        assertEquals(1, result.size)
        verify(carOfferRepository).findByDealershipId(1L)
    }

    // ========== findByDealershipIdAndAvailableTrue Tests ==========

    @Test
    @DisplayName("Should find available car offers by dealership id")
    fun shouldFindAvailableCarOffersByDealershipId() {
        // Given
        val carOffers = listOf(validCarOffer)
        whenever(carOfferRepository.findByDealershipIdAndAvailableTrue(1L)).thenReturn(carOffers)

        // When
        val result = carOfferService.findByDealershipIdAndAvailableTrue(1L)

        // Then
        assertEquals(1, result.size)
        verify(carOfferRepository).findByDealershipIdAndAvailableTrue(1L)
    }

    // ========== findAll Tests ==========

    @Test
    @DisplayName("Should find all car offers")
    fun shouldFindAllCarOffers() {
        // Given
        val carOffers = listOf(validCarOffer, validCarOffer)
        whenever(carOfferRepository.findAll()).thenReturn(carOffers)

        // When
        val result = carOfferService.findAll()

        // Then
        assertEquals(2, result.size)
        verify(carOfferRepository).findAll()
    }

    // ========== findByCarIdAndDealershipId Tests ==========

    @Test
    @DisplayName("Should find car offer by car id and dealership id")
    fun shouldFindCarOfferByCarIdAndDealershipId() {
        // Given
        whenever(carOfferRepository.findByCarIdAndDealershipId(1L, 1L)).thenReturn(validCarOffer)

        // When
        val result = carOfferService.findByCarIdAndDealershipId(1L, 1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result!!.id)
        verify(carOfferRepository).findByCarIdAndDealershipId(1L, 1L)
    }

    @Test
    @DisplayName("Should return null when car offer not found by car id and dealership id")
    fun shouldReturnNullWhenCarOfferNotFoundByCarIdAndDealershipId() {
        // Given
        whenever(carOfferRepository.findByCarIdAndDealershipId(1L, 1L)).thenReturn(null)

        // When
        val result = carOfferService.findByCarIdAndDealershipId(1L, 1L)

        // Then
        assertNull(result)
        verify(carOfferRepository).findByCarIdAndDealershipId(1L, 1L)
    }

    // ========== createCarOffer Tests ==========

    @Test
    @DisplayName("Should create car offer successfully")
    fun shouldCreateCarOffer() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Excellent condition",
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())
        whenever(carOfferRepository.save(any<CarOffer>())).thenReturn(validCarOffer)

        // When
        val result = carOfferService.createCarOffer(request)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(carService).findById(1L)
        verify(dealershipService).findById(1L)
        verify(carOfferRepository).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when car is already offered by dealership")
    fun shouldThrowExceptionWhenCarAlreadyOfferedByDealership() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Test",
            )

        val existingOffer = validCarOffer
        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(listOf(existingOffer))

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("is already being offered by dealership"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when price is zero")
    fun shouldThrowExceptionWhenPriceIsZero() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal.ZERO,
                dealershipNotes = "Test",
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("Price must be greater than zero"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when price is negative")
    fun shouldThrowExceptionWhenPriceIsNegative() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("-100.00"),
                dealershipNotes = "Test",
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("Price must be greater than zero"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when price exceeds maximum")
    fun shouldThrowExceptionWhenPriceExceedsMaximum() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("100000000.00"),
                dealershipNotes = "Test",
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("Price cannot exceed"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when dealership is not active")
    fun shouldThrowExceptionWhenDealershipNotActive() {
        // Given
        val inactiveDealership = validDealership.apply { active = false }
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "Test",
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(inactiveDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("Cannot create offer for inactive dealership"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when dealership notes exceed 1000 characters")
    fun shouldThrowExceptionWhenNotesTooLong() {
        // Given
        val request =
            CarOfferCreateRequest(
                carId = 1L,
                dealershipId = 1L,
                price = BigDecimal("25000.00"),
                dealershipNotes = "a".repeat(1001),
            )

        whenever(carService.findById(1L)).thenReturn(validCar)
        whenever(dealershipService.findById(1L)).thenReturn(validDealership)
        whenever(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                carOfferService.createCarOffer(request)
            }
        assertTrue(exception.message!!.contains("Dealership notes cannot exceed 1000 characters"))
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    // ========== updateCarOffer Tests ==========

    @Test
    @DisplayName("Should update car offer successfully")
    fun shouldUpdateCarOffer() {
        // Given
        val updateData = mapOf("price" to "30000.00")
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(validCarOffer))
        whenever(carOfferRepository.save(any<CarOffer>())).thenReturn(validCarOffer)

        // When
        val result = carOfferService.updateCarOffer(1L, updateData)

        // Then
        assertNotNull(result)
        verify(carOfferRepository).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should update price and dealership notes")
    fun shouldUpdatePriceAndDealershipNotes() {
        // Given
        val updateData =
            mapOf(
                "price" to "30000.00",
                "dealershipNotes" to "Updated notes",
            )
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(validCarOffer))
        whenever(carOfferRepository.save(any<CarOffer>())).thenReturn(validCarOffer)

        // When
        val result = carOfferService.updateCarOffer(1L, updateData)

        // Then
        assertNotNull(result)
        verify(carOfferRepository).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent car offer")
    fun shouldThrowExceptionWhenUpdatingNonExistentCarOffer() {
        // Given
        val updateData = mapOf("price" to "30000.00")
        whenever(carOfferRepository.findByIdOrNull(999L)).thenReturn(null)

        // When & Then
        assertThrows(Exception::class.java) {
            carOfferService.updateCarOffer(999L, updateData)
        }
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw validation exception during update")
    fun shouldThrowValidationExceptionDuringUpdate() {
        // Given
        val updateData = mapOf("price" to "0")
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(validCarOffer))

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            carOfferService.updateCarOffer(1L, updateData)
        }
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }

    // ========== deleteCarOffer Tests ==========

    @Test
    @DisplayName("Should delete car offer successfully")
    fun shouldDeleteCarOffer() {
        // Given
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(validCarOffer))

        // When
        carOfferService.deleteCarOffer(1L)

        // Then
        verify(carOfferRepository).delete(validCarOffer)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent car offer")
    fun shouldThrowExceptionWhenDeletingNonExistentCarOffer() {
        // Given
        whenever(carOfferRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows(NoSuchElementException::class.java) {
            carOfferService.deleteCarOffer(999L)
        }
        verify(carOfferRepository, never()).delete(any<CarOffer>())
    }

    // ========== save Tests ==========

    @Test
    @DisplayName("Should save car offer successfully")
    fun shouldSaveCarOffer() {
        // Given
        whenever(carOfferRepository.save(any<CarOffer>())).thenReturn(validCarOffer)

        // When
        val result = carOfferService.save(validCarOffer)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        verify(carOfferRepository).save(validCarOffer)
    }

    // ========== markAsUnavailable Tests ==========

    @Test
    @DisplayName("Should mark car offer as unavailable successfully")
    fun shouldMarkAsUnavailable() {
        // Given
        val availableOffer = validCarOffer.apply { available = true }
        whenever(carOfferRepository.findById(1L)).thenReturn(Optional.of(availableOffer))
        whenever(carOfferRepository.save(any<CarOffer>())).thenReturn(validCarOffer)

        // When
        val result = carOfferService.markAsUnavailable(1L)

        // Then
        assertNotNull(result)
        verify(carOfferRepository).save(any<CarOffer>())
    }

    @Test
    @DisplayName("Should throw exception when marking non-existent offer as unavailable")
    fun shouldThrowExceptionWhenMarkingNonExistentOfferAsUnavailable() {
        // Given
        whenever(carOfferRepository.findByIdOrNull(999L)).thenReturn(null)

        // When & Then
        assertThrows(Exception::class.java) {
            carOfferService.markAsUnavailable(999L)
        }
        verify(carOfferRepository, never()).save(any<CarOffer>())
    }
}
