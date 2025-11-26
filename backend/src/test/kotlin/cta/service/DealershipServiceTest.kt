package cta.service

import cta.model.Dealership
import cta.repository.CarOfferRepository
import cta.repository.DealershipRepository
import cta.web.dto.DealershipCreateRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
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
import org.mockito.Mockito.any
import org.mockito.Mockito.doNothing
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("DealershipService Tests")
class DealershipServiceTest {
    @Mock
    private lateinit var dealershipRepository: DealershipRepository

    @Mock
    private lateinit var carOfferRepository: CarOfferRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @InjectMocks
    private lateinit var dealershipService: DealershipService

    private lateinit var validDealership: Dealership

    @BeforeEach
    fun setup() {
        validDealership =
            Dealership().apply {
                id = 1L
                businessName = "AutoMax S.A."
                cuit = "20123456789"
                email = "contact@automax.com"
                phone = "1234567890"
                address = "Av. Corrientes 1234"
                city = "Buenos Aires"
                province = "Buenos Aires"
                description = "Premium car dealership"
                firstName = "Juan"
                lastName = "Pérez"
                active = true
                registrationDate = LocalDateTime.now()
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find dealership by id successfully")
    fun shouldFindDealershipById() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When
        val result = dealershipService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals("AutoMax S.A.", result.businessName)
        assertEquals("20123456789", result.cuit)
        verify(dealershipRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when dealership not found")
    fun shouldThrowExceptionWhenDealershipNotFound() {
        // Given
        `when`(dealershipRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                dealershipService.findById(999L)
            }
        assertEquals("Dealership with ID 999 not found", exception.message)
        verify(dealershipRepository).findById(999L)
    }

    // ========== findAll Tests ==========

    @Test
    @DisplayName("Should find all dealerships")
    fun shouldFindAllDealerships() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findAll()).thenReturn(dealerships)

        // When
        val result = dealershipService.findAll()

        // Then
        assertEquals(2, result.size)
        verify(dealershipRepository).findAll()
    }

    @Test
    @DisplayName("Should return empty list when no dealerships exist")
    fun shouldReturnEmptyListWhenNoDealershipsExist() {
        // Given
        `when`(dealershipRepository.findAll()).thenReturn(emptyList())

        // When
        val result = dealershipService.findAll()

        // Then
        assertTrue(result.isEmpty())
        verify(dealershipRepository).findAll()
    }

    // ========== findActive Tests ==========

    @Test
    @DisplayName("Should find only active dealerships")
    fun shouldFindOnlyActiveDealerships() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val activeDealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(activeDealerships)

        // When
        val result = dealershipService.findActive()

        // Then
        assertEquals(2, result.size)
        assertTrue(result.all { it.active })
        verify(dealershipRepository).findByActiveTrue()
    }

    // ========== findByCuit Tests ==========

    @Test
    @DisplayName("Should find dealership by CUIT")
    fun shouldFindDealershipByCuit() {
        // Given
        `when`(dealershipRepository.findByCuit("20123456789")).thenReturn(validDealership)

        // When
        val result = dealershipService.findByCuit("20123456789")

        // Then
        assertNotNull(result)
        assertEquals("20123456789", result?.cuit)
        verify(dealershipRepository).findByCuit("20123456789")
    }

    @Test
    @DisplayName("Should return null when dealership not found by CUIT")
    fun shouldReturnNullWhenDealershipNotFoundByCuit() {
        // Given
        `when`(dealershipRepository.findByCuit("99999999999")).thenReturn(null)

        // When
        val result = dealershipService.findByCuit("99999999999")

        // Then
        assertNull(result)
        verify(dealershipRepository).findByCuit("99999999999")
    }

    // ========== findByEmail Tests ==========

    @Test
    @DisplayName("Should find dealership by email")
    fun shouldFindDealershipByEmail() {
        // Given
        `when`(dealershipRepository.findByEmail("contact@automax.com")).thenReturn(validDealership)

        // When
        val result = dealershipService.findByEmail("contact@automax.com")

        // Then
        assertNotNull(result)
        assertEquals("contact@automax.com", result?.email)
        verify(dealershipRepository).findByEmail("contact@automax.com")
    }

