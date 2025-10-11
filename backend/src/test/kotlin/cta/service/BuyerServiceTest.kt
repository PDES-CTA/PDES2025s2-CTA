package cta.service

import cta.model.Buyer
import cta.repository.BuyerRepository
import org.junit.jupiter.api.Assertions.*
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
import java.util.Optional

@ExtendWith(MockitoExtension::class)
@DisplayName("BuyerService Tests")
class BuyerServiceTest {
    @Mock
    private lateinit var buyerRepository: BuyerRepository

    @InjectMocks
    private lateinit var buyerService: BuyerService

    private lateinit var validBuyer: Buyer

    @BeforeEach
    fun setup() {
        validBuyer =
            Buyer().apply {
                id = 1L
                email = "buyer@example.com"
                password = "password123"
                firstName = "John"
                lastName = "Doe"
                phone = "+54 11 1234-5678"
                address = "Av. Corrientes 1234"
                dni = 12345678
                active = true
            }
    }

    // ========== findById Tests ==========

    @Test
    @DisplayName("Should find buyer by id successfully")
    fun shouldFindBuyerById() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))

        // When
        val result = buyerService.findById(1L)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals("John", result.firstName)
        assertEquals("Doe", result.lastName)
        verify(buyerRepository).findById(1L)
    }

    @Test
    @DisplayName("Should throw exception when buyer not found")
    fun shouldThrowExceptionWhenBuyerNotFound() {
        // Given
        `when`(buyerRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(NoSuchElementException::class.java) {
                buyerService.findById(999L)
            }
        assertEquals("Buyer with ID 999 not found", exception.message)
        verify(buyerRepository).findById(999L)
    }

    // ========== createBuyer Tests ==========

    @Test
    @DisplayName("Should create buyer successfully")
    fun shouldCreateBuyer() {
        // Given
        val newBuyer =
            Buyer().apply {
                email = "newbuyer@example.com"
                password = "password123"
                firstName = "Jane"
                lastName = "Smith"
                phone = "+54 11 9999-9999"
                address = "Calle Florida 500"
                dni = 87654321
                active = true
            }
        val savedBuyer = newBuyer.apply { id = 2L }

        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(savedBuyer)

        // When
        val result = buyerService.createBuyer(newBuyer)

        // Then
        assertNotNull(result)
        assertEquals(2L, result.id)
        assertEquals("Jane", result.firstName)
        assertEquals("newbuyer@example.com", result.email)
        verify(buyerRepository).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating buyer with blank address")
    fun shouldThrowExceptionWhenAddressIsBlank() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = ""
                dni = 12345678
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("Address cannot be empty", exception.message)
        verify(buyerRepository, never()).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should throw exception when creating buyer with whitespace-only address")
    fun shouldThrowExceptionWhenAddressIsWhitespace() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = "   "
                dni = 12345678
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("Address cannot be empty", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when creating buyer with zero DNI")
    fun shouldThrowExceptionWhenDniIsZero() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = "Valid Address"
                dni = 0
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("DNI must be a positive number", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when creating buyer with negative DNI")
    fun shouldThrowExceptionWhenDniIsNegative() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = "Valid Address"
                dni = -12345678
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("DNI must be a positive number", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when DNI has less than 7 digits")
    fun shouldThrowExceptionWhenDniHasLessThan7Digits() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = "Valid Address"
                dni = 123456 // 6 digits
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("DNI must be 7 or 8 digits", exception.message)
    }

    @Test
    @DisplayName("Should throw exception when DNI has more than 8 digits")
    fun shouldThrowExceptionWhenDniHasMoreThan8Digits() {
        // Given
        val invalidBuyer =
            Buyer().apply {
                address = "Valid Address"
                dni = 123456789 // 9 digits
            }

        // When & Then
        val exception =
            assertThrows(IllegalArgumentException::class.java) {
                buyerService.createBuyer(invalidBuyer)
            }
        assertEquals("DNI must be 7 or 8 digits", exception.message)
    }

    @Test
    @DisplayName("Should accept DNI with 7 digits")
    fun shouldAcceptDniWith7Digits() {
        // Given
        val buyer =
            Buyer().apply {
                address = "Valid Address"
                dni = 1234567 // 7 digits - valid
            }
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(buyer)

        // When
        val result = buyerService.createBuyer(buyer)

        // Then
        assertNotNull(result)
        verify(buyerRepository).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should accept DNI with 8 digits")
    fun shouldAcceptDniWith8Digits() {
        // Given
        val buyer =
            Buyer().apply {
                address = "Valid Address"
                dni = 12345678 // 8 digits - valid
            }
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(buyer)

        // When
        val result = buyerService.createBuyer(buyer)

        // Then
        assertNotNull(result)
        verify(buyerRepository).save(any(Buyer::class.java))
    }

    // ========== updateBuyer Tests ==========

    @Test
    @DisplayName("Should update buyer successfully with all fields")
    fun shouldUpdateBuyerWithAllFields() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(validBuyer)

        val updates =
            mapOf(
                "dni" to 87654321,
                "address" to "New Address 123",
                "email" to "newemail@example.com",
                "phone" to "+54 11 8888-8888",
                "active" to false,
            )

        // When
        val result = buyerService.updateBuyer(1L, updates)

        // Then
        assertEquals(87654321, result.dni)
        assertEquals("New Address 123", result.address)
        assertEquals("newemail@example.com", result.email)
        assertEquals("+54 11 8888-8888", result.phone)
        assertFalse(result.active)
        verify(buyerRepository).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should update only provided fields")
    fun shouldUpdateOnlyProvidedFields() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(validBuyer)

        val originalEmail = validBuyer.email
        val originalPhone = validBuyer.phone

        val updates =
            mapOf(
                "address" to "Updated Address Only",
            )

        // When
        val result = buyerService.updateBuyer(1L, updates)

        // Then
        assertEquals("Updated Address Only", result.address)
        assertEquals(originalEmail, result.email)
        assertEquals(originalPhone, result.phone)
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent buyer")
    fun shouldThrowExceptionWhenUpdatingNonExistentBuyer() {
        // Given
        `when`(buyerRepository.findById(999L)).thenReturn(Optional.empty())

        val updates = mapOf("address" to "New Address")

        // When & Then
        val exception =
            assertThrows(Exception::class.java) {
                buyerService.updateBuyer(999L, updates)
            }
        assertEquals("Favorite car with ID 999 not found", exception.message)
        verify(buyerRepository, never()).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should validate buyer when updating with invalid data")
    fun shouldValidateWhenUpdatingWithInvalidData() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))

        val updates =
            mapOf(
                "dni" to 123, // Invalid - less than 7 digits
            )

        // When & Then
        assertThrows(IllegalArgumentException::class.java) {
            buyerService.updateBuyer(1L, updates)
        }
        verify(buyerRepository, never()).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should update active status correctly")
    fun shouldUpdateActiveStatus() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(validBuyer)

        val updates = mapOf("active" to "false")

        // When
        val result = buyerService.updateBuyer(1L, updates)

        // Then
        assertFalse(result.active)
    }

    // ========== deleteBuyer Tests ==========

    @Test
    @DisplayName("Should delete buyer successfully")
    fun shouldDeleteBuyer() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        doNothing().`when`(buyerRepository).delete(any(Buyer::class.java))

        // When
        buyerService.deleteBuyer(1L)

        // Then
        verify(buyerRepository).findById(1L)
        verify(buyerRepository).delete(validBuyer)
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent buyer")
    fun shouldThrowExceptionWhenDeletingNonExistentBuyer() {
        // Given
        `when`(buyerRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        val exception =
            assertThrows(Exception::class.java) {
                buyerService.deleteBuyer(999L)
            }
        assertEquals("Favorite car with ID 999 not found", exception.message)
        verify(buyerRepository, never()).delete(any(Buyer::class.java))
    }

    // ========== Edge Cases ==========

    @Test
    @DisplayName("Should handle empty update map")
    fun shouldHandleEmptyUpdateMap() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(validBuyer)

        val originalDni = validBuyer.dni
        val originalAddress = validBuyer.address

        // When
        val result = buyerService.updateBuyer(1L, emptyMap())

        // Then
        assertEquals(originalDni, result.dni)
        assertEquals(originalAddress, result.address)
        verify(buyerRepository).save(any(Buyer::class.java))
    }

    @Test
    @DisplayName("Should convert string DNI to integer when updating")
    fun shouldConvertStringDniToInteger() {
        // Given
        `when`(buyerRepository.findById(1L)).thenReturn(Optional.of(validBuyer))
        `when`(buyerRepository.save(any(Buyer::class.java))).thenReturn(validBuyer)

        val updates = mapOf("dni" to "87654321")

        // When
        val result = buyerService.updateBuyer(1L, updates)

        // Then
        assertEquals(87654321, result.dni)
    }
}