    @Test
    @DisplayName("Should return null when dealership not found by email")
    fun shouldReturnNullWhenDealershipNotFoundByEmail() {
        // Given
        `when`(dealershipRepository.findByEmail("notfound@test.com")).thenReturn(null)

        // When
        val result = dealershipService.findByEmail("notfound@test.com")

        // Then
        assertNull(result)
        verify(dealershipRepository).findByEmail("notfound@test.com")
    }

    @Test
    @DisplayName("Should throw exception when email is blank")
    fun shouldThrowExceptionWhenEmailIsBlank() {
        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.findByEmail("")
            }
        assertEquals("Email cannot be empty", exception.message)
        verify(dealershipRepository, never()).findByEmail("")
    }

    // ========== searchDealerships Tests ==========

    @Test
    @DisplayName("Should search dealerships by business name")
    fun shouldSearchDealershipsByBusinessName() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(dealerships)

        val filters = DealershipSearchFilters(businessName = "AutoMax")

        // When
        val result = dealershipService.searchDealerships(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("AutoMax S.A.", result[0].businessName)
    }

    @Test
    @DisplayName("Should search dealerships by city")
    fun shouldSearchDealershipsByCity() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                city = "Rosario"
                province = "Santa Fe"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(dealerships)

        val filters = DealershipSearchFilters(city = "Buenos Aires")

        // When
        val result = dealershipService.searchDealerships(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Buenos Aires", result[0].city)
    }

    @Test
    @DisplayName("Should search dealerships by province")
    fun shouldSearchDealershipsByProvince() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                city = "Rosario"
                province = "Santa Fe"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(dealerships)

        val filters = DealershipSearchFilters(province = "Santa Fe")

        // When
        val result = dealershipService.searchDealerships(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("Santa Fe", result[0].province)
    }

    @Test
    @DisplayName("Should search dealerships by CUIT")
    fun shouldSearchDealershipsByCuit() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(dealerships)

        val filters = DealershipSearchFilters(cuit = "20123456")

        // When
        val result = dealershipService.searchDealerships(filters)

        // Then
        assertEquals(1, result.size)
        assertEquals("20123456789", result[0].cuit)
    }

    @Test
    @DisplayName("Should return all active dealerships when no filters applied")
    fun shouldReturnAllDealershipsWhenNoFilters() {
        // Given
        val dealership2 =
            Dealership().apply {
                id = 2L
                businessName = "CarWorld S.R.L."
                cuit = "20987654321"
                email = "info@carworld.com"
                phone = "9876543210"
                firstName = "María"
                lastName = "González"
                active = true
                registrationDate = LocalDateTime.now()
            }
        val dealerships = listOf(validDealership, dealership2)
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(dealerships)

        val filters = DealershipSearchFilters()

        // When
        val result = dealershipService.searchDealerships(filters)

        // Then
        assertEquals(2, result.size)
    }

    @Test
    @DisplayName("Should throw exception when business name filter is blank")
    fun shouldThrowExceptionWhenBusinessNameFilterIsBlank() {
        // Given
        `when`(dealershipRepository.findByActiveTrue()).thenReturn(listOf(validDealership))

        val filters = DealershipSearchFilters(businessName = "")

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            dealershipService.searchDealerships(filters)
        }
    }

    // ========== createDealership Tests ==========

    @Test
    @DisplayName("Should create dealership successfully")
    fun shouldCreateDealership() {
        // Given
        val request =
            DealershipCreateRequest(
                businessName = "NewAuto S.A.",
                cuit = "20111222333",
                email = "contact@newauto.com",
                password = "PasswordExample",
                phone = "1122334455",
                address = "Calle Falsa 123",
                city = "Córdoba",
                province = "Córdoba",
                description = "New dealership",
                firstName = "Carlos",
                lastName = "López",
            )

        val savedDealership =
            Dealership().apply {
                id = 3L
                businessName = "NewAuto S.A."
                cuit = "20111222333"
                email = "contact@newauto.com"
                phone = "1122334455"
                address = "Calle Falsa 123"
                city = "Córdoba"
                province = "Córdoba"
                description = "New dealership"
                firstName = "Carlos"
                lastName = "López"
                active = true
                registrationDate = LocalDateTime.now()
            }

        `when`(dealershipRepository.findByCuit("20111222333")).thenReturn(null)
        `when`(dealershipRepository.findByEmail("contact@newauto.com")).thenReturn(null)
        `when`(passwordEncoder.encode(any())).thenReturn("encodedPassword123")
        `when`(dealershipRepository.save(any(Dealership::class.java))).thenReturn(savedDealership)

        // When
        val result = dealershipService.createDealership(request)

        // Then
        assertNotNull(result)
        assertEquals(3L, result.id)
        assertEquals("NewAuto S.A.", result.businessName)
        verify(dealershipRepository).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating dealership with existing CUIT")
    fun shouldThrowExceptionWhenCuitAlreadyExists() {
        // Given
        val request =
            DealershipCreateRequest(
                businessName = "NewAuto S.A.",
                cuit = "20123456789",
                email = "contact@newauto.com",
                password = "example",
                phone = "1122334455",
                firstName = "Carlos",
                lastName = "López",
            )

        `when`(dealershipRepository.findByCuit("20123456789")).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.createDealership(request)
            }
        assertEquals("Dealership with CUIT 20123456789 already exists", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating dealership with existing email")
    fun shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        val request =
            DealershipCreateRequest(
                businessName = "NewAuto S.A.",
                cuit = "20111222333",
                email = "contact@automax.com",
                password = "example",
                phone = "1122334455",
                firstName = "Carlos",
                lastName = "López",
            )

        `when`(dealershipRepository.findByCuit("20111222333")).thenReturn(null)
        `when`(dealershipRepository.findByEmail("contact@automax.com")).thenReturn(validDealership)

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.createDealership(request)
            }
        assertEquals("Dealership with email contact@automax.com already exists", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    // ========== updateDealership Tests ==========

    @Test
    @DisplayName("Should update dealership successfully with all fields")
    fun shouldUpdateDealershipWithAllFields() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(dealershipRepository.save(any(Dealership::class.java))).thenReturn(validDealership)

        val updates =
            mapOf(
                "businessName" to "AutoMax Premium S.A.",
                "email" to "premium@automax.com",
                "phone" to "1199887766",
                "address" to "Av. Libertador 5000",
                "city" to "CABA",
                "province" to "Buenos Aires",
                "description" to "Premium dealership updated",
                "active" to "false",
            )

        // When
        val result = dealershipService.updateDealership(1L, updates)

        // Then
        assertEquals("AutoMax Premium S.A.", result.businessName)
        assertEquals("premium@automax.com", result.email)
        assertEquals("1199887766", result.phone)
        assertEquals("Av. Libertador 5000", result.address)
        assertEquals("CABA", result.city)
        assertEquals("Buenos Aires", result.province)
        assertEquals("Premium dealership updated", result.description)
        assertFalse(result.active)
        verify(dealershipRepository).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should update only provided fields")
    fun shouldUpdateOnlyProvidedFields() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(dealershipRepository.save(any(Dealership::class.java))).thenReturn(validDealership)

        val originalBusinessName = validDealership.businessName
        val originalEmail = validDealership.email

        val updates = mapOf("phone" to "9998887777")

        // When
        val result = dealershipService.updateDealership(1L, updates)

        // Then
        assertEquals("9998887777", result.phone)
        assertEquals(originalBusinessName, result.businessName)
        assertEquals(originalEmail, result.email)
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent dealership")
    fun shouldThrowExceptionWhenUpdatingNonExistentDealership() {
        // Given
        `when`(dealershipRepository.findById(999L)).thenReturn(Optional.empty())

        val updates = mapOf("phone" to "1234567890")

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                dealershipService.updateDealership(999L, updates)
            }
        assertEquals("Dealership with ID 999 not found", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when update data is empty")
    fun shouldThrowExceptionWhenUpdateDataIsEmpty() {
        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.updateDealership(1L, emptyMap())
            }
        assertEquals("Update data cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when dealership ID is not positive")
    fun shouldThrowExceptionWhenIdIsNotPositive() {
        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.updateDealership(0L, mapOf("phone" to "1234567890"))
            }
        assertEquals("Dealership ID must be positive", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when business name is blank in update")
    fun shouldThrowExceptionWhenBusinessNameIsBlankInUpdate() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        val updates = mapOf("businessName" to "")

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.updateDealership(1L, updates)
            }
        assertEquals("Business name cannot be empty", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when email is blank in update")
    fun shouldThrowExceptionWhenEmailIsBlankInUpdate() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        val updates = mapOf("email" to "")

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.updateDealership(1L, updates)
            }
        assertEquals("Email cannot be empty", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when active value is invalid")
    fun shouldThrowExceptionWhenActiveValueIsInvalid() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        val updates = mapOf("active" to "invalid")

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.updateDealership(1L, updates)
            }
        assertEquals("Invalid boolean value for active field", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    // ========== deactivate Tests ==========

    @Test
    @DisplayName("Should deactivate dealership successfully")
    fun shouldDeactivateDealership() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(dealershipRepository.save(any(Dealership::class.java))).thenReturn(validDealership)

        // When
        val result = dealershipService.deactivate(1L)

        // Then
        assertFalse(result.active)
        verify(dealershipRepository).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when deactivating already inactive dealership")
    fun shouldThrowExceptionWhenDeactivatingInactiveDealership() {
        // Given
        validDealership.active = false
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception =
            assertThrows(IllegalStateException::class.java) {
                dealershipService.deactivate(1L)
            }
        assertEquals("Dealership is already deactivated", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    // ========== activate Tests ==========

    @Test
    @DisplayName("Should activate dealership successfully")
    fun shouldActivateDealership() {
        // Given
        validDealership.active = false
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(dealershipRepository.save(any(Dealership::class.java))).thenReturn(validDealership)

        // When
        val result = dealershipService.activate(1L)

        // Then
        assertTrue(result.active)
        verify(dealershipRepository).save(any(Dealership::class.java))
    }

    @Test
    @DisplayName("Should throw exception when activating already active dealership")
    fun shouldThrowExceptionWhenActivatingActiveDealership() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))

        // When & Then
        val exception =
            assertThrows(IllegalStateException::class.java) {
                dealershipService.activate(1L)
            }
        assertEquals("Dealership is already active", exception.message)
        verify(dealershipRepository, never()).save(any(Dealership::class.java))
    }

    // ========== deleteDealership Tests ==========

    @Test
    @DisplayName("Should delete dealership successfully without car offers")
    fun shouldDeleteDealershipWithoutCarOffers() {
        // Given
        `when`(dealershipRepository.findById(1L)).thenReturn(Optional.of(validDealership))
        `when`(carOfferRepository.findByDealershipId(1L)).thenReturn(emptyList())
        doNothing().`when`(dealershipRepository).delete(any(Dealership::class.java))

        // When
        dealershipService.deleteDealership(1L)

        // Then
        verify(dealershipRepository).findById(1L)
        verify(carOfferRepository).findByDealershipId(1L)
        verify(dealershipRepository).delete(validDealership)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent dealership")
    fun shouldThrowExceptionWhenDeletingNonExistentDealership() {
        // Given
        `when`(dealershipRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                dealershipService.deleteDealership(999L)
            }
        assertEquals("Dealership with ID 999 not found", exception.message)
        verify(dealershipRepository, never()).delete(any(Dealership::class.java))
        verify(carOfferRepository, never()).findByDealershipId(999L)
    }

    @Test
    @DisplayName("Should throw exception when deleting with invalid ID")
    fun shouldThrowExceptionWhenDeletingWithInvalidId() {
        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                dealershipService.deleteDealership(0L)
            }
        assertEquals("Dealership ID must be positive", exception.message)
        verify(dealershipRepository, never()).findById(0L)
        verify(carOfferRepository, never()).findByDealershipId(0L)
    }
}
